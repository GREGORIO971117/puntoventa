import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar'; // 👈 IMPORTAMOS EL NAVBAR
import { redirect } from 'next/navigation';
import { ModalDetalleVenta } from '@/components/ModalDetalleVenta';
import { GraficaVentas } from '@/components/GraficaVentas';

export default async function HistorialPage() {
  
  const supabase = await createClient();
  
  // Seguridad
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


  // 🚀 LA SÚPER CONSULTA: Traemos ventas + sucursal + cajero + detalles + productos
  const { data: ventas } = await supabase
    .from('ventas')
    .select(`
      id, total, metodo_pago, created_at,
      sucursales (nombre),
      perfiles (username),
      detalles_venta (
        id, cantidad, precio_unitario, subtotal,
        productos (nombre)
      )
    `)
    .order('created_at', { ascending: false }); // Las más nuevas primero

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
      
      {/* 👈 AQUÍ INYECTAMOS EL NAVBAR UNIVERSAL */}
      <Navbar perfil={perfil} sucursalNombre={sucursalNombre} logoutAction={logout} />


      <main className="max-w-7xl mx-auto p-6 mt-4 space-y-6">
        
        {/* PANEL SUPERIOR: La Gráfica */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Ingresos por Día</h2>
          <GraficaVentas ventas={ventas || []} />
        </div>

        {/* PANEL INFERIOR: La Tabla tipo Excel */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Registro General de Ventas</h2>
            <span className="text-sm text-slate-500 font-medium">Total de registros: {ventas?.length || 0}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Sucursal</th>
                  <th className="px-6 py-4">Cajero</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {!ventas || ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No hay ventas registradas aún.</td>
                  </tr>
                ) : (
                  ventas.map((venta) => {
                    // Extraemos fecha y hora para la tabla
                    const fechaObj = new Date(venta.created_at);
                    const fecha = fechaObj.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
                    const hora = fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={venta.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-700">{fecha}</td>
                        <td className="px-6 py-4 font-mono text-slate-500">{hora}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{(venta.sucursales as any)?.nombre}</td>
                        <td className="px-6 py-4 text-slate-600">{(venta.perfiles as any)?.username}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">${Number(venta.total).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          {/* Botón que abre el ticket detallado */}
                          <ModalDetalleVenta venta={venta} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}