import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { ModalUsuario } from '@/components/ModalUsuario';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar'; // 👈 IMPORTAMOS EL NAVBAR

export default async function UsuariosPage() {
  const supabase = await createClient();
  
  // Seguridad: Solo el administrador puede entrar aquí
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
      .from('perfiles')
      .select('username, rol, sucursal_id, sucursales(nombre)')
      .eq('id', user?.id)
      .single();

  const sucursalNombre = (perfil?.sucursales as any)?.nombre || 'Administración Central';


  if (perfil?.rol !== 'admin') {
    redirect('/ventas');
  }

  // Traemos los usuarios y las sucursales
  const { data: usuarios } = await supabase.from('perfiles').select('*, sucursales(nombre)').order('username');
  const { data: sucursales } = await supabase.from('sucursales').select('id, nombre').order('nombre');

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      
      {/* 👈 AQUÍ INYECTAMOS EL NAVBAR UNIVERSAL */}
      <Navbar perfil={perfil} sucursalNombre={sucursalNombre} logoutAction={logout} />


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