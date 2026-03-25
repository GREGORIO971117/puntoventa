'use client';

import { useState } from 'react';
import { BotonEditarProducto } from './BotonEditarProducto';

export function TablaInventario({ productos, sucursales, categorias }: { productos: any[], sucursales: any[], categorias: any[] }) {
  // Estados para los filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStock, setFiltroStock] = useState('');
  const [filtroSucursal, setFiltroSucursal] = useState('');
  // Estados para la paginación
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  // 1. Aplicar todos los filtros
  let productosFiltrados = productos.filter((prod) => {
    const coincideTexto = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          (prod.codigo_barras && prod.codigo_barras.includes(busqueda));
    const coincideCat = filtroCategoria === '' || prod.categoria_id === filtroCategoria;
    const coincideTipo = filtroTipo === '' || prod.tipo_venta === filtroTipo;
    const coincideSucursal = filtroSucursal === '' || prod.sucursal_id === filtroSucursal;
    let coincideStock = true;
    if (filtroStock === 'bajo') coincideStock = prod.stock_actual <= prod.stock_minimo;
    if (filtroStock === 'ok') coincideStock = prod.stock_actual > prod.stock_minimo;
    if (filtroStock === 'agotado') coincideStock = prod.stock_actual === 0;

    return coincideTexto && coincideCat && coincideTipo && coincideStock && coincideSucursal;
  });

  // 2. Calcular Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);
  const indexUltimoItem = paginaActual * itemsPorPagina;
  const indexPrimerItem = indexUltimoItem - itemsPorPagina;
  const itemsActuales = productosFiltrados.slice(indexPrimerItem, indexUltimoItem);

  // Si cambiamos los filtros, regresamos a la página 1
  const handleFiltroChange = (setter: any, valor: any) => {
    setter(valor);
    setPaginaActual(1);
  };

  return (
    <div className="space-y-4">
      {/* PANEL DE FILTROS */}
      <div className="bg-white p-4 border border-slate-200 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Búsqueda de texto */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Buscar Producto</label>
          <input 
            type="text" 
            placeholder="Nombre o Código de barras..." 
            className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-slate-50"
            value={busqueda}
            onChange={(e) => handleFiltroChange(setBusqueda, e.target.value)}
          />
        </div>

        {/* Filtro Categoría */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoría</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-slate-50"
            value={filtroCategoria} onChange={(e) => handleFiltroChange(setFiltroCategoria, e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {/* Filtro Tipo */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo Venta</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-slate-50"
            value={filtroTipo} onChange={(e) => handleFiltroChange(setFiltroTipo, e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Pieza">Pieza</option>
            <option value="Paquete">Paquete</option>
            <option value="Granel">Granel</option>
          </select>
        </div>

        {/* Filtro Stock */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estado Stock</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-slate-50"
            value={filtroStock} onChange={(e) => handleFiltroChange(setFiltroStock, e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ok">Stock Sano</option>
            <option value="bajo">Stock Bajo (Alerta)</option>
            <option value="agotado">Agotados</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sucursal</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none bg-slate-50"
            value={filtroSucursal} onChange={(e) => handleFiltroChange(setFiltroSucursal, e.target.value)}
          >
            <option value="">Todas</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Sucursal</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {itemsActuales.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No se encontraron productos con estos filtros.</td></tr>
              ) : (
                itemsActuales.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-slate-500">{prod.codigo_barras || <span className="text-slate-300 italic">S/C</span>}</td>
                    <td className="px-6 py-3 font-medium text-slate-900">{prod.nombre}</td>
                    <td className="px-6 py-3">{(prod.categoria as any)?.nombre}</td>
                    <td className="px-6 py-3 font-medium text-slate-700">{(prod.sucursal as any)?.nombre}</td>
                    <td className="px-6 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-xs">{prod.tipo_venta}</span></td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">${Number(prod.precio_venta).toFixed(2)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`font-bold px-2 py-1 rounded-sm text-xs ${prod.stock_actual <= 0 ? 'bg-red-100 text-red-700' : prod.stock_actual <= prod.stock_minimo ? 'bg-amber-100 text-amber-700' : 'text-emerald-600'}`}>
                        {prod.stock_actual}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <BotonEditarProducto producto={prod} sucursales={sucursales} categorias={categorias} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* CONTROLES DE PAGINACIÓN */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Mostrar</span>
            <select 
              className="p-1 border border-slate-300 rounded text-sm bg-white focus:outline-none"
              value={itemsPorPagina} 
              onChange={(e) => handleFiltroChange(setItemsPorPagina, Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-slate-500">por página</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Mostrando {productosFiltrados.length === 0 ? 0 : indexPrimerItem + 1} - {Math.min(indexUltimoItem, productosFiltrados.length)} de <strong>{productosFiltrados.length}</strong>
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))} 
                disabled={paginaActual === 1}
                className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Anterior
              </button>
              <button 
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))} 
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
                className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}