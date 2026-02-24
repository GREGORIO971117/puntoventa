'use client';

import { useState, useEffect } from 'react';
import { CatalogoProductos } from '@/components/pos/CatalogoProductos';
import { TicketVenta } from '@/components/pos/TicketVenta';
import { ProductoBase, ItemCarrito, NombreSucursal } from '@/types';
import { useApp } from '@/context/AppContext';

export default function VentasPage() {
    // 👈 1. Traemos las sucursales del contexto
    const { inventario, registrarVenta, sucursales } = useApp();

    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    // 👈 2. Inicializamos la caja con la primera sucursal que exista en la base de datos
    const [sucursalActiva, setSucursalActiva] = useState<NombreSucursal>(
        sucursales.length > 0 ? sucursales[0].nombre : ''
    );

    const agregarProducto = (producto: ProductoBase) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.id === producto.id);
            if (existe) return prev.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const restarProducto = (idProducto: number) => {
        setCarrito((prev) => prev.map((item) => item.id === idProducto && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item));
    };

    const eliminarProducto = (idProducto: number) => setCarrito((prev) => prev.filter((item) => item.id !== idProducto));
    const vaciarCarrito = () => setCarrito([]);

    const cobrarTicket = () => {
        if (!sucursalActiva) return alert("Error: No hay sucursal seleccionada");
        registrarVenta(sucursalActiva, 'Efectivo', carrito);
        vaciarCarrito();
        alert('✅ ¡Venta registrada con éxito!\nRevisa las pantallas de Inventario y Reportes.');
    };

    const totalPagar = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    const productosDisponibles = inventario.filter(item => item.sucursal === sucursalActiva && item.stock > 0);

    return (
        <main className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
            <div className="flex-1 flex flex-col h-[60vh] lg:h-full overflow-hidden p-4">

                <div className="mb-4 flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <span className="font-bold text-slate-700">Terminal de Caja</span>
                    <select
                        value={sucursalActiva}
                        onChange={(e) => { setSucursalActiva(e.target.value as NombreSucursal); vaciarCarrito(); }}
                        className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1 text-sm font-semibold text-blue-700 outline-none cursor-pointer"
                    >
                        {/* 👈 3. Dibujamos las opciones dinámicamente */}
                        {sucursales.map(sucursal => (
                            <option key={sucursal.id} value={sucursal.nombre}>
                                📍 {sucursal.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <CatalogoProductos productos={productosDisponibles} onAgregarProducto={agregarProducto} />
            </div>

            <div className="w-full lg:w-[400px] h-[40vh] lg:h-full bg-white shadow-2xl lg:border-l border-slate-200 z-10 flex flex-col">
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