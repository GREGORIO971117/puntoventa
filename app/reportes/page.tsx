'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign, Package, Award,
    Calendar, Clock, Receipt, Filter, Eye, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- BASE DE DATOS MOCK: HISTORIAL DE VENTAS CON PRODUCTOS ---
// Hoy es 24 de Febrero de 2026 (Usaremos estas fechas para que el botón "Hoy" funcione)
const HISTORIAL_VENTAS = [
    {
        id: 1, fecha: '2026-02-24', hora: '08:30', sucursal: 'Centro', metodo: 'Efectivo', productos: [
            { nombre: 'Hojas Blancas Carta', cantidad: 2, precio: 85 }, { nombre: 'Lápiz HB Mirado 2', cantidad: 5, precio: 6 }
        ]
    },
    {
        id: 2, fecha: '2026-02-24', hora: '10:15', sucursal: 'Norte', metodo: 'Tarjeta', productos: [
            { nombre: 'Cuaderno Profesional', cantidad: 3, precio: 35.5 }, { nombre: 'Pluma Punto Fino', cantidad: 10, precio: 8 }
        ]
    },
    {
        id: 3, fecha: '2026-02-24', hora: '12:45', sucursal: 'Centro', metodo: 'Efectivo', productos: [
            { nombre: 'Calculadora Científica', cantidad: 1, precio: 250 }, { nombre: 'Goma de Migajón', cantidad: 2, precio: 4 }
        ]
    },
    {
        id: 4, fecha: '2026-02-24', hora: '16:20', sucursal: 'Sur', metodo: 'Transferencia', productos: [
            { nombre: 'Carpeta Panorámica', cantidad: 5, precio: 45 }, { nombre: 'Cinta Adhesiva', cantidad: 2, precio: 15 }
        ]
    },
    {
        id: 5, fecha: '2026-02-23', hora: '09:10', sucursal: 'Centro', metodo: 'Efectivo', productos: [
            { nombre: 'Marcatextos Amarillo', cantidad: 4, precio: 12 }, { nombre: 'Tijeras Punta Roma', cantidad: 1, precio: 22 }
        ]
    },
    {
        id: 6, fecha: '2026-02-23', hora: '14:00', sucursal: 'Norte', metodo: 'Tarjeta', productos: [
            { nombre: 'Hojas Blancas Carta', cantidad: 5, precio: 85 }, { nombre: 'Pegamento en Barra', cantidad: 3, precio: 18 }
        ]
    },
    {
        id: 7, fecha: '2026-02-22', hora: '11:30', sucursal: 'Sur', metodo: 'Efectivo', productos: [
            { nombre: 'Cuaderno Profesional', cantidad: 12, precio: 35.5 }, { nombre: 'Sacapuntas Metal', cantidad: 5, precio: 10 }
        ]
    },
    {
        id: 8, fecha: '2026-02-20', hora: '18:15', sucursal: 'Centro', metodo: 'Tarjeta', productos: [
            { nombre: 'Lápiz HB Mirado 2', cantidad: 50, precio: 6 }, { nombre: 'Goma de Migajón', cantidad: 20, precio: 4 }
        ]
    },
];



const getFechaHoy = () => '2026-02-24';

export default function ReportesPage() {
    const [sucursalFiltro, setSucursalFiltro] = useState('Todas');
    const [fechaInicio, setFechaInicio] = useState('2026-02-01');
    const [fechaFin, setFechaFin] = useState('2026-02-28');

    // Modal de Detalles
    const [ticketSeleccionado, setTicketSeleccionado] = useState<any | null>(null);

    const [montado, setMontado] = useState(false);

    useEffect(() => {
        setMontado(true);
    }, []);

    // =========================================================
    // EL MOTOR ANALÍTICO: Todo se calcula a partir de las fechas
    // =========================================================

    const analisisDatos = useMemo(() => {
        // 1. Filtrar las ventas por sucursal y fechas
        const ventasFiltradasBase = HISTORIAL_VENTAS.filter(venta => {
            const pasaSucursal = sucursalFiltro === 'Todas' || venta.sucursal === sucursalFiltro;
            const pasaFechaInicio = !fechaInicio || venta.fecha >= fechaInicio;
            const pasaFechaFin = !fechaFin || venta.fecha <= fechaFin;
            return pasaSucursal && pasaFechaInicio && pasaFechaFin;
        });

        let totalIngresos = 0;
        let totalArticulos = 0;
        const mapaProductos: Record<string, { nombre: string, vendidas: number, ingresos: number }> = {};
        const mapaGrafica: Record<string, number> = {};

        const esUnSoloDia = fechaInicio && fechaFin && fechaInicio === fechaFin;

        // 2. Mapeamos para agregar las propiedades sin hacer enojar a TypeScript
        const ventasFiltradas = ventasFiltradasBase.map(venta => {
            let totalTicket = 0;
            let articulosTicket = 0;

            const ejeX = esUnSoloDia ? venta.hora.substring(0, 2) + ':00' : venta.fecha;

            venta.productos.forEach(prod => {
                const subtotal = prod.cantidad * prod.precio;
                totalTicket += subtotal;
                articulosTicket += prod.cantidad;

                if (!mapaProductos[prod.nombre]) {
                    mapaProductos[prod.nombre] = { nombre: prod.nombre, vendidas: 0, ingresos: 0 };
                }
                mapaProductos[prod.nombre].vendidas += prod.cantidad;
                mapaProductos[prod.nombre].ingresos += subtotal;
            });

            totalIngresos += totalTicket;
            totalArticulos += articulosTicket;

            if (!mapaGrafica[ejeX]) mapaGrafica[ejeX] = 0;
            mapaGrafica[ejeX] += totalTicket;

            // Retornamos la venta original PLUS las nuevas propiedades
            return {
                ...venta,
                total: totalTicket,
                totalArticulos: articulosTicket
            };
        });

        // 3. Ordenar para obtener el Top 10
        const ranking = Object.values(mapaProductos).sort((a, b) => b.vendidas - a.vendidas);
        const masVendidos = ranking.slice(0, 10);
        const menosVendidos = [...ranking].reverse().slice(0, 3);

        // 4. Formatear datos para la gráfica
        const datosGrafica = Object.keys(mapaGrafica).sort().map(key => ({
            label: key,
            total: mapaGrafica[key]
        }));

        return { ventasFiltradas, totalIngresos, totalArticulos, masVendidos, menosVendidos, datosGrafica, esUnSoloDia };
    }, [sucursalFiltro, fechaInicio, fechaFin]);

    const { ventasFiltradas, totalIngresos, totalArticulos, masVendidos, menosVendidos, datosGrafica, esUnSoloDia } = analisisDatos;


    // Botones Rápidos de Tiempo
    const aplicarFiltroRapido = (tipo: string) => {
        const hoy = getFechaHoy();
        if (tipo === 'hoy') { setFechaInicio(hoy); setFechaFin(hoy); }
        if (tipo === 'mes') { setFechaInicio('2026-02-01'); setFechaFin('2026-02-28'); }
        if (tipo === 'todos') { setFechaInicio(''); setFechaFin(''); }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
                    <p className="font-bold text-slate-800 mb-1">{esUnSoloDia ? `Hora: ${label}` : `Fecha: ${label}`}</p>
                    <p className="text-blue-600 font-semibold">Ventas: ${payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full flex flex-col gap-6">

            {/* 1. HEADER Y FILTROS GLOBALES (Estos controlan TODO) */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="text-blue-600 w-6 h-6" /> Reporte General
                </h1>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full xl:w-auto">

                    {/* Botones Rápidos */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => aplicarFiltroRapido('hoy')} className="px-3 py-1.5 text-sm font-semibold rounded-md text-slate-600 hover:bg-white shadow-sm">Hoy</button>
                        <button onClick={() => aplicarFiltroRapido('mes')} className="px-3 py-1.5 text-sm font-semibold rounded-md text-slate-600 hover:bg-white shadow-sm">Este Mes</button>
                        <button onClick={() => aplicarFiltroRapido('todos')} className="px-3 py-1.5 text-sm font-semibold rounded-md text-slate-600 hover:bg-white shadow-sm">Histórico</button>
                    </div>

                    {/* Filtros de Fecha */}
                    <div className="flex items-center gap-2">
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                        <span className="text-slate-400 font-bold">-</span>
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                    </div>

                    {/* Selector de Sucursal */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <Calendar className="w-4 h-4 text-slate-500 ml-2" />
                        <select value={sucursalFiltro} onChange={(e) => setSucursalFiltro(e.target.value)} className="w-36 p-1 text-sm font-bold text-blue-700 bg-transparent border-none focus:outline-none cursor-pointer">
                            <option value="Todas">🏢 Todas las Suc.</option>
                            <option value="Centro">📍 Centro</option>
                            <option value="Norte">📍 Norte</option>
                            <option value="Sur">📍 Sur</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* 2. TARJETAS DE KPIs (Sincronizadas con la fecha) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-green-500">
                    <div className="bg-green-100 p-3 rounded-xl"><DollarSign className="text-green-600 w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Ingresos Totales</p>
                        <h3 className="text-2xl font-black text-slate-800">${totalIngresos.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="bg-blue-100 p-3 rounded-xl"><Package className="text-blue-600 w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Artículos Vendidos</p>
                        <h3 className="text-2xl font-black text-slate-800">{totalArticulos.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 border-l-4 border-l-amber-500">
                    <div className="bg-amber-100 p-3 rounded-xl"><Award className="text-amber-600 w-6 h-6" /></div>
                    <div className="w-full overflow-hidden">
                        <p className="text-sm font-medium text-slate-500">Producto Estrella</p>
                        <h3 className="text-lg font-bold text-slate-800 truncate" title={masVendidos[0]?.nombre || 'Sin ventas'}>
                            {masVendidos[0]?.nombre || 'Sin ventas'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* 3. GRÁFICAS Y TOP 10 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* GRÁFICA */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="text-blue-600 w-5 h-5" /> Curva de Ventas
                        </h2>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                            {esUnSoloDia ? 'POR HORAS' : 'POR DÍAS'}
                        </span>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        {datosGrafica.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 font-medium">No hay ventas en este periodo.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={datosGrafica} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#fff' }} activeDot={{ r: 6, fill: '#2563eb' }} animationDuration={500} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* TOP 10 MÁS VENDIDOS */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col max-h-[400px]">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                            <Award className="text-amber-500 w-4 h-4" /> Top 10 Más Vendidos
                        </h2>
                    </div>
                    <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar">
                        {masVendidos.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm mt-10">Sin ventas registradas.</p>
                        ) : (
                            masVendidos.map((prod, i) => (
                                <div key={prod.nombre} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {i + 1}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-700 w-32 truncate" title={prod.nombre}>{prod.nombre}</span>
                                            <span className="text-xs text-slate-500">{prod.vendidas} unds.</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">${prod.ingresos.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 4. TABLA DE HISTORIAL DE VENTAS (Sin columna ID ni Buscador) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col mt-2">
                <div className="p-5 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Receipt className="text-blue-600 w-5 h-5" />
                        Registro Detallado de Transacciones
                    </h2>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="py-3 px-6 font-semibold">Fecha y Hora</th>
                                <th className="py-3 px-6 font-semibold">Sucursal</th>
                                <th className="py-3 px-6 font-semibold text-center">Cant. Artículos</th>
                                <th className="py-3 px-6 font-semibold text-center">Método Pago</th>
                                <th className="py-3 px-6 font-semibold text-right">Total Cobrado</th>
                                <th className="py-3 px-6 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {ventasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                        No hay registros de ventas en estas fechas.
                                    </td>
                                </tr>
                            ) : (
                                ventasFiltradas.map((venta) => (
                                    <tr key={venta.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="py-3 px-6">
                                            <div className="font-medium text-slate-700">{venta.fecha}</div>
                                            <div className="text-xs text-slate-400">{venta.hora}</div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                                                {venta.sucursal}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-center text-slate-600 font-medium">
                                            {venta.totalArticulos}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${venta.metodo === 'Efectivo' ? 'bg-green-100 text-green-700' :
                                                venta.metodo === 'Tarjeta' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {venta.metodo}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-right font-bold text-slate-800">
                                            ${venta.total?.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <button
                                                onClick={() => setTicketSeleccionado(venta)}
                                                className="bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 px-3 py-1.5 rounded-md flex items-center justify-center gap-2 mx-auto transition-all text-xs font-bold shadow-sm"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================================================
          MODAL DE DETALLES DEL TICKET (NUEVO)
          ========================================================================= */}
            {ticketSeleccionado && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        {/* Header del Ticket */}
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 text-center relative">
                            <div className="w-full">
                                <h2 className="text-lg font-bold text-slate-800">TICKET DE VENTA</h2>
                                <p className="text-xs text-slate-500 mt-1">{ticketSeleccionado.fecha} a las {ticketSeleccionado.hora} • Sucursal {ticketSeleccionado.sucursal}</p>
                            </div>
                            <button onClick={() => setTicketSeleccionado(null)} className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Lista de Productos Vendidos */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                {ticketSeleccionado.productos.map((prod: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start border-b border-dashed border-slate-200 pb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{prod.nombre}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{prod.cantidad} x ${prod.precio.toFixed(2)}</p>
                                        </div>
                                        <span className="font-bold text-slate-800">${(prod.cantidad * prod.precio).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumen Final del Modal */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <div className="flex justify-between text-sm text-slate-600 mb-2">
                                <span>Método de Pago:</span>
                                <span className="font-semibold">{ticketSeleccionado.metodo}</span>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-slate-500 font-medium">Total Cobrado:</span>
                                <span className="text-3xl font-black text-blue-600">${ticketSeleccionado.total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={() => setTicketSeleccionado(null)}
                                className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition-colors"
                            >
                                Cerrar Detalles
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}