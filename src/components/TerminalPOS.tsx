'use client';

import { useState } from 'react';
import { procesarVenta } from '@/app/ventas/actions';

export function TerminalPOS({ productosBase, cajeroId, sucursalId }: any) {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [cobrando, setCobrando] = useState(false); // 👈 Nuevo estado para bloquear el botón

  const productosFiltrados = productosBase.filter((p: any) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(busqueda))
  );

  const agregarAlCarrito = (producto: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setBusqueda(''); 
  };

  // Función para quitar un producto del ticket si el cajero se equivoca
  const quitarDelCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.id !== productoId));
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

  // 👈 NUEVA FUNCIÓN DE COBRO
  const handleCobrar = async () => {
    setCobrando(true);
    
    const result = await procesarVenta({
      sucursalId,
      cajeroId,
      total,
      carrito
    });

    setCobrando(false);

    if (result.error) {
      alert(result.error);
    } else {
      // Si fue un éxito, vaciamos el carrito y avisamos
      setCarrito([]);
      alert('✅ Venta registrada con éxito. El stock ha sido descontado.');
    }
  };

  return (
    <div className="flex w-full h-full p-4 gap-4">
      
      {/* PANEL IZQUIERDO */}
      <div className="w-2/3 flex flex-col gap-4">
        <input
          type="text"
          autoFocus
          placeholder="🔍 Escanea el código de barras o busca por nombre..."
          className="w-full p-4 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-lg bg-white"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
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

      {/* PANEL DERECHO (Ticket) */}
      <div className="w-1/3 bg-white border border-slate-200 rounded-md shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 tracking-wide">TICKET ACTUAL</h2>
          {carrito.length > 0 && (
            <button onClick={() => setCarrito([])} className="text-xs font-semibold text-red-600 hover:text-red-800 uppercase tracking-wider">
              Vaciar
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {carrito.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-center text-sm">El ticket está vacío.</p>
            </div>
          ) : (
            carrito.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3 group">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800">{item.nombre}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{item.cantidad} x ${Number(item.precio_venta).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">${(item.cantidad * item.precio_venta).toFixed(2)}</span>
                  {/* Botón para quitar un producto */}
                  <button onClick={() => quitarDelCarrito(item.id)} className="text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600 font-semibold uppercase text-sm tracking-wider">Total a Cobrar:</span>
            <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCobrar}
            disabled={carrito.length === 0 || cobrando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-md transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed text-lg tracking-wide flex justify-center items-center"
          >
            {cobrando ? 'Procesando...' : 'Cobrar Ticket'}
          </button>
        </div>
      </div>

    </div>
  );
}