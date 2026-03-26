import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import { Navbar } from '@/components/Navbar'; 
import { redirect } from 'next/navigation';
import { DashboardReportes } from '@/components/DashboardReportes';

export default async function HistorialPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('username, rol, sucursal_id, sucursales(nombre)')
    .eq('id', user?.id)
    .single();  
    
  if (perfil?.rol !== 'admin') {
    redirect('/ventas');
  }
  
  const sucursalNombre = (perfil?.sucursales as any)?.nombre || 'Administración Central';

  // Traemos las sucursales para el filtro desplegable
  const { data: sucursales } = await supabase.from('sucursales').select('id, nombre').order('nombre');

  // Traemos las ventas (agregamos sucursal_id para que el filtro funcione)
  const { data: ventas } = await supabase
    .from('ventas')
    .select(`
      id, total, metodo_pago, created_at, sucursal_id,
      sucursales (nombre),
      perfiles (username),
      detalles_venta (
        id, cantidad, precio_unitario, subtotal,
        productos (nombre)
      )
    `)
    .order('created_at', { ascending: false }); 

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      
      <Navbar perfil={perfil} sucursalNombre={sucursalNombre} logoutAction={logout} />

      <main className="max-w-7xl mx-auto p-4 lg:p-6 mt-2 w-full">
        {/* Aquí inyectamos el cerebro del dashboard */}
        <DashboardReportes 
          ventasBase={ventas || []} 
          sucursales={sucursales || []} 
        />
      </main>

    </div>
  );
}