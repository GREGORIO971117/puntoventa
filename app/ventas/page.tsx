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
        // ... (Tu código de cobro se queda exactamente igual)
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

    // 📷 NUEVO: 3. La lógica que reacciona al leer el código de barras
    const manejarCodigoEscaneado = (codigoLeido: string) => {
        // Buscamos directamente en los productos disponibles de ESA sucursal
        const productoEncontrado = productosDisponibles.find(p => p.codigoBarras === codigoLeido);

        if (productoEncontrado) {
            agregarProducto(productoEncontrado);
            // Opcional: Descomenta la siguiente línea si quieres que suene un "beep"
            // new Audio('https://www.soundjay.com/buttons/beep-07.wav').play().catch(()=>console.log('Audio bloqueado'));
        } else {
            alert(`⚠️ El producto con código ${codigoLeido} no está registrado, no pertenece a esta sucursal, o ya no tiene stock.`);
        }
    };

    if (cargando) {
        return <div className="p-10 text-center text-slate-500 font-bold mt-20">Abriendo caja y cargando catálogo...</div>;
    }

    const esAdmin = session?.user?.name === 'Admin General';

    return (
        <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
            <div className="flex-1 flex flex-col h-[60vh] lg:h-full overflow-hidden p-4">

                <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <span className="font-bold text-slate-700">Terminal de Caja</span>

                    <select
                        value={sucursalActiva}
                        disabled={!esAdmin}
                        onChange={(e) => { setSucursalActiva(e.target.value); vaciarCarrito(); }}
                        className={`bg-slate-50 border border-slate-200 rounded-md px-3 py-1 text-sm font-semibold outline-none ${!esAdmin ? 'text-slate-500 cursor-not-allowed opacity-70' : 'text-blue-700 cursor-pointer'}`}
                    >
                        {sucursales.map(sucursal => (
                            <option key={sucursal.id} value={sucursal.nombre}>
                                📍 {sucursal.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 📷 NUEVO: 4. El botón y el cuadro de la cámara */}
                <div className="mb-4">
                    <button
                        onClick={() => setMostrarCamara(!mostrarCamara)}
                        className={`w-full lg:w-auto px-4 py-2 font-bold text-white rounded shadow transition-colors ${mostrarCamara ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {mostrarCamara ? "Cerrar Escáner 📷" : "Escanear Código 📷"}
                    </button>

                    {mostrarCamara && (
                        <div className="mt-4 p-2 bg-white border-2 border-green-200 rounded-xl shadow">
                            <BarcodeScanner onScanSuccess={manejarCodigoEscaneado} />
                        </div>
                    )}
                </div>

                <CatalogoProductos productos={productosDisponibles} onAgregarProducto={agregarProducto} />
            </div>

            <div className="w-full lg:w-[400px] h-[40vh] lg:h-full bg-white shadow-2xl lg:border-l border-slate-200 z-10 flex flex-col relative">
                {procesandoPago && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                        <p className="font-bold text-blue-800">Procesando pago...</p>
                    </div>
                )}

                <TicketVenta
                    carrito={carrito} totalPagar={totalPagar}
                    onAgregar={agregarProducto} onRestar={restarProducto}
                    onEliminar={eliminarProducto} onVaciarCarrito={vaciarCarrito}
                    onCobrar={cobrarTicket}
                />
            </div>
        </main>
    );
}