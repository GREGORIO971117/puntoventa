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

    // 📱 NUEVO: Estado para controlar qué se ve en el celular
    const [verCarritoMovil, setVerCarritoMovil] = useState(false);

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
    const vaciarCarrito = () => {
        setCarrito([]);
        setVerCarritoMovil(false); // Regresar al catálogo si se vacía
    };

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
    const totalArticulos = carrito.reduce((total, item) => total + item.cantidad, 0);
    const productosDisponibles = inventario.filter(item => item.sucursal === sucursalActiva && item.stock > 0);

    const manejarCodigoEscaneado = (codigoLeido: string) => {
        const productoEncontrado = productosDisponibles.find(p => p.codigoBarras === codigoLeido);
        if (productoEncontrado) {
            agregarProducto(productoEncontrado);
        } else {
            alert(`⚠️ El producto con código ${codigoLeido} no está registrado o no tiene stock.`);
        }
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <div className="text-slate-500 font-bold text-lg">Abriendo caja...</div>
            </div>
        );
    }

    const esAdmin = session?.user?.name === 'Admin General';

    return (
        <main className="flex flex-col lg:flex-row h-[calc(100dvh-64px)] bg-slate-50 font-sans overflow-hidden">

            {/* =========================================================
                VISTA 1: CATÁLOGO DE PRODUCTOS (Se oculta en móvil si ves el carrito)
            ========================================================= */}
            <div className={`flex-1 flex flex-col overflow-hidden relative ${verCarritoMovil ? 'hidden lg:flex' : 'flex'}`}>

                <div className="p-4 bg-white shadow-sm z-10 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Terminal</h1>
                        <select
                            value={sucursalActiva}
                            disabled={!esAdmin}
                            onChange={(e) => { setSucursalActiva(e.target.value); vaciarCarrito(); }}
                            className={`bg-slate-100 border-none rounded-lg py-1 px-3 text-sm font-bold outline-none ${!esAdmin ? 'text-slate-500 opacity-80' : 'text-blue-700'}`}
                        >
                            {sucursales.map(s => <option key={s.id} value={s.nombre}>📍 {s.nombre}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => setMostrarCamara(!mostrarCamara)}
                        className={`w-full py-3 rounded-xl font-bold text-white text-center transition-all ${mostrarCamara ? 'bg-rose-500' : 'bg-emerald-600'}`}
                    >
                        {mostrarCamara ? "❌ Cerrar Escáner" : "📷 Escanear Código"}
                    </button>

                    {mostrarCamara && (
                        <div className="mt-4 p-2 bg-slate-50 border-2 border-emerald-400 rounded-xl overflow-hidden">
                            <BarcodeScanner onScanSuccess={manejarCodigoEscaneado} />
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
                    <CatalogoProductos productos={productosDisponibles} onAgregarProducto={agregarProducto} />
                </div>

                {/* 📱 BOTÓN FLOTANTE MÓVIL (Solo se ve en celulares) */}
                <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200">
                    <button
                        onClick={() => setVerCarritoMovil(true)}
                        className="w-full bg-blue-600 active:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 flex justify-between px-6 text-lg items-center"
                    >
                        <span className="flex items-center gap-2">🛒 Ver Carrito <span className="bg-white text-blue-600 text-sm px-2 py-0.5 rounded-full">{totalArticulos}</span></span>
                        <span>${totalPagar.toFixed(2)}</span>
                    </button>
                </div>
            </div>

            {/* =========================================================
                VISTA 2: CARRITO DE COMPRAS (Ocupa toda la pantalla en móvil)
            ========================================================= */}
            <div className={`w-full lg:w-[400px] h-full bg-white flex flex-col lg:border-l border-slate-200 z-20 shadow-2xl transition-all ${verCarritoMovil ? 'flex absolute inset-0 lg:relative' : 'hidden lg:flex'}`}>

                {/* 📱 Botón de regreso móvil */}
                <div className="lg:hidden p-4 border-b border-slate-200 bg-slate-50 flex items-center shadow-sm">
                    <button onClick={() => setVerCarritoMovil(false)} className="text-blue-600 font-bold flex items-center gap-2 py-2 px-4 bg-blue-100 rounded-full active:bg-blue-200">
                        ← Volver al Catálogo
                    </button>
                </div>

                {procesandoPago && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-blue-800">Procesando pago...</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2 lg:p-4 pb-10">
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