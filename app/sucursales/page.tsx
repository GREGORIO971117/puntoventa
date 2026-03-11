export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { Store, Plus, MapPin, UserCircle, KeyRound, ShieldCheck, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { obtenerSucursales, crearSucursalBD, editarSucursalBD } from '@/app/actions';

export default function SucursalesPage() {
    // 👈 2. Estado local para guardar las sucursales de la BD
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idEditando, setIdEditando] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '', encargado: '', direccion: '', username: '', password: ''
    });

    // 👈 3. Efecto para cargar las sucursales reales al abrir la página
    const cargarDatos = async () => {
        setCargando(true);
        const datosBD = await obtenerSucursales();
        // Filtramos para no mostrar al "admin" en la lista de tiendas físicas
        setSucursales(datosBD.filter((s: any) => s.rol !== 'admin'));
        setCargando(false);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const abrirCrear = () => {
        setIdEditando(null);
        setFormData({ nombre: '', encargado: '', direccion: '', username: '', password: '' });
        setIsModalOpen(true);
    };

    const abrirEditar = (sucursal: any) => {
        setIdEditando(sucursal.id);
        setFormData({
            nombre: sucursal.nombre,
            encargado: sucursal.encargado,
            direccion: sucursal.direccion,
            username: sucursal.username,
            password: sucursal.password
        });
        setIsModalOpen(true);
    };

    // 👈 4. Función conectada a Postgres
    const procesarFormulario = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

        let resultado;
        if (idEditando) {
            resultado = await editarSucursalBD(idEditando, formData);
        } else {
            resultado = await crearSucursalBD(formData);
        }

        if (resultado.success) {
            await cargarDatos(); // Recargamos la lista desde la BD
            setIsModalOpen(false);
        } else {
            alert(resultado.error); // Mostramos error si hay usuario duplicado
        }

        setGuardando(false);
    };

    if (cargando) {
        return <div className="p-10 text-center text-slate-500 font-bold">Cargando sucursales desde la Base de Datos...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full flex flex-col gap-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="text-blue-600 w-7 h-7" />
                        Administración de Sucursales y Accesos
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Gestiona las tiendas físicas y sus credenciales de acceso al sistema.</p>
                </div>
                <Button onClick={abrirCrear} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm h-11 px-6">
                    <Plus className="w-4 h-4" /> Alta de Sucursal
                </Button>
            </div>

            {/* CUADRÍCULA DE SUCURSALES (Tarjetas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sucursales.map((sucursal) => (
                    <div key={sucursal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-300 transition-all group flex flex-col">

                        {/* Cabecera Tarjeta */}
                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                                    <Store className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-lg text-slate-800">Sucursal {sucursal.nombre}</h2>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => abrirEditar(sucursal)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Editar Sucursal"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Cuerpo Tarjeta (Detalles) */}
                        <div className="p-5 space-y-4 flex-1">
                            <div className="flex items-start gap-3 text-slate-600">
                                <UserCircle className="w-5 h-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Encargado</p>
                                    <p className="font-medium text-slate-700">{sucursal.encargado}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-slate-600">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Dirección</p>
                                    <p className="text-sm font-medium text-slate-700">{sucursal.direccion}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Tarjeta (Credenciales) */}
                        <div className="bg-slate-800 p-4 mt-auto">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
                                <KeyRound className="w-3 h-3" /> Credenciales de Acceso
                            </p>
                            <div className="flex justify-between items-center">
                                <div className="bg-slate-900 rounded p-1.5 px-3 border border-slate-700 w-full flex justify-between">
                                    <span className="text-slate-500 text-xs flex items-center">User:</span>
                                    <span className="text-blue-400 font-mono text-sm font-bold">{sucursal.username}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* MODAL UNIFICADO (CREAR / EDITAR SUCURSAL) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">
                                {idEditando ? `Editar Sucursal ${formData.nombre}` : 'Registrar Nueva Sucursal'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={procesarFormulario} className="p-6 space-y-5">
                            <div className="space-y-4 border-b border-slate-100 pb-5">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Store className="w-4 h-4 text-blue-500" /> Datos de la Tienda
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre (Identificador)</label>
                                        <input required type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Galerías" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Encargado</label>
                                        <input required type="text" value={formData.encargado} onChange={e => setFormData({ ...formData, encargado: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre completo" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Completa</label>
                                    <input required type="text" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Calle, Número, Colonia" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-blue-500" /> Credenciales de Sistema
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                                        <input required type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="ej. caja_galerias" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                                        <input required type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border border-slate-200 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                                    {guardando ? 'Guardando...' : (idEditando ? 'Guardar Cambios' : 'Registrar Sucursal')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}