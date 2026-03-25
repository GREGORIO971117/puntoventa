'use client';

import { useState } from 'react';
import { guardarProducto } from '@/app/inventario/actions';

export function ModalProducto({ sucursales, categorias }: { sucursales: any[], categorias: any[] }) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await guardarProducto(formData);
    
    setLoading(false);
    if (result?.success) {
      setAbierto(false); // Cerramos el modal si todo salió bien
    } else {
      alert(result?.error || 'Ocurrió un error');
    }
  }

  return (
    <>
      <button 
        onClick={() => setAbierto(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
      >
        + Nuevo Producto
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Registrar Nuevo Producto</h3>
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                
                {/* Asignación */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal Destino</label>
                  <select name="sucursal_id" required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">Selecciona una sucursal...</option>
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select name="categoria_id" required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">Selecciona una categoría...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                {/* Datos del Producto */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                  <input type="text" name="nombre" required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" placeholder="Ej. Cuaderno Scribe 100h" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras (Opcional)</label>
                  <input type="text" name="codigo_barras" className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" placeholder="Escanea o escribe..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Venta ($)</label>
                  <input type="number" step="0.01" name="precio_venta" required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" placeholder="0.00" />
                </div>

                {/* Inventario y Tipo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
                  <input type="number" name="stock_actual" required defaultValue={0} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo (Alerta)</label>
                  <input type="number" name="stock_minimo" required defaultValue={5} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Venta</label>
                  <select name="tipo_venta" required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                    <option value="Pieza">Pieza (Unidad)</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Granel">Granel (Kilo/Metro)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Piezas por paquete</label>
                  <input type="number" name="piezas_por_paquete" defaultValue={1} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" title="Si es pieza o granel, déjalo en 1" />
                </div>

              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setAbierto(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-blue-400">
                  {loading ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}