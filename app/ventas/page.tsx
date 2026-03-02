'use client';

import { useState, useEffect } from 'react';
import { CatalogoProductos } from '@/components/pos/CatalogoProductos';
import { TicketVenta } from '@/components/pos/TicketVenta';
import { ProductoBase, ItemCarrito } from '@/types';
// 👈 1. Importamos las acciones reales del servidor
import { obtenerInventario, obtenerSucursales, registrarVentaBD } from '@/app/actions';
import { useSession } from 'next-auth/react'; // Para saber qué cajero está logueado

export default function VentasPage() {
    // 👈 2. Traemos la sesión para saber de quién es la caja
    const { data: session } = useSession();

    const [inventario, setInventario] = useState<any[]>([]);
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [procesandoPago, setProcesandoPago] = useState(false);

    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [sucursalActiva, setSucursalActiva] = useState<string>('');

    // 👈 3. Cargamos los datos reales
    const cargarDatos = async () => {
        setCargando(true);
        const [datosInventario, datosSucursales] = await Promise.all([
            obtenerInventario(),
            obtenerSucursales()
        ]);

        const sucursalesFisicas = datosSucursales.filter((s: any) => s.rol !== 'admin');
        setInventario(datosInventario);
        setSucursales(sucursalesFisicas);

        // Lógica inteligente: Si es cajero, forzamos SU sucursal. Si es admin, mostramos la primera por defecto.
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

    // --- Lógica del Carrito (Se queda igual, porque solo vive en memoria del navegador) ---
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

    // 👈 4. Conectamos el botón de cobrar a la Base de Datos
    const cobrarTicket = async () => {
        if (!sucursalActiva) return alert("Error: No hay sucursal seleccionada");
        if (carrito.length === 0) return alert("El carrito está vacío");

        setProcesandoPago(true);

        const resultado = await registrarVentaBD(sucursalActiva, 'Efectivo', carrito);

        if (resultado.success) {
            vaciarCarrito();
            await cargarDatos(); // Recargamos para que los botones de los productos reflejen el nuevo stock
            alert('✅ ¡Venta registrada con éxito!');
        } else {
            alert(resultado.error);
        }

        setProcesandoPago(false);
    };

    const totalPagar = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    // Solo mostramos productos de la sucursal seleccionada que tengan stock > 0
    const productosDisponibles = inventario.filter(item => item.sucursal === sucursalActiva && item.stock > 0);

    if (cargando) {
        return <div className="p-10 text-center text-slate-500 font-bold mt-20">Abriendo caja y cargando catálogo...</div>;
    }

    // Identificamos si el que ve la pantalla es un Admin
    const esAdmin = session?.user?.name === 'Admin General';

    return (
        <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
            <div className="flex-1 flex flex-col h-[60vh] lg:h-full overflow-hidden p-4">

                <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <span className="font-bold text-slate-700">Terminal de Caja</span>

                    {/* Solo permitimos cambiar de caja si es el Admin, el cajero se queda bloqueado en la suya */}
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

                <CatalogoProductos productos={productosDisponibles} onAgregarProducto={agregarProducto} />
            </div>

            <div className="w-full lg:w-[400px] h-[40vh] lg:h-full bg-white shadow-2xl lg:border-l border-slate-200 z-10 flex flex-col relative">

                {/* Pantalla de carga superpuesta cuando se está procesando el ticket */}
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