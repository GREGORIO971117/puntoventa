import React from 'react';
import { Search, PackageOpen } from "lucide-react";
import { ProductoBase } from '@/types';

interface CatalogoProps {
    productos: ProductoBase[]; // 👈 Ahora recibe los productos reales
    onAgregarProducto: (producto: ProductoBase) => void;
}

export function CatalogoProductos({ productos, onAgregarProducto }: CatalogoProps) {
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PackageOpen className="text-blue-600" />
                    Catálogo Rápido
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-slate-50 custom-scrollbar">
                {productos.length === 0 ? (
                    <p className="text-center text-slate-400 mt-10">No hay productos con stock en esta sucursal.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                        {productos.map((prod) => (
                            <button
                                key={prod.id}
                                onClick={() => onAgregarProducto(prod)}
                                className="group flex flex-col items-start text-left bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.97]"
                            >
                                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md mb-2">
                                    {prod.categoria}
                                </span>
                                <span className="font-semibold text-slate-700 text-sm leading-tight h-10 line-clamp-2 group-hover:text-blue-700 transition-colors">
                                    {prod.nombre}
                                </span>
                                <span className="text-xl font-black text-slate-800 mt-auto pt-2">
                                    ${prod.precio.toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}