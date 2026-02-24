'use client';

import { useState } from 'react';
import {
    Package, AlertTriangle, XCircle, CheckCircle2, Plus, Search,
    MoreVertical, Edit, Trash2, ArrowUpCircle, X,
    ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const INVENTARIO_INICIAL = [
    { id: 1, nombre: 'Hojas Blancas Carta', categoria: 'Papelería', precio: 85.0, stock: 150, stockMinimo: 20, sucursal: 'Centro' },
    { id: 2, nombre: 'Hojas Blancas Carta', categoria: 'Papelería', precio: 85.0, stock: 5, stockMinimo: 20, sucursal: 'Norte' },
    { id: 3, nombre: 'Cuaderno Profesional', categoria: 'Escolar', precio: 35.5, stock: 0, stockMinimo: 15, sucursal: 'Centro' },
    { id: 4, nombre: 'Lápiz HB Mirado 2', categoria: 'Escritura', precio: 6.0, stock: 45, stockMinimo: 10, sucursal: 'Norte' },
    { id: 5, nombre: 'Goma de Migajón', categoria: 'Escritura', precio: 4.0, stock: 12, stockMinimo: 15, sucursal: 'Centro' },
    { id: 6, nombre: 'Calculadora Científica', categoria: 'Oficina', precio: 250.0, stock: 3, stockMinimo: 2, sucursal: 'Sur' },
    { id: 7, nombre: 'Marcatextos Amarillo', categoria: 'Escritura', precio: 12.0, stock: 25, stockMinimo: 10, sucursal: 'Centro' },
    { id: 8, nombre: 'Tijeras Punta Roma', categoria: 'Escolar', precio: 22.0, stock: 18, stockMinimo: 10, sucursal: 'Norte' },
];

export default function InventarioPage() {
    const [inventario, setInventario] = useState(INVENTARIO_INICIAL);
    const [sucursalFiltro, setSucursalFiltro] = useState('Todas');
    const [busqueda, setBusqueda] = useState('');
    const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);

    // --- NUEVOS ESTADOS: ORDENAMIENTO Y PAGINACIÓN ---
    const [ordenConfig, setOrdenConfig] = useState<{ clave: string, direccion: 'asc' | 'desc' } | null>(null);
    const [filasPorPagina, setFilasPorPagina] = useState(5);
    const [paginaActual, setPaginaActual] = useState(1);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '', categoria: 'Papelería', precio: '', stock: '', stockMinimo: '', sucursal: 'Centro'
    });

    // ==========================================
    // 1. FILTRADO (Buscador y Sucursal)
    // ==========================================
    let datosProcesados = inventario.filter((item) => {
        const coincideSucursal = sucursalFiltro === 'Todas' || item.sucursal === sucursalFiltro;
        const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideSucursal && coincideBusqueda;
    });

    // ==========================================
    // 2. ORDENAMIENTO (Estilo Excel)
    // ==========================================
    if (ordenConfig !== null) {
        datosProcesados.sort((a: any, b: any) => {
            if (a[ordenConfig.clave] < b[ordenConfig.clave]) return ordenConfig.direccion === 'asc' ? -1 : 1;
            if (a[ordenConfig.clave] > b[ordenConfig.clave]) return ordenConfig.direccion === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // ==========================================
    // 3. PAGINACIÓN
    // ==========================================
    const totalPaginas = Math.ceil(datosProcesados.length / filasPorPagina) || 1;
    const paginaSegura = Math.min(paginaActual, totalPaginas); // Evita quedarse en una página vacía

    const indiceInicio = (paginaSegura - 1) * filasPorPagina;
    const datosPaginados = datosProcesados.slice(indiceInicio, indiceInicio + filasPorPagina);

    // --- FUNCIONES INTERACTIVAS ---

    const solicitarOrden = (clave: string) => {
        let direccion: 'asc' | 'desc' = 'asc';
        if (ordenConfig && ordenConfig.clave === clave && ordenConfig.direccion === 'asc') {
            direccion = 'desc';
        }
        setOrdenConfig({ clave, direccion });
        setPaginaActual(1); // Regresamos a la página 1 al reordenar
    };

    const IconoOrden = ({ columna }: { columna: string }) => {
        if (ordenConfig?.clave !== columna) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1" />;
        return ordenConfig.direccion === 'asc'
            ? <ChevronUp className="w-3 h-3 text-blue-600 inline ml-1" />
            : <ChevronDown className="w-3 h-3 text-blue-600 inline ml-1" />;
    };

    const surtirProducto = (id: number) => {
        const cantidad = window.prompt('¿Cuántas piezas vas a ingresar al inventario?', '10');
        if (cantidad && !isNaN(Number(cantidad))) {
            setInventario(prev => prev.map(item =>
                item.id === id ? { ...item, stock: item.stock + Number(cantidad) } : item
            ));
        }
        setMenuAbiertoId(null);
    };

    const eliminarProducto = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar este producto del inventario?')) {
            setInventario(prev => prev.filter(item => item.id !== id));
        }
        setMenuAbiertoId(null);
    };

    const guardarNuevoProducto = (e: React.FormEvent) => {
        e.preventDefault();
        const idNuevo = inventario.length ? Math.max(...inventario.map(i => i.id)) + 1 : 1;
        setInventario([...inventario, {
            id: idNuevo, nombre: nuevoProducto.nombre, categoria: nuevoProducto.categoria,
            precio: Number(nuevoProducto.precio), stock: Number(nuevoProducto.stock),
            stockMinimo: Number(nuevoProducto.stockMinimo), sucursal: nuevoProducto.sucursal
        }]);
        setIsModalOpen(false);
    };

    const getEstadoBadge = (stock: number, minimo: number) => {
        if (stock === 0) return <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded w-fit"><XCircle className="w-3 h-3" /> Agotado</span>;
        if (stock <= minimo) return <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded w-fit"><AlertTriangle className="w-3 h-3" /> Bajo Stock</span>;
        return <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded w-fit"><CheckCircle2 className="w-3 h-3" /> Óptimo</span>;
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full flex flex-col">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Package className="text-blue-600 w-6 h-6" /> Control de Inventario
                </h1>
                <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> Nuevo Producto
                </Button>
            </div>

            {/* FILTROS GLOBALES */}
            <div className="bg-white p-3 rounded-t-lg shadow-sm border border-slate-200 border-b-0 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-600">Sucursal:</span>
                    <select
                        value={sucursalFiltro}
                        onChange={(e) => { setSucursalFiltro(e.target.value); setPaginaActual(1); }}
                        className="w-full md:w-48 p-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    >
                        <option value="Todas">🏢 Todas (Vista Admin)</option>
                        <option value="Centro">📍 Centro</option>
                        <option value="Norte">📍 Norte</option>
                        <option value="Sur">📍 Sur</option>
                    </select>
                </div>
            </div>

            {/* TABLA DE INVENTARIO */}
            <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto min-h-[40vh]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 select-none">
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('nombre')}>
                                Producto <IconoOrden columna="nombre" />
                            </th>
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('categoria')}>
                                Categoría <IconoOrden columna="categoria" />
                            </th>
                            <th className="py-3 px-4 font-semibold text-right cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('precio')}>
                                Precio <IconoOrden columna="precio" />
                            </th>
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('sucursal')}>
                                Sucursal <IconoOrden columna="sucursal" />
                            </th>
                            <th className="py-3 px-4 font-semibold text-center cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('stock')}>
                                Stock <IconoOrden columna="stock" />
                            </th>
                            <th className="py-3 px-4 font-semibold">Estado</th>
                            <th className="py-3 px-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {datosPaginados.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                                    No hay datos para mostrar con los filtros actuales.
                                </td>
                            </tr>
                        ) : (
                            datosPaginados.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.nombre}</td>
                                    <td className="py-2.5 px-4 text-slate-600">{item.categoria}</td>
                                    <td className="py-2.5 px-4 text-slate-800 font-medium text-right">${item.precio.toFixed(2)}</td>
                                    <td className="py-2.5 px-4">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                                            {item.sucursal}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        <span className={`font-bold ${item.stock === 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        {getEstadoBadge(item.stock, item.stockMinimo)}
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="py-2.5 px-4 text-center relative">
                                        <button
                                            onClick={() => setMenuAbiertoId(menuAbiertoId === item.id ? null : item.id)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        {menuAbiertoId === item.id && (
                                            <div className="absolute right-8 top-8 w-36 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                                                <button onClick={() => surtirProducto(item.id)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2">
                                                    <ArrowUpCircle className="w-4 h-4" /> Surtir
                                                </button>
                                                <button onClick={() => setMenuAbiertoId(null)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                    <Edit className="w-4 h-4" /> Editar
                                                </button>
                                                <hr className="border-slate-100 my-1" />
                                                <button onClick={() => eliminarProducto(item.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ==========================================
          FOOTER: PAGINACIÓN Y FILAS POR PÁGINA
          ========================================== */}
            <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-3 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 shadow-sm gap-4">

                {/* Selector de Filas */}
                <div className="flex items-center gap-2">
                    <span>Mostrar</span>
                    <select
                        value={filasPorPagina}
                        onChange={(e) => {
                            setFilasPorPagina(Number(e.target.value));
                            setPaginaActual(1); // Regresamos a la pag 1 si cambia la cantidad
                        }}
                        className="border border-slate-200 rounded p-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                    <span>filas</span>
                </div>

                {/* Información de Registros */}
                <div className="font-medium text-slate-500">
                    Mostrando {datosProcesados.length === 0 ? 0 : indiceInicio + 1} - {Math.min(indiceInicio + filasPorPagina, datosProcesados.length)} de {datosProcesados.length}
                </div>

                {/* Botones de Navegación */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                        disabled={paginaSegura === 1}
                        className="h-8 px-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </Button>

                    <span className="font-semibold text-slate-800 px-2">
                        Pág {paginaSegura} de {totalPaginas}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                        disabled={paginaSegura === totalPaginas}
                        className="h-8 px-2"
                    >
                        Siguiente <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* MODAL DE NUEVO PRODUCTO (Se mantiene igual) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Registrar Producto</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={guardarNuevoProducto} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input required type="text" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                    <select value={nuevoProducto.categoria} onChange={e => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm">
                                        <option value="Papelería">Papelería</option>
                                        <option value="Escolar">Escolar</option>
                                        <option value="Oficina">Oficina</option>
                                        <option value="Escritura">Escritura</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
                                    <select value={nuevoProducto.sucursal} onChange={e => setNuevoProducto({ ...nuevoProducto, sucursal: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm">
                                        <option value="Centro">Centro</option>
                                        <option value="Norte">Norte</option>
                                        <option value="Sur">Sur</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                                    <input required type="number" step="0.5" min="0" value={nuevoProducto.precio} onChange={e => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
                                    <input required type="number" min="0" value={nuevoProducto.stock} onChange={e => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Min</label>
                                    <input required type="number" min="0" value={nuevoProducto.stockMinimo} onChange={e => setNuevoProducto({ ...nuevoProducto, stockMinimo: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Guardar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}