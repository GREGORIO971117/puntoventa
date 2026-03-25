'use client';

import { useState } from 'react';
import { guardarSucursal, eliminarSucursal } from '@/app/sucursales/actions';

export function ModalSucursal({ sucursal }: { sucursal?: any }) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  const modoEdicion = !!sucursal;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await guardarSucursal(formData);
    
    setLoading(false);
    if (result?.success) {
      setAbierto(false);
    } else {
      alert(result?.error || 'Ocurrió un error');
    }
  }

  // NUEVA FUNCIÓN DE ELIMINADO
  async function handleEliminar() {
    const confirmado = window.confirm(`¿Estás seguro de eliminar la sucursal "${sucursal.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    setLoading(true);
    const result = await eliminarSucursal(sucursal.id);
    setLoading(false);

    if (result?.success) {
      setAbierto(false);
    } else {
      alert(result?.error || 'No se pudo eliminar la sucursal.');
    }
  }

  return (
    <>
      {modoEdicion ? (
        <button onClick={() => setAbierto(true)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
          Editar
        </button>
      ) : (
        <button onClick={() => setAbierto(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
          + Nueva Sucursal
        </button>
      )}

      {abierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white rounded-md shadow-lg w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modoEdicion ? 'Editar Sucursal' : 'Registrar Nueva Sucursal'}
              </h3>
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {modoEdicion && <input type="hidden" name="id" value={sucursal.id} />}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Sucursal</label>
                  <input type="text" name="nombre" defaultValue={sucursal?.nombre} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección (Opcional)</label>
                  <input type="text" name="direccion" defaultValue={sucursal?.direccion} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (Opcional)</label>
                  <input type="text" name="telefono" defaultValue={sucursal?.telefono} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* FOOTER CON BOTONES DINÁMICOS */}
              <div className={`mt-6 flex ${modoEdicion ? 'justify-between' : 'justify-end'} pt-4 border-t border-slate-200`}>
                
                {modoEdicion && (
                  <button 
                    type="button" 
                    onClick={handleEliminar} 
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                  >
                    Eliminar Sucursal
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setAbierto(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-blue-400">
                    {loading ? 'Guardando...' : 'Guardar Sucursal'}
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