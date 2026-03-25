'use client';

import { useState } from 'react';
import { editarProducto, eliminarProducto } from '@/app/inventario/actions';

export function BotonEditarProducto({ producto, sucursales, categorias }: { producto: any, sucursales: any[], categorias: any[] }) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEditar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await editarProducto(formData);
    
    setLoading(false);
    if (result?.success) {
      setAbierto(false);
    } else {
      alert(result?.error || 'Ocurrió un error');
    }
  }

  async function handleEliminar() {
    const confirmado = window.confirm(`¿Estás seguro de eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    setLoading(true);
    const result = await eliminarProducto(producto.id);
    setLoading(false);

    if (result?.success) {
      setAbierto(false);
    } else {
      alert(result?.error || 'No se pudo eliminar el producto.');
    }
  }

  return (
    <>
      <button 
        onClick={() => setAbierto(true)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
      >
        Editar
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">Editar Producto</h3>
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleEditar} className="p-6">
              {/* ID oculto necesario para saber cuál actualizar */}
              <input type="hidden" name="id" value={producto.id} />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal Destino</label>
                  <select name="sucursal_id" defaultValue={producto.sucursal_id} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select name="categoria_id" defaultValue={producto.categoria_id} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
                  <input type="text" name="nombre" defaultValue={producto.nombre} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras</label>
                  <input type="text" name="codigo_barras" defaultValue={producto.codigo_barras || ''} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Venta ($)</label>
                  <input type="number" step="0.01" name="precio_venta" defaultValue={producto.precio_venta} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
                  <input type="number" name="stock_actual" defaultValue={producto.stock_actual} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                  <input type="number" name="stock_minimo" defaultValue={producto.stock_minimo} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Venta</label>
                  <select name="tipo_venta" defaultValue={producto.tipo_venta} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                    <option value="Pieza">Pieza (Unidad)</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Granel">Granel (Kilo/Metro)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Piezas por paquete</label>
                  <input type="number" name="piezas_por_paquete" defaultValue={producto.piezas_por_paquete} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="mt-6 flex justify-between pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={handleEliminar} 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Eliminar Producto
                </button>
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setAbierto(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-blue-400">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}