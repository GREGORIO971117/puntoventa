import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { TerminalPOS } from '@/components/TerminalPOS';

export default async function VentasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Obtenemos el perfil del cajero
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('username, rol, sucursal_id, sucursales(nombre)')
    .eq('id', user?.id)
    .single();

  const sucursalNombre = (perfil?.sucursales as any)?.nombre || 'Administración Central';
  const sucursalId = perfil?.sucursal_id;

  // 2. Traemos SOLO los productos de esta sucursal
  let productos = [];
  if (sucursalId) {
    const { data } = await supabase.from('productos').select('*').eq('sucursal_id', sucursalId).order('nombre');
    productos = data || [];
  } else {
    // Si es el Admin global y no tiene sucursal, le mostramos todos por ahora
    const { data } = await supabase.from('productos').select('*').order('nombre');
    productos = data || [];
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      
      {/* HEADER CORPORATIVO */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold tracking-wide">PAPELERÍA GALINDOS</h1>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">Terminal - {sucursalNombre}</p>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-md">
            <Link href="/ventas" className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded transition-colors">
              Terminal POS
            </Link>
            {/* Solo mostramos el botón de inventario si es administrador */}
            {perfil?.rol === 'admin' && (
              <Link href="/inventario" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
                Inventario
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300">Cajero: <span className="font-semibold text-white">{perfil?.username}</span></span>
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 bg-slate-800 px-4 py-2 rounded-md transition-colors">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      {/* ÁREA DE TRABAJO (Aquí inyectamos el componente interactivo) */}
      <main className="flex-1 overflow-hidden">
        <TerminalPOS 
          productosBase={productos} 
          cajeroId={user?.id} 
          sucursalId={sucursalId} 
        />
      </main>

    </div>
  );
}