import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { ModalSucursal } from '@/components/ModalSucursal';
import { redirect } from 'next/navigation';

export default async function SucursalesPage() {
  const supabase = await createClient();
  
  // Verificamos que sea administrador. Si un cajero intenta entrar aquí por la URL, lo pateamos.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user?.id).single();
  
  if (perfil?.rol !== 'admin') {
    redirect('/ventas');
  }

  // Traemos las sucursales ordenadas alfabéticamente
  const { data: sucursales } = await supabase.from('sucursales').select('*').order('nombre');

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* HEADER CORPORATIVO */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold tracking-wide">PAPELERÍA GALINDOS</h1>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">Módulo de Sucursales</p>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-md">
            <Link href="/ventas" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
              Terminal POS
            </Link>
            <Link href="/inventario" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
              Inventario
            </Link>
            <Link href="/sucursales" className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded transition-colors">
              Sucursales
            </Link>
          </nav>
        </div>

        <form action={logout}>
          <button type="submit" className="text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 bg-slate-800 px-4 py-2 rounded-md transition-colors">
            Cerrar Sesión
          </button>
        </form>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto p-6 mt-4">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Gestión de Sucursales</h2>
          {/* Usamos el modal en modo Creación (sin pasarle datos) */}
          <ModalSucursal />
        </div>

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nombre de la Sucursal</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {!sucursales || sucursales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No hay sucursales registradas.
                    </td>
                  </tr>
                ) : (
                  sucursales.map((sucursal) => (
                    <tr key={sucursal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{sucursal.nombre}</td>
                      <td className="px-6 py-4">{sucursal.direccion || <span className="text-slate-400 italic">Sin dirección</span>}</td>
                      <td className="px-6 py-4">{sucursal.telefono || <span className="text-slate-400 italic">Sin teléfono</span>}</td>
                      <td className="px-6 py-4 text-center">
                        {/* Usamos el MISMO modal, pero en modo Edición (pasándole la sucursal) */}
                        <ModalSucursal sucursal={sucursal} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}