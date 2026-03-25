'use client';

import { useState } from 'react';

export function TerminalPOS({ productosBase, cajeroId, sucursalId }: any) {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);

  // Filtro en tiempo real: busca por nombre o por código de barras
  const productosFiltrados = productosBase.filter((p: any) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(busqueda))
  );

  // Función para agregar al ticket
  const agregarAlCarrito = (producto: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        // Si ya está en el ticket, le sumamos 1 a la cantidad
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      // Si no está, lo agregamos con cantidad 1
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setBusqueda(''); // Limpiamos el buscador para el siguiente producto
  };

  // Cálculo automático del total
  const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

  return (
    <div className="flex w-full h-full p-4 gap-4">
      
      {/* PANEL IZQUIERDO: Buscador y Catálogo (66% del ancho) */}
      <div className="w-2/3 flex flex-col gap-4">
        {/* Buscador */}
        <input
          type="text"
          autoFocus
          placeholder="🔍 Escanea el código de barras o busca por nombre..."
          className="w-full p-4 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-lg bg-white"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
        {/* Cuadrícula de Productos */}
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4 content-start">
          {productosFiltrados.map((p: any) => (
            <button
              key={p.id}
              onClick={() => agregarAlCarrito(p)}
              className="bg-white p-4 rounded-md border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 active:scale-95"
            >
              <span className="font-medium text-slate-800 line-clamp-2 text-sm leading-tight">{p.nombre}</span>
              <div className="mt-2 flex justify-between items-end w-full">
                <span className="text-xs text-slate-500">Stock: {p.stock_actual}</span>
                <span className="font-bold text-blue-700">${Number(p.precio_venta).toFixed(2)}</span>
              </div>
            </button>
          ))}
          {productosFiltrados.length === 0 && (
            <p className="col-span-full text-slate-500 text-center py-8">No se encontraron productos.</p>
          )}
        </div>
      </div>

      {/* PANEL DERECHO: El Ticket de Venta (33% del ancho) */}
      <div className="w-1/3 bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-800 tracking-wide">TICKET ACTUAL</h2>
        </div>
        
        {/* Lista de compras */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {carrito.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-center text-sm">El ticket está vacío.<br/>Agrega productos para comenzar.</p>
            </div>
          ) : (
            carrito.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800">{item.nombre}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{item.cantidad} x ${Number(item.precio_venta).toFixed(2)}</span>
                </div>
                <span className="font-bold text-slate-800">${(item.cantidad * item.precio_venta).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {/* Zona de Cobro */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600 font-semibold uppercase text-sm tracking-wider">Total a Cobrar:</span>
            <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>
          <button 
            disabled={carrito.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-md transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            Cobrar Ticket
          </button>
        </div>
      </div>

    </div>
  );
}