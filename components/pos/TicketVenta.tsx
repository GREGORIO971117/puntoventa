import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react"; // Importamos los iconos

export type ItemCarrito = {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
};

interface TicketProps {
    carrito: ItemCarrito[];
    totalPagar: number;
    onAgregar: (item: any) => void;
    onRestar: (id: number) => void;
    onEliminar: (id: number) => void;
    onVaciarCarrito: () => void;
}

export function TicketVenta({ carrito, totalPagar, onAgregar, onRestar, onEliminar, onVaciarCarrito }: TicketProps) {
    return (
        <section className="flex flex-col h-full p-4 lg:p-6">

            <div className="flex items-center gap-2 mb-4 border-b pb-4">
                <ShoppingCart className="text-blue-600 w-6 h-6" />
                <h2 className="text-xl font-bold text-slate-800">Ticket Actual</h2>
                <span className="ml-auto bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-bold">
                    {carrito.reduce((acc, item) => acc + item.cantidad, 0)} items
                </span>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {carrito.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
                        <ShoppingCart className="w-16 h-16 mb-4 text-slate-300" />
                        <p>Selecciona productos del catálogo</p>
                    </div>
                ) : (
                    carrito.map((item) => (
                        <div key={item.id} className="group flex flex-col p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-slate-700 text-sm leading-tight">{item.nombre}</span>
                                <span className="font-bold text-slate-800 ml-2">${(item.cantidad * item.precio).toFixed(2)}</span>
                            </div>

                            {/* Controles de cantidad */}
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-slate-400">${item.precio.toFixed(2)} c/u</span>

                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                    <button onClick={() => onRestar(item.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-slate-700">{item.cantidad}</span>
                                    <button onClick={() => onAgregar(item)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>

                                    <button onClick={() => onEliminar(item.id)} className="w-7 h-7 ml-2 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Zona de Cobro Inferior */}
            <div className="pt-4 mt-2 border-t border-slate-200 bg-white">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-500 font-medium">Total a cobrar:</span>
                    <span className="text-4xl font-black text-blue-600">${totalPagar.toFixed(2)}</span>
                </div>

                <Button
                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                    disabled={carrito.length === 0}
                >
                    💳 Procesar Pago
                </Button>

                <Button
                    variant="ghost"
                    className="w-full mt-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={onVaciarCarrito}
                    disabled={carrito.length === 0}
                >
                    Vaciar Ticket
                </Button>
            </div>
        </section>
    );
}