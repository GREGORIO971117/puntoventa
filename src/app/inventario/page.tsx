import { createClient } from '@/lib/supabase/server';
import { logout } from '@/app/actions';
import Link from 'next/link';
import { ModalProducto } from '@/components/ModalProducto';
import { BotonEditarProducto } from '@/components/BotonEditarProducto';


export default async function InventarioPage() {
  const supabase = await createClient();
  
  // 1. Traemos las sucursales y categorías para pasárselas al Modal
  const { data: sucursales } = await supabase.from('sucursales').select('id, nombre').order('nombre');
  const { data: categorias } = await supabase.from('categorias').select('id, nombre').order('nombre');

  // 2. Traemos los productos reales cruzados con su categoría para la tabla
  const { data: productos } = await supabase
    .from('productos')
    .select(`
      *,
      categoria:categorias(nombre)
    `)
    .order('nombre');

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* HEADER CORPORATIVO */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold tracking-wide">PAPELERÍA GALINDOS</h1>
            <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">Módulo de Inventario</p>
          </div>
          
          <nav className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-md">
            <Link href="/ventas" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">
              Terminal POS
            </Link>
            <Link href="/inventario" className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded transition-colors">
              Inventario
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
      <main className="max-w-7xl mx-auto p-6 mt-4">
        
        {/* Barra de Acciones */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Catálogo de Productos</h2>
          {/* Aquí inyectamos el Modal pasándole los catálogos reales */}
          <ModalProducto 
            sucursales={sucursales || []} 
            categorias={categorias || []} 
          />
        </div>

     {/* Tabla de Datos Formal */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Precio Venta</th>
                  <th className="px-6 py-4 text-right">Stock</th>
                  {/* 👈 Arreglamos el encabezado: Solo dice "Acciones" */}
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-200">
                {!productos || productos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No hay productos registrados en el inventario. Haz clic en "Nuevo Producto" para comenzar.
                    </td>
                  </tr>
                ) : (
                  productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {prod.codigo_barras || <span className="text-slate-300 italic">S/C</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{prod.nombre}</td>
                      <td className="px-6 py-4">{(prod.categoria as any)?.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs">
                          {prod.tipo_venta}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        ${Number(prod.precio_venta).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${prod.stock_actual <= prod.stock_minimo ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {prod.stock_actual}
                        </span>
                      </td>
                      
                      {/* 👈 AQUÍ SÍ VA EL BOTÓN (Dentro del map, donde prod sí existe) */}
                      <td className="px-6 py-4 text-center">
                        <BotonEditarProducto 
                          producto={prod} 
                          sucursales={sucursales || []} 
                          categorias={categorias || []} 
                        />
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