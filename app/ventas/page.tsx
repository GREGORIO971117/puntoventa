'use client';

import { useState, useEffect } from 'react';
import { CatalogoProductos } from '@/components/pos/CatalogoProductos';
import { TicketVenta } from '@/components/pos/TicketVenta';
import { ProductoBase, ItemCarrito } from '@/types';
import { obtenerInventario, obtenerSucursales, registrarVentaBD } from '@/app/actions';
import { useSession } from 'next-auth/react';
import BarcodeScanner from '@/components/pos/BarcodeScanner';

export default function VentasPage() {
    const { data: session } = useSession();

    const [inventario, setInventario] = useState<any[]>([]);
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [sucursalActiva, setSucursalActiva] = useState<string>('');
    const [mostrarCamara, setMostrarCamara] = useState(false);

    const cargarDatos = async () => {
        setCargando(true);
        const [datosInventario, datosSucursales] = await Promise.all([
            obtenerInventario(),
            obtenerSucursales()
        ]);

        const sucursalesFisicas = datosSucursales.filter((s: any) => s.rol !== 'admin');
        setInventario(datosInventario);
        setSucursales(sucursalesFisicas);

        if (session?.user?.name && session?.user?.name !== 'Admin General') {
            setSucursalActiva(session.user.name);
        } else if (sucursalesFisicas.length > 0) {
            setSucursalActiva(sucursalesFisicas[0].nombre);
        }

        setCargando(false);
    };

    useEffect(() => {
        cargarDatos();
    }, [session]);

    const agregarProducto = (producto: ProductoBase) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.id === producto.id);
            if (existe) return prev.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const restarProducto = (idProducto: string | number) => {
        setCarrito((prev) => prev.map((item) => item.id === idProducto && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item));
    };

    const eliminarProducto = (idProducto: string | number) => setCarrito((prev) => prev.filter((item) => item.id !== idProducto));
    const vaciarCarrito = () => setCarrito([]);

    const cobrarTicket = async () => {
        if (!sucursalActiva) return alert("Error: No hay sucursal seleccionada");
        if (carrito.length === 0) return alert("El carrito está vacío");

        setProcesandoPago(true);
        const resultado = await registrarVentaBD(sucursalActiva, 'Efectivo', carrito);

        if (resultado.success) {
            vaciarCarrito();
            await cargarDatos();
            alert('✅ ¡Venta registrada con éxito!');
        } else {
            alert(resultado.error);
        }
        setProcesandoPago(false);
    };

    const totalPagar = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    const productosDisponibles = inventario.filter(item => item.sucursal === sucursalActiva && item.stock > 0);

    const manejarCodigoEscaneado = (codigoLeido: string) => {
        const productoEncontrado = productosDisponibles.find(p => p.codigoBarras === codigoLeido);

        if (productoEncontrado) {
            agregarProducto(productoEncontrado);
        } else {
            alert(`⚠️ El producto con código ${codigoLeido} no está registrado, no pertenece a esta sucursal, o ya no tiene stock.`);
        }
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <div className="text-slate-500 font-bold text-lg">Abriendo caja y cargando catálogo...</div>
            </div>
        );
    }

    const esAdmin = session?.user?.name === 'Admin General';

    return (
        <main className="flex flex-col lg:flex-row h-[calc(100dvh-64px)] bg-slate-50 font-sans overflow-hidden">

            {/* =========================================================
                LADO IZQUIERDO: CONTROLES Y CATÁLOGO
            ========================================================= */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* Header Fijo */}
                <div className="p-4 bg-white shadow-sm z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                            Terminal de Caja
                        </h1>
                        <div className="flex items-center w-full sm:w-auto bg-slate-100 rounded-lg p-1">
                            <span className="text-sm text-slate-500 font-semibold pl-3 pr-2">📍</span>
                            <select
                                value={sucursalActiva}
                                disabled={!esAdmin}
                                onChange={(e) => { setSucursalActiva(e.target.value); vaciarCarrito(); }}
                                className={`w-full bg-transparent border-none focus:ring-0 py-1.5 text-sm font-bold outline-none ${!esAdmin ? 'text-slate-500 cursor-not-allowed opacity-80' : 'text-blue-700 cursor-pointer'}`}
                            >
                                {sucursales.map(sucursal => (
                                    <option key={sucursal.id} value={sucursal.nombre}>
                                        {sucursal.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Botón de Escáner */}
                    <button
                        onClick={() => setMostrarCamara(!mostrarCamara)}
                        className={`w-full py-3 rounded-xl font-bold text-white text-center shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${mostrarCamara
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                            }`}
                    >
                        {mostrarCamara ? (
                            <><span>❌</span> Cerrar Escáner</>
                        ) : (
                            <><span>📷</span> Escanear Código de Barras</>
                        )}
                    </button>

                    {/* Ventana de la Cámara */}
                    {mostrarCamara && (
                        <div className="mt-4 p-2 bg-slate-50 border-2 border-emerald-400 rounded-2xl shadow-inner overflow-hidden">
                            <BarcodeScanner onScanSuccess={manejarCodigoEscaneado} />
                        </div>
                    )}
                </div>

                {/* Catálogo con su propio scroll independiente */}
                <div className="flex-1 overflow-y-auto p-4 pb-10">
                    <CatalogoProductos productos={productosDisponibles} onAgregarProducto={agregarProducto} />
                </div>
            </div>

            {/* =========================================================
                LADO DERECHO: TICKET DE VENTA (Carrito)
            ========================================================= */}
            {/* En móvil toma el 45% inferior de la pantalla y parece flotar. En PC es una barra lateral completa */}
            <div className="w-full h-[45dvh] lg:h-full lg:w-[420px] bg-white lg:border-l border-slate-200 z-20 flex flex-col relative shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.15)] lg:shadow-2xl rounded-t-3xl lg:rounded-none transition-all">

                {/* Overlay de Carga de Pago */}
                {procesandoPago && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-t-3xl lg:rounded-none">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4 shadow-lg"></div>
                        <p className="font-extrabold text-blue-800 text-lg animate-pulse">Procesando pago...</p>
                    </div>
                )}

                {/* Contenedor interno del Ticket (Debe poder scrollear por dentro) */}
                <div className="flex-1 overflow-hidden p-2 lg:p-4">
                    <TicketVenta
                        carrito={carrito}
                        totalPagar={totalPagar}
                        onAgregar={agregarProducto}
                        onRestar={restarProducto}
                        onEliminar={eliminarProducto}
                        onVaciarCarrito={vaciarCarrito}
                        onCobrar={cobrarTicket}
                    />
                </div>
            </div>
        </main>
    );
}