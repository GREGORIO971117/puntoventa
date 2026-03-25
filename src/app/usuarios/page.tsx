import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { ModalUsuario } from '@/components/ModalUsuario';
import { redirect } from 'next/navigation';

export default async function UsuariosPage() {
  const supabase = await createClient();
  
  // Seguridad: Solo el administrador puede entrar aquí
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfilActual } = await supabase.from('perfiles').select('rol').eq('id', user?.id).single();
  
  if (perfilActual?.rol !== 'admin') {
    redirect('/ventas');
  }

  // Traemos los usuarios y las sucursales
  const { data: usuarios } = await supabase.from('perfiles').select('*, sucursales(nombre)').order('username');
  const { data: sucursales } = await supabase.from('sucursales').select('id, nombre').order('nombre');

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* HEADER CORPORATIVO */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold tracking-wide">PAPELERÍA GALINDOS</h1>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">Módulo de Usuarios</p>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-md">
            <Link href="/ventas" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Terminal POS</Link>
            <Link href="/inventario" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Inventario</Link>
            <Link href="/sucursales" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Sucursales</Link>
            <Link href="/usuarios" className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded transition-colors">Usuarios</Link>
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
          <h2 className="text-2xl font-semibold text-slate-800">Cajeros y Administradores</h2>
          <ModalUsuario sucursales={sucursales || []} />
        </div>

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Sucursal Asignada</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usuarios?.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{usr.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${usr.rol === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {usr.rol === 'admin' ? 'Administrador' : 'Cajero'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{(usr.sucursales as any)?.nombre || <span className="text-slate-400 italic">Acceso Global</span>}</td>
                    <td className="px-6 py-4 text-center">
                      <ModalUsuario usuario={usr} sucursales={sucursales || []} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}