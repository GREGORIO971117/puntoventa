import React from 'react';
import { Search, PackageOpen } from "lucide-react";

export const PRODUCTOS_MOCK = [
    { id: 1, nombre: 'Hojas Blancas Tamaño Carta', precio: 85.00, categoria: 'Papelería' },
    { id: 2, nombre: 'Cuaderno Profesional Raya', precio: 35.50, categoria: 'Escolar' },
    { id: 3, nombre: 'Lápiz HB Mirado 2', precio: 6.00, categoria: 'Escritura' },
    { id: 4, nombre: 'Goma de Migajón', precio: 4.00, categoria: 'Escritura' },
    { id: 5, nombre: 'Cinta Adhesiva Transparente', precio: 15.00, categoria: 'Oficina' },
    { id: 6, nombre: 'Marcatextos Amarillo', precio: 12.00, categoria: 'Escritura' },
    { id: 7, nombre: 'Calculadora Científica', precio: 250.00, categoria: 'Oficina' },
    { id: 8, nombre: 'Pegamento en Barra', precio: 18.00, categoria: 'Escolar' },
];

export type Producto = {
    id: number;
    nombre: string;
    precio: number;
    categoria?: string;
};

interface CatalogoProps {
    onAgregarProducto: (producto: Producto) => void;
}

export function CatalogoProductos({ onAgregarProducto }: CatalogoProps) {
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

            {/* Header del Catálogo con Buscador */}
            <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PackageOpen className="text-blue-600" />
                    Catálogo Rápido
                </h1>

                {/* Barra de búsqueda (Visual por ahora) */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o código de barras..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    />
                </div>

                {/* Filtros visuales (Mock) */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                    {['Todos', 'Escolar', 'Oficina', 'Escritura', 'Papelería'].map(cat => (
                        <button key={cat} className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors whitespace-nowrap shadow-sm">
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cuadrícula de Productos */}
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-slate-50">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                    {PRODUCTOS_MOCK.map((prod) => (
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
            </div>

        </div>
    );
}