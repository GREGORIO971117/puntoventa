import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { TerminalPOS } from '@/components/TerminalPOS';
import { Navbar } from '@/components/Navbar'; // 👈 IMPORTAMOS EL NAVBAR


export default async function VentasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

 const { data: perfil } = await supabase
    .from('perfiles')
    .select('username, rol, sucursal_id, sucursales(nombre)')
    .eq('id', user?.id)
    .single();

  const sucursalNombre = (perfil?.sucursales as any)?.nombre || 'Administración Central';
  const sucursalId = perfil?.sucursal_id;

  let productos = [];
  if (sucursalId) {
    const { data } = await supabase.from('productos').select('*').eq('sucursal_id', sucursalId).order('nombre');
    productos = data || [];
  } else {
    const { data } = await supabase.from('productos').select('*').order('nombre');
    productos = data || [];
  }

  return (
    // 👈 Cambiamos el h-screen fijo por min-h-screen para celulares
      <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
          
          {/* 👈 AQUÍ INYECTAMOS EL NAVBAR UNIVERSAL */}
          <Navbar perfil={perfil} sucursalNombre={sucursalNombre} logoutAction={logout} />
    

      {/* ÁREA DE TRABAJO: En móviles crece, en PC se oculta el scroll global */}
      <main className="flex-1 lg:overflow-hidden flex flex-col">
        <TerminalPOS 
          productosBase={productos} 
          cajeroId={user?.id} 
          sucursalId={sucursalId} 
        />
      </main>

    </div>
  );
}