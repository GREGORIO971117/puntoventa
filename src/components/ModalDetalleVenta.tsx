'use client';

import { useState } from 'react';

export function ModalDetalleVenta({ venta }: { venta: any }) {
  const [abierto, setAbierto] = useState(false);

  // Formatear la fecha para que se vea bonita en el ticket
  const fechaFormateada = new Date(venta.created_at).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const horaFormateada = new Date(venta.created_at).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      <button 
        onClick={() => setAbierto(true)} 
        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
      >
        Ver ticket
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detalle de Venta</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Folio: {venta.id.split('-')[0]}</p>
              </div>
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Info General */}
              <div className="mb-6 bg-slate-50 p-4 rounded border border-slate-100 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Fecha:</span> <span className="font-medium text-slate-800">{fechaFormateada}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Hora:</span> <span className="font-medium text-slate-800">{horaFormateada}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sucursal:</span> <span className="font-medium text-slate-800">{(venta.sucursales as any)?.nombre}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cajero:</span> <span className="font-medium text-slate-800">{(venta.perfiles as any)?.username}</span></div>
              </div>

              {/* Partidas del Ticket */}
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">Productos Vendidos</h4>
              <div className="space-y-3">
                {venta.detalles_venta.map((detalle: any) => (
                  <div key={detalle.id} className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{(detalle.productos as any)?.nombre || 'Producto Eliminado'}</span>
                      <span className="text-slate-500 text-xs">{detalle.cantidad} x ${Number(detalle.precio_unitario).toFixed(2)}</span>
                    </div>
                    <span className="font-bold text-slate-700">${Number(detalle.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <span className="text-slate-600 font-bold uppercase text-sm tracking-wider">Total del Ticket</span>
              <span className="text-2xl font-bold text-slate-900">${Number(venta.total).toFixed(2)}</span>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}