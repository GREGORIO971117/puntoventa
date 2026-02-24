'use client';

import { useState } from 'react';
import { CatalogoProductos, Producto } from '@/components/pos/CatalogoProductos';
import { TicketVenta, ItemCarrito } from '@/components/pos/TicketVenta';

export default function VentasPage() {
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    const agregarProducto = (producto: Producto) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.id === producto.id);
            if (existe) {
                return prev.map((item) =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const restarProducto = (idProducto: number) => {
        setCarrito((prev) => {
            return prev.map((item) => {
                if (item.id === idProducto && item.cantidad > 1) {
                    return { ...item, cantidad: item.cantidad - 1 };
                }
                return item;
            });
        });
    };

    const eliminarProducto = (idProducto: number) => {
        setCarrito((prev) => prev.filter((item) => item.id !== idProducto));
    };

    const vaciarCarrito = () => setCarrito([]);

    const totalPagar = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);

    return (
        <main className="flex flex-col lg:flex-row h-screen bg-slate-100 overflow-hidden">

            <div className="flex-1 flex flex-col h-[60vh] lg:h-full overflow-hidden p-4">
                <CatalogoProductos onAgregarProducto={agregarProducto} />
            </div>

            <div className="w-full lg:w-[400px] h-[40vh] lg:h-full bg-white shadow-2xl lg:border-l border-slate-200 z-10 flex flex-col">
                <TicketVenta
                    carrito={carrito}
                    totalPagar={totalPagar}
                    onAgregar={agregarProducto}
                    onRestar={restarProducto}
                    onEliminar={eliminarProducto}
                    onVaciarCarrito={vaciarCarrito}
                />
            </div>

        </main>
    );
}