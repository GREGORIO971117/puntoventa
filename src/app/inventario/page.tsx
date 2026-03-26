import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import { Navbar } from '@/components/Navbar'; // 👈 IMPORTAMOS EL NAVBAR
import { ModalProducto } from '@/components/ModalProducto';
import { TablaInventario } from '@/components/TablaInventario';
import { HerramientasInventario } from '@/components/HerramientasInventario';

export default async function InventarioPage() {
  const supabase = await createClient();
  
  // 1. Obtenemos los datos del usuario para pasárselos al Navbar
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('username, rol, sucursal_id, sucursales(nombre)')
    .eq('id', user?.id)
    .single();

  const sucursalNombre = (perfil?.sucursales as any)?.nombre || 'Administración Central';

  // 2. Traemos los catálogos y productos
  const { data: sucursales } = await supabase.from('sucursales').select('id, nombre').order('nombre');
  const { data: categorias } = await supabase.from('categorias').select('id, nombre').order('nombre');
  
  // Incluimos la sucursal para que la tabla la pueda mostrar
  const { data: productos } = await supabase
    .from('productos')
    .select(`*, categoria:categorias(nombre), sucursal:sucursales(nombre)`)
    .order('nombre');

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      
      {/* 👈 AQUÍ INYECTAMOS EL NAVBAR UNIVERSAL */}
      <Navbar perfil={perfil} sucursalNombre={sucursalNombre} logoutAction={logout} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 mt-2">
        
        {/* Cabecera y Herramientas Agrupadas Estéticamente */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">Catálogo de Productos</h2>
          </div>

          {/* Caja Blanca con todos los controles alineados */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <HerramientasInventario 
              productos={productos || []} 
              sucursales={sucursales || []} 
              categorias={categorias || []} 
            />
            
            {/* Divisor vertical sutil */}
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-1"></div> 
            
            <ModalProducto 
              sucursales={sucursales || []} 
              categorias={categorias || []} 
            />
          </div>

        </div>

        {/* TABLA INTERACTIVA */}
        <TablaInventario 
          productos={productos || []} 
          sucursales={sucursales || []} 
          categorias={categorias || []} 
        />

      </main>
    </div>
  );
}