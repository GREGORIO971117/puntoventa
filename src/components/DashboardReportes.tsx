'use client';

import { useState, useMemo } from 'react';
import { GraficaVentas } from './GraficaVentas';
import { ModalDetalleVenta } from './ModalDetalleVenta';
import { eliminarVentasMasivo } from '@/app/historial/actions'; // 👈 Importamos la nueva función

export function DashboardReportes({ ventasBase, sucursales }: { ventasBase: any[], sucursales: any[] }) {
  const [filtroSucursal, setFiltroSucursal] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // 👈 NUEVOS ESTADOS PARA SELECCIÓN Y BORRADO
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);

  const ventasFiltradas = useMemo(() => {
    return ventasBase.filter((venta) => {
      let cumpleSucursal = filtroSucursal === '' || venta.sucursal_id === filtroSucursal;
      let cumpleInicio = true;
      let cumpleFin = true;
      const fechaVenta = new Date(venta.created_at);

      if (fechaInicio) cumpleInicio = fechaVenta >= new Date(fechaInicio + 'T00:00:00');
      if (fechaFin) cumpleFin = fechaVenta <= new Date(fechaFin + 'T23:59:59');

      return cumpleSucursal && cumpleInicio && cumpleFin;
    });
  }, [ventasBase, filtroSucursal, fechaInicio, fechaFin]);

  const top10Productos = useMemo(() => {
    const conteo: Record<string, { cantidad: number, ingresos: number }> = {};
    ventasFiltradas.forEach(venta => {
      venta.detalles_venta.forEach((detalle: any) => {
        const nombre = detalle.productos?.nombre || 'Producto Eliminado';
        if (!conteo[nombre]) conteo[nombre] = { cantidad: 0, ingresos: 0 };
        conteo[nombre].cantidad += detalle.cantidad;
        conteo[nombre].ingresos += detalle.subtotal;
      });
    });

    return Object.entries(conteo)
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [ventasFiltradas]);

  const ingresosTotales = ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0);

  // 👈 FUNCIONES DE SELECCIÓN DE CHECKBOXES
  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleTodos = () => {
    if (seleccionados.length === ventasFiltradas.length && ventasFiltradas.length > 0) {
      setSeleccionados([]); // Deseleccionar todos
    } else {
      setSeleccionados(ventasFiltradas.map(v => v.id)); // Seleccionar todos los visibles
    }
  };

  // 👈 FUNCIÓN PARA BORRAR (Pide la palabra clave)
  const handleBorrarSeleccionados = async () => {
    const pass = prompt(`⚠️ Vas a eliminar ${seleccionados.length} tickets de venta permanentemente.\n\nEscribe la palabra CONFIRMAR para proceder:`);
    
    if (pass === null) return;

    if (pass.trim().toUpperCase() !== 'CONFIRMAR') {
      alert("Operación cancelada. Palabra incorrecta.");
      return;
    }

    setProcesando(true);
    const result = await eliminarVentasMasivo(seleccionados);
    setProcesando(false);

    if (result.success) {
      alert(`✅ ${seleccionados.length} tickets eliminados correctamente.`);
      setSeleccionados([]); // Limpiamos la selección
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PANEL DE FILTROS */}
      <div className="bg-white p-4 border border-slate-200 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sucursal</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50 focus:outline-none focus:border-blue-500"
            value={filtroSucursal} onChange={(e) => { setFiltroSucursal(e.target.value); setSeleccionados([]); }}
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Desde la fecha</label>
          <input 
            type="date" 
            className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50 focus:outline-none focus:border-blue-500"
            value={fechaInicio} onChange={(e) => { setFechaInicio(e.target.value); setSeleccionados([]); }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Hasta la fecha</label>
          <input 
            type="date" 
            className="w-full p-2 border border-slate-300 rounded text-sm bg-slate-50 focus:outline-none focus:border-blue-500"
            value={fechaFin} onChange={(e) => { setFechaFin(e.target.value); setSeleccionados([]); }}
          />
        </div>
      </div>

      {/* PANEL SUPERIOR: Gráfica y Top 10 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 xl:p-6 xl:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Ingresos por Día</h2>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
              Total: ${ingresosTotales.toFixed(2)}
            </span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <GraficaVentas ventas={ventasFiltradas} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm flex flex-col h-[400px] xl:h-auto">
          <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <h2 className="text-lg font-semibold text-slate-800">Top 10 Productos</h2>
            <p className="text-xs text-slate-500">Más vendidos (unidades)</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {top10Productos.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">No hay datos en este periodo.</p>
            ) : (
              top10Productos.map((prod, index) => (
                <div key={index} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 w-2/3">
                    <span className={`font-bold w-5 text-center ${index < 3 ? 'text-blue-600' : 'text-slate-400'}`}>{index + 1}.</span>
                    <span className="text-sm font-medium text-slate-700 truncate">{prod.nombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-slate-800">{prod.cantidad} <span className="text-xs font-normal text-slate-500">pzas</span></span>
                    <span className="block text-xs text-emerald-600">${prod.ingresos.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PANEL INFERIOR: La Tabla tipo Excel con Checkboxes */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Registro General de Ventas</h2>
            <span className="text-sm text-slate-500 font-medium">Mostrando {ventasFiltradas.length} tickets</span>
          </div>
          
          {/* 👈 BOTÓN DE BORRADO (Solo aparece si hay checkboxes seleccionados) */}
          {seleccionados.length > 0 && (
            <button 
              onClick={handleBorrarSeleccionados}
              disabled={procesando}
              className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-md text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm animate-in fade-in duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {procesando ? 'Borrando...' : `Eliminar ${seleccionados.length} tickets`}
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                {/* 👈 CHECKBOX MAESTRO (Seleccionar todos) */}
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={seleccionados.length === ventasFiltradas.length && ventasFiltradas.length > 0}
                    onChange={toggleTodos}
                  />
                </th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Hora</th>
                <th className="px-4 py-4">Sucursal</th>
                <th className="px-4 py-4">Cajero</th>
                <th className="px-4 py-4 text-right">Total</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No hay ventas registradas con estos filtros.</td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => {
                  const fechaObj = new Date(venta.created_at);
                  const fecha = fechaObj.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
                  const hora = fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

                  return (
                    // 👈 Pintamos la fila de un color ligerito si está seleccionada
                    <tr key={venta.id} className={`transition-colors ${seleccionados.includes(venta.id) ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                      {/* 👈 CHECKBOX INDIVIDUAL */}
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={seleccionados.includes(venta.id)}
                          onChange={() => toggleSeleccion(venta.id)}
                        />
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-700">{fecha}</td>
                      <td className="px-4 py-4 font-mono text-slate-500">{hora}</td>
                      <td className="px-4 py-4 font-medium text-slate-800">{(venta.sucursales as any)?.nombre}</td>
                      <td className="px-4 py-4 text-slate-600">{(venta.perfiles as any)?.username}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">${Number(venta.total).toFixed(2)}</td>
                      <td className="px-4 py-4 text-center">
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

    </div>
  );
}