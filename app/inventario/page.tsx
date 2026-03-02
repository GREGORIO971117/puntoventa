'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Package, AlertTriangle, XCircle, CheckCircle2, Plus, Search,
    MoreVertical, Edit, Trash2, ArrowUpCircle, X,
    ArrowUpDown, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Upload, Download,
    Barcode // 📷 NUEVO: Importamos un icono de código de barras
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { read, utils, writeFile } from 'xlsx';
import {
    obtenerInventario, obtenerSucursales, crearProductoBD,
    surtirProductoBD, eliminarProductoBD, editarProductoBD,
    importarInventarioMasivoBD, eliminarTodoInventarioBD
} from '@/app/actions';

export default function InventarioPage() {
    const [inventario, setInventario] = useState<any[]>([]);
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [importando, setImportando] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [sucursalFiltro, setSucursalFiltro] = useState<string | 'Todas'>('Todas');
    const [estatusFiltro, setEstatusFiltro] = useState<string | 'Todos'>('Todos');
    const [busqueda, setBusqueda] = useState('');
    const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);

    const [ordenConfig, setOrdenConfig] = useState<{ clave: string, direccion: 'asc' | 'desc' } | null>(null);
    const [filasPorPagina, setFilasPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idEditando, setIdEditando] = useState<string | null>(null);

    // 📷 NUEVO: 1. Agregamos codigoBarras al estado inicial
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '', categoria: 'Papelería', precio: '', stock: '', stockMinimo: '', sucursal: '', codigoBarras: ''
    });

    const cargarDatos = async () => {
        setCargando(true);
        const [datosInventario, datosSucursales] = await Promise.all([
            obtenerInventario(),
            obtenerSucursales()
        ]);

        const sucursalesFisicas = datosSucursales.filter((s: any) => s.rol !== 'admin');
        setInventario(datosInventario);
        setSucursales(sucursalesFisicas);

        if (sucursalesFisicas.length > 0 && !idEditando) {
            setNuevoProducto(prev => ({ ...prev, sucursal: sucursalesFisicas[0].nombre }));
        }
        setCargando(false);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const manejarSubidaExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportando(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const hojaNombre = workbook.SheetNames[0];
            const hoja = workbook.Sheets[hojaNombre];
            const productosExcel = utils.sheet_to_json(hoja);

            if (productosExcel.length === 0) {
                alert("El archivo Excel está vacío.");
                setImportando(false);
                return;
            }

            const resultado = await importarInventarioMasivoBD(productosExcel);

            if (resultado.success) {
                alert(`✅ Se importaron ${resultado.count} productos exitosamente.`);
                await cargarDatos();
            } else {
                alert(resultado.error);
            }
        } catch (error) {
            alert("Error al leer el archivo. Asegúrate de que sea válido.");
            console.error(error);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setImportando(false);
        }
    };

    const descargarExcel = () => {
        if (datosProcesados.length === 0) {
            alert("No hay datos para exportar con los filtros actuales.");
            return;
        }

        const datosAExportar = datosProcesados.map(item => {
            let estado = 'Óptimo';
            if (item.stock === 0) estado = 'Agotado';
            else if (item.stock <= item.stockMinimo) estado = 'Bajo Stock';

            return {
                'ID': item.id,
                'Código de Barras': item.codigoBarras || '', // 📷 NUEVO: 2. Lo agregamos al Excel
                'Nombre del Producto': item.nombre,
                'Categoría': item.categoria,
                'Sucursal': item.sucursal,
                'Precio ($)': Number(item.precio),
                'Stock Actual': Number(item.stock),
                'Stock Mínimo': Number(item.stockMinimo),
                'Estado': estado
            };
        });

        const hoja = utils.json_to_sheet(datosAExportar);
        const libro = utils.book_new();
        utils.book_append_sheet(libro, hoja, "Inventario Filtrado");

        const nombreArchivo = `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
        writeFile(libro, nombreArchivo);
    };

    let datosProcesados = inventario.filter((item) => {
        const coincideSucursal = sucursalFiltro === 'Todas' || item.sucursal === sucursalFiltro;
        // 📷 NUEVO: 3. Ahora la barra de búsqueda también busca por código de barras
        const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (item.codigoBarras && item.codigoBarras.includes(busqueda));

        let estadoItem = 'Óptimo';
        if (item.stock === 0) estadoItem = 'Agotado';
        else if (item.stock <= item.stockMinimo) estadoItem = 'Bajo Stock';

        const coincideEstatus = estatusFiltro === 'Todos' || estadoItem === estatusFiltro;

        return coincideSucursal && coincideBusqueda && coincideEstatus;
    });

    if (ordenConfig !== null) {
        datosProcesados.sort((a: any, b: any) => {
            if (a[ordenConfig.clave] < b[ordenConfig.clave]) return ordenConfig.direccion === 'asc' ? -1 : 1;
            if (a[ordenConfig.clave] > b[ordenConfig.clave]) return ordenConfig.direccion === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalPaginas = Math.ceil(datosProcesados.length / filasPorPagina) || 1;
    const paginaSegura = Math.min(paginaActual, totalPaginas);
    const indiceInicio = (paginaSegura - 1) * filasPorPagina;
    const datosPaginados = datosProcesados.slice(indiceInicio, indiceInicio + filasPorPagina);

    const solicitarOrden = (clave: string) => {
        let direccion: 'asc' | 'desc' = 'asc';
        if (ordenConfig && ordenConfig.clave === clave && ordenConfig.direccion === 'asc') direccion = 'desc';
        setOrdenConfig({ clave, direccion });
        setPaginaActual(1);
    };

    const IconoOrden = ({ columna }: { columna: string }) => {
        if (ordenConfig?.clave !== columna) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1" />;
        return ordenConfig.direccion === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600 inline ml-1" /> : <ChevronDown className="w-3 h-3 text-blue-600 inline ml-1" />;
    };

    const vaciarInventario = async () => {
        const confirmar1 = window.confirm("⚠️ ADVERTENCIA: ¿Estás a punto de ELIMINAR TODOS los productos del inventario. ¿Deseas continuar?");
        if (confirmar1) {
            const confirmar2 = window.confirm("🛑 ÚLTIMO AVISO: Esta acción es IRREVERSIBLE y borrará todo el catálogo. ¿Estás absolutamente seguro?");
            if (confirmar2) {
                setGuardando(true);
                const resultado = await eliminarTodoInventarioBD();
                if (resultado.success) {
                    await cargarDatos();
                    alert("🗑️ El inventario ha sido vaciado por completo.");
                } else alert(resultado.error);
                setGuardando(false);
            }
        }
    };

    const surtirProducto = async (id: string, sucursal: string) => {
        const cantidad = window.prompt(`¿Cuántas piezas vas a ingresar al inventario de ${sucursal}?`, '10');
        if (cantidad && !isNaN(Number(cantidad))) {
            const numCantidad = Number(cantidad);
            if (numCantidad > 0) {
                setMenuAbiertoId(null);
                const resultado = await surtirProductoBD(id, numCantidad);
                if (resultado.success) await cargarDatos();
                else alert(resultado.error);
            }
        } else setMenuAbiertoId(null);
    };

    const eliminarProducto = async (id: string) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?");
        if (confirmar) {
            setMenuAbiertoId(null);
            const resultado = await eliminarProductoBD(id);
            if (resultado.success) await cargarDatos();
            else alert(resultado.error);
        }
    };

    const abrirCrear = () => {
        setIdEditando(null);
        // 📷 NUEVO: 4. Reiniciamos el código de barras al crear uno nuevo
        setNuevoProducto({ nombre: '', categoria: 'Papelería', precio: '', stock: '', stockMinimo: '', sucursal: sucursales[0]?.nombre || '', codigoBarras: '' });
        setIsModalOpen(true);
    };

    const abrirEditar = (producto: any) => {
        setIdEditando(producto.id);
        // 📷 NUEVO: 5. Cargamos el código de barras al editar
        setNuevoProducto({
            nombre: producto.nombre, categoria: producto.categoria,
            precio: producto.precio.toString(), stock: producto.stock.toString(),
            stockMinimo: producto.stockMinimo.toString(), sucursal: producto.sucursal,
            codigoBarras: producto.codigoBarras || ''
        });
        setMenuAbiertoId(null);
        setIsModalOpen(true);
    };

    const procesarFormulario = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        let resultado;
        if (idEditando) resultado = await editarProductoBD(idEditando, nuevoProducto);
        else resultado = await crearProductoBD(nuevoProducto);

        if (resultado?.success) {
            await cargarDatos();
            setIsModalOpen(false);
        } else alert(resultado?.error);

        setGuardando(false);
    };

    const getEstadoBadge = (stock: number, minimo: number) => {
        if (stock === 0) return <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded w-fit"><XCircle className="w-3 h-3" /> Agotado</span>;
        if (stock <= minimo) return <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded w-fit"><AlertTriangle className="w-3 h-3" /> Bajo Stock</span>;
        return <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded w-fit"><CheckCircle2 className="w-3 h-3" /> Óptimo</span>;
    };

    if (cargando) return <div className="p-10 text-center text-slate-500 font-bold">Cargando inventario desde la Base de Datos...</div>;

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full flex flex-col">

            <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} onChange={manejarSubidaExcel} className="hidden" />

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 shrink-0">
                    <Package className="text-blue-600 w-6 h-6" /> Control de Inventario
                </h1>

                <div className="flex gap-2 w-full xl:w-auto flex-wrap md:flex-nowrap justify-end">
                    <Button variant="outline" onClick={vaciarInventario} disabled={guardando || inventario.length === 0} className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 shadow-sm">
                        <Trash2 className="w-4 h-4" /> Vaciar
                    </Button>

                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importando} className="flex-1 md:flex-none border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2 shadow-sm">
                        {importando ? 'Procesando...' : <><Upload className="w-4 h-4" /> Importar Excel</>}
                    </Button>

                    <Button variant="outline" onClick={descargarExcel} disabled={datosProcesados.length === 0} className="flex-1 md:flex-none border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Exportar Excel
                    </Button>

                    <Button onClick={abrirCrear} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Nuevo Producto
                    </Button>
                </div>
            </div>

            <div className="bg-white p-3 rounded-t-lg shadow-sm border border-slate-200 border-b-0 flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Buscar por nombre o código..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-slate-600 shrink-0">Estatus:</span>
                        <select value={estatusFiltro} onChange={(e) => { setEstatusFiltro(e.target.value); setPaginaActual(1); }} className="w-full sm:w-40 p-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50">
                            <option value="Todos">⭕ Todos</option>
                            <option value="Óptimo">✅ Óptimo</option>
                            <option value="Bajo Stock">⚠️ Bajo Stock</option>
                            <option value="Agotado">❌ Agotado</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-slate-600 shrink-0">Sucursal:</span>
                        <select value={sucursalFiltro} onChange={(e) => { setSucursalFiltro(e.target.value); setPaginaActual(1); }} className="w-full sm:w-40 p-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50">
                            <option value="Todas">🏢 Todas</option>
                            {sucursales.map(sucursal => (
                                <option key={sucursal.id} value={sucursal.nombre}>📍 {sucursal.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-200 overflow-x-auto min-h-[40vh]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 select-none">
                            {/* 📷 NUEVO: 6. Columna de Código en la tabla */}
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('codigoBarras')}><Barcode className="w-4 h-4 inline mr-1" /> Código <IconoOrden columna="codigoBarras" /></th>
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('nombre')}>Producto <IconoOrden columna="nombre" /></th>
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('categoria')}>Categoría <IconoOrden columna="categoria" /></th>
                            <th className="py-3 px-4 font-semibold text-right cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('precio')}>Precio <IconoOrden columna="precio" /></th>
                            <th className="py-3 px-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('sucursal')}>Sucursal <IconoOrden columna="sucursal" /></th>
                            <th className="py-3 px-4 font-semibold text-center cursor-pointer hover:bg-slate-100" onClick={() => solicitarOrden('stock')}>Stock <IconoOrden columna="stock" /></th>
                            <th className="py-3 px-4 font-semibold">Estado</th>
                            <th className="py-3 px-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {datosPaginados.length === 0 ? (
                            <tr><td colSpan={8} className="py-12 text-center text-slate-400 font-medium">No hay datos para mostrar.</td></tr>
                        ) : (
                            datosPaginados.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                    {/* 📷 NUEVO: 7. Mostramos el código en la fila */}
                                    <td className="py-2.5 px-4 font-mono text-xs text-slate-500">{item.codigoBarras || '-'}</td>
                                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.nombre}</td>
                                    <td className="py-2.5 px-4 text-slate-600">{item.categoria}</td>
                                    <td className="py-2.5 px-4 text-slate-800 font-medium text-right">${Number(item.precio).toFixed(2)}</td>
                                    <td className="py-2.5 px-4"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">{item.sucursal}</span></td>
                                    <td className="py-2.5 px-4 text-center"><span className={`font-bold ${item.stock === 0 ? 'text-red-600' : 'text-slate-800'}`}>{item.stock}</span></td>
                                    <td className="py-2.5 px-4">{getEstadoBadge(item.stock, item.stockMinimo)}</td>
                                    <td className="py-2.5 px-4 text-center relative">
                                        <button onClick={() => setMenuAbiertoId(menuAbiertoId === item.id ? null : item.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {menuAbiertoId === item.id && (
                                            <div className="absolute right-8 top-8 w-36 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                                                <button onClick={() => surtirProducto(item.id, item.sucursal)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"><ArrowUpCircle className="w-4 h-4" /> Surtir</button>
                                                <button onClick={() => abrirEditar(item)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit className="w-4 h-4" /> Editar</button>
                                                <hr className="border-slate-100 my-1" />
                                                <button onClick={() => eliminarProducto(item.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Eliminar</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-3 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600 shadow-sm gap-4">
                <div className="flex items-center gap-2">
                    <span>Mostrar</span>
                    <select value={filasPorPagina} onChange={(e) => { setFilasPorPagina(Number(e.target.value)); setPaginaActual(1); }} className="border border-slate-200 rounded p-1 focus:ring-blue-500 focus:border-blue-500">
                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span>filas</span>
                </div>
                <div className="font-medium text-slate-500">
                    Mostrando {datosProcesados.length === 0 ? 0 : indiceInicio + 1} - {Math.min(indiceInicio + filasPorPagina, datosProcesados.length)} de {datosProcesados.length}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaSegura === 1} className="h-8 px-2"><ChevronLeft className="w-4 h-4" /> Anterior</Button>
                    <span className="font-semibold text-slate-800 px-2">Pág {paginaSegura} de {totalPaginas}</span>
                    <Button variant="outline" size="sm" onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} className="h-8 px-2">Siguiente <ChevronRight className="w-4 h-4" /></Button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">
                                {idEditando ? 'Editar Producto' : 'Registrar Producto'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={procesarFormulario} className="p-6 space-y-4">

                            {/* 📷 NUEVO: 8. Input para el Código de Barras al inicio del formulario */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código de Barras (Opcional)</label>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" placeholder="Ej. 7501234567890" value={nuevoProducto.codigoBarras} onChange={e => setNuevoProducto({ ...nuevoProducto, codigoBarras: e.target.value })} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm font-mono" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input required type="text" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                    <select value={nuevoProducto.categoria} onChange={e => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm">
                                        <option value="Papelería">Papelería</option><option value="Escolar">Escolar</option>
                                        <option value="Oficina">Oficina</option><option value="Escritura">Escritura</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sucursal</label>
                                    <select value={nuevoProducto.sucursal} onChange={e => setNuevoProducto({ ...nuevoProducto, sucursal: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm">
                                        {sucursales.map(sucursal => (
                                            <option key={sucursal.id} value={sucursal.nombre}>{sucursal.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio</label>
                                    <input required type="number" step="0.5" min="0" value={nuevoProducto.precio} onChange={e => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
                                    <input required type="number" min="0" value={nuevoProducto.stock} onChange={e => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Min</label>
                                    <input required type="number" min="0" value={nuevoProducto.stockMinimo} onChange={e => setNuevoProducto({ ...nuevoProducto, stockMinimo: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {guardando ? 'Guardando...' : (idEditando ? 'Guardar Cambios' : 'Crear Producto')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}