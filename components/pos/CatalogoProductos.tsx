'use client';

import { useState } from 'react';
import { Search, Plus, PackageOpen } from 'lucide-react';
import { ProductoBase } from '@/types';

interface CatalogoProps {
    productos: ProductoBase[];
    onAgregarProducto: (producto: ProductoBase) => void;
}

export function CatalogoProductos({ productos, onAgregarProducto }: CatalogoProps) {
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('Todas');

    // Extraemos las categorías únicas de los productos que nos llegan
    const categorias = ['Todas', ...Array.from(new Set(productos.map(p => p.categoria)))];

    // LA MAGIA DEL FILTRO: Se ejecuta en tiempo real mientras escribes o cambias de categoría
    const productosFiltrados = productos.filter((producto) => {
        const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = categoriaActiva === 'Todas' || producto.categoria === categoriaActiva;
        return coincideBusqueda && coincideCategoria;
    });

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Buscador y Filtros */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)} // 👈 Actualiza en tiempo real
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm transition-all"
                    />
                </div>

                {/* Filtros por Categoría */}
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoriaActiva(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${categoriaActiva === cat
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cuadrícula de Productos */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/50 custom-scrollbar">
                {productosFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <PackageOpen className="w-12 h-12 text-slate-300" />
                        <p className="font-medium">No se encontraron productos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                        {productosFiltrados.map((producto) => (
                            <button
                                key={producto.id}
                                onClick={() => onAgregarProducto(producto)}
                                className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-blue-400 hover:shadow-md transition-all group flex flex-col h-full active:scale-95"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {producto.categoria}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-slate-800 text-sm leading-tight flex-1 mb-2 group-hover:text-blue-700 transition-colors">
                                    {producto.nombre}
                                </h3>

                                <div className="flex justify-between items-end w-full mt-auto pt-2 border-t border-slate-50">
                                    <span className="font-black text-blue-600">${Number(producto.precio).toFixed(2)}</span>
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}