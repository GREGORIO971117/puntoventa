'use client';

import { useState } from 'react';
import { guardarUsuario, eliminarUsuario } from '@/app/usuarios/actions';

export function ModalUsuario({ usuario, sucursales }: { usuario?: any, sucursales: any[] }) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);

  const modoEdicion = !!usuario;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await guardarUsuario(formData);
    
    setLoading(false);
    if (result?.success) {
      setAbierto(false);
    } else {
      alert(result?.error || 'Ocurrió un error');
    }
  }

  async function handleEliminar() {
    const confirmado = window.confirm(`¿Estás seguro de eliminar el acceso para "${usuario.username}"? No podrá volver a entrar al sistema.`);
    if (!confirmado) return;

    setLoading(true);
    const result = await eliminarUsuario(usuario.id);
    setLoading(false);

    if (result?.success) {
      setAbierto(false);
    } else {
      alert(result?.error || 'No se pudo eliminar el usuario.');
    }
  }

  return (
    <>
      {modoEdicion ? (
        <button onClick={() => setAbierto(true)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
          Editar Permisos
        </button>
      ) : (
        <button onClick={() => setAbierto(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
          + Nuevo Usuario
        </button>
      )}

      {abierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white rounded-md shadow-lg w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modoEdicion ? 'Editar Acceso de Usuario' : 'Registrar Nuevo Cajero / Admin'}
              </h3>
              <button onClick={() => setAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {modoEdicion && <input type="hidden" name="id" value={usuario.id} />}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario (Para Login)</label>
                  <input 
                    type="text" 
                    name="username" 
                    defaultValue={usuario?.username} 
                    required 
                    readOnly={modoEdicion} // No dejamos cambiar el username si ya existe
                    className={`w-full p-2 border border-slate-300 rounded text-sm focus:outline-none ${modoEdicion ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`} 
                    placeholder="Ej. caja_centro, admin_juan" 
                  />
                  {modoEdicion && <p className="text-xs text-slate-500 mt-1">El nombre de usuario no se puede cambiar.</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {modoEdicion ? 'Nueva Contraseña (Dejar en blanco para no cambiarla)' : 'Contraseña de Acceso'}
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    required={!modoEdicion} 
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none" 
                    placeholder="••••••••" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Acceso (Rol)</label>
                    <select name="rol" defaultValue={usuario?.rol || 'cajero'} required className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                      <option value="cajero">Cajero (Ventas)</option>
                      <option value="admin">Administrador (Total)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal Asignada</label>
                    <select name="sucursal_id" defaultValue={usuario?.sucursal_id || ''} className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-white">
                      <option value="">Ninguna (Global)</option>
                      {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={`mt-6 flex ${modoEdicion ? 'justify-between' : 'justify-end'} pt-4 border-t border-slate-200`}>
                
                {modoEdicion && (
                  <button 
                    type="button" 
                    onClick={handleEliminar} 
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                  >
                    Eliminar Usuario
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setAbierto(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-blue-400">
                    {loading ? 'Guardando...' : 'Guardar Usuario'}
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