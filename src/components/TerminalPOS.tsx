'use client';

import { useState } from 'react';
import { procesarVenta } from '@/app/ventas/actions';

export function TerminalPOS({ productosBase, cajeroId, sucursalId }: any) {
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState<any[]>([]);
  const [cobrando, setCobrando] = useState(false);
  const [modalAlerta, setModalAlerta] = useState<{tipo: 'exito'|'error', texto: string} | null>(null);

  const productosFiltrados = productosBase.filter((p: any) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(busqueda))
  );

  const agregarAlCarrito = (producto: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      const cantidadActual = existe ? existe.cantidad : 0;

      // Validación de límite de inventario
      if (cantidadActual + 1 > producto.stock_actual) {
        setModalAlerta({ 
          tipo: 'error', 
          texto: `¡Límite alcanzado! Solo tienes ${producto.stock_actual} piezas de "${producto.nombre}" en inventario.` 
        });
        return prev;
      }

      if (existe) {
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setBusqueda(''); 
  };

  // 👈 LÓGICA NUEVA: Botones + y - dentro del ticket
  const modificarCantidad = (productoId: string, cambio: number, stockActual: number, nombre: string) => {
    setCarrito(prev => {
      const item = prev.find(i => i.id === productoId);
      if (!item) return prev;

      const nuevaCantidad = item.cantidad + cambio;

      // Si intenta subir más del stock
      if (nuevaCantidad > stockActual) {
        setModalAlerta({ tipo: 'error', texto: `No puedes agregar más. El stock máximo de "${nombre}" es ${stockActual}.` });
        return prev;
      }

      // Si baja a 0, lo eliminamos del ticket
      if (nuevaCantidad <= 0) {
        return prev.filter(i => i.id !== productoId);
      }

      // Si todo está bien, actualizamos la cantidad
      return prev.map(i => i.id === productoId ? { ...i, cantidad: nuevaCantidad } : i);
    });
  };

  const quitarDelCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.id !== productoId));
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

  // 👈 LÓGICA MEJORADA: Cobro con Modal
  const handleCobrar = async () => {
    setCobrando(true);
    const result = await procesarVenta({ sucursalId, cajeroId, total, carrito });
    setCobrando(false);

    if (result.error) {
      setModalAlerta({ tipo: 'error', texto: result.error });
    } else {
      setCarrito([]);
      setModalAlerta({ tipo: 'exito', texto: '¡Venta registrada con éxito! El inventario ha sido actualizado.' });
    }
  };

  return (
    // Contenedor principal: En móvil es columna, en PC es fila (lado a lado)
    <div className="flex flex-col lg:flex-row w-full h-full p-2 lg:p-4 gap-4 flex-1 lg:overflow-hidden">
      
      {/* PANEL IZQUIERDO: Buscador (Ocupa todo el ancho en móvil, 2/3 en PC) */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 h-[50vh] lg:h-full">
        <input
          type="text"
          autoFocus
          placeholder="Busca producto..."
          className="w-full p-4 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 lg:text-lg bg-white shrink-0"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 overflow-y-auto pr-1 lg:pr-2 pb-4 content-start flex-1">
          {productosFiltrados.map((p: any) => (
            <button
              key={p.id}
              onClick={() => agregarAlCarrito(p)}
              // Si no hay stock, el botón se ve "apagado"
              disabled={p.stock_actual <= 0}
              className={`bg-white p-3 lg:p-4 rounded-md border shadow-sm transition-all text-left flex flex-col justify-between h-28 lg:h-32 ${p.stock_actual <= 0 ? 'border-red-200 opacity-60 cursor-not-allowed' : 'border-slate-200 hover:border-blue-500 hover:shadow-md active:scale-95'}`}
            >
              <span className="font-medium text-slate-800 line-clamp-2 text-xs lg:text-sm leading-tight">{p.nombre}</span>
              <div className="mt-2 flex justify-between items-end w-full">
                <span className={`text-[10px] lg:text-xs font-semibold ${p.stock_actual <= p.stock_minimo ? 'text-red-500' : 'text-slate-500'}`}>
                  Stock: {p.stock_actual}
                </span>
                <span className="font-bold text-blue-700 text-sm lg:text-base">${Number(p.precio_venta).toFixed(2)}</span>
              </div>
            </button>
          ))}
          {productosFiltrados.length === 0 && (
            <p className="col-span-full text-slate-500 text-center py-8">No se encontraron productos.</p>
          )}
        </div>
      </div>

      {/* PANEL DERECHO: El Ticket (Ocupa todo el ancho en móvil, 1/3 en PC) */}
      <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-md shadow-sm flex flex-col h-[50vh] lg:h-full shrink-0">
        <div className="p-3 lg:p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-slate-800 tracking-wide text-sm lg:text-base">TICKET ACTUAL</h2>
          {carrito.length > 0 && (
            <button onClick={() => setCarrito([])} className="text-xs font-semibold text-red-600 hover:text-red-800 uppercase tracking-wider">
              Vaciar
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 lg:p-4 flex flex-col gap-3">
          {carrito.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-center text-sm">El ticket está vacío.</p>
            </div>
          ) : (
            carrito.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-100 pb-3 group">
                <div className="flex flex-col w-1/2">
                  <span className="text-xs lg:text-sm font-semibold text-slate-800 leading-tight">{item.nombre}</span>
                  <span className="text-[10px] lg:text-xs text-slate-500 mt-1">${Number(item.precio_venta).toFixed(2)} c/u</span>
                </div>
                
                {/* 👈 CONTROLES DE CANTIDAD (+ / -) */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-md border border-slate-200 p-0.5">
                  <button 
                    onClick={() => modificarCantidad(item.id, -1, item.stock_actual, item.nombre)}
                    className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-white text-slate-600 rounded shadow-sm hover:text-blue-600 font-bold"
                  >−</button>
                  <span className="w-4 lg:w-6 text-center text-xs lg:text-sm font-bold text-slate-800">{item.cantidad}</span>
                  <button 
                    onClick={() => modificarCantidad(item.id, 1, item.stock_actual, item.nombre)}
                    className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-white text-slate-600 rounded shadow-sm hover:text-blue-600 font-bold"
                  >+</button>
                </div>

                <div className="flex items-center gap-2 w-1/5 justify-end">
                  <span className="font-bold text-slate-800 text-sm">${(item.cantidad * item.precio_venta).toFixed(2)}</span>
                  {/* Botón X oculto en móvil por espacio, visible en PC al pasar el mouse */}
                  <button onClick={() => quitarDelCarrito(item.id)} className="hidden lg:block text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 lg:p-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <div className="flex justify-between items-center mb-3 lg:mb-4">
            <span className="text-slate-600 font-semibold uppercase text-xs lg:text-sm tracking-wider">Total:</span>
            <span className="text-2xl lg:text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCobrar}
            disabled={carrito.length === 0 || cobrando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 lg:py-4 rounded-md transition-colors shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed text-base lg:text-lg tracking-wide flex justify-center items-center"
          >
            {cobrando ? 'Procesando...' : 'Cobrar Ticket'}
          </button>
        </div>
      </div>

      {/* 👈 NUEVO MODAL ELEGANTE PARA AVISOS Y ERRORES */}
      {modalAlerta && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 animate-in zoom-in-95 duration-200">
            
            {/* Ícono dinámico */}
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modalAlerta.tipo === 'exito' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {modalAlerta.tipo === 'exito' ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${modalAlerta.tipo === 'exito' ? 'text-emerald-700' : 'text-red-700'}`}>
              {modalAlerta.tipo === 'exito' ? '¡Excelente!' : 'Atención'}
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {modalAlerta.texto}
            </p>
            
            <button 
              onClick={() => setModalAlerta(null)}
              className={`w-full py-2.5 rounded-md text-white font-semibold transition-colors ${modalAlerta.tipo === 'exito' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'}`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}