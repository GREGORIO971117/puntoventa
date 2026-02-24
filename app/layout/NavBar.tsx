'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, ShoppingCart, Package, BarChart, Menu, X, UserCircle, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react'; // 👈 1. Importamos las funciones reales de NextAuth

export function Navbar() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const pathname = usePathname();

    // 👈 2. Obtenemos la sesión real del JWT
    const { data: session } = useSession();

    // Nuestra lista de pantallas
    const rutas = [
        { nombre: 'Punto de Venta', url: '/ventas', icono: ShoppingCart },
        { nombre: 'Inventario', url: '/inventario', icono: Package },
        { nombre: 'Reportes', url: '/reportes', icono: BarChart },
        { nombre: 'Sucursales', url: '/sucursales', icono: Store },
    ];

    // 👈 3. Ocultar si estamos en el Login
    if (pathname === '/') {
        return null;
    }

    // 👈 4. LA SOLUCIÓN AL ERROR 404: Solo mostramos el Navbar en rutas registradas
    const esRutaValida = rutas.some(ruta => pathname.startsWith(ruta.url));
    if (!esRutaValida) {
        return null;
    }

    return (
        <nav className="bg-slate-900 text-slate-100 shadow-md h-16 w-full z-50">
            <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">

                {/* Logotipo y Título */}
                <Link href="/ventas" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Store className="w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight text-white">Hello<span className="text-blue-500">Kitty</span></span>
                </Link>

                {/* Menú para PC (Pantallas grandes) */}
                <div className="hidden md:flex items-center gap-1">
                    {rutas.map((ruta) => {
                        const Icono = ruta.icono;
                        const activo = pathname === ruta.url;

                        return (
                            <Link
                                key={ruta.url}
                                href={ruta.url}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activo
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icono className="w-4 h-4" />
                                {ruta.nombre}
                            </Link>
                        );
                    })}
                </div>

                {/* 👈 NUEVO: Sección de Perfil y Cerrar Sesión (Derecha) */}
                <div className="hidden md:flex items-center gap-4 border-l border-slate-700 pl-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <UserCircle className="w-5 h-5 text-blue-400" />
                                {/* Muestra el nombre de la sucursal guardado en el JWT */}
                                <span className="font-medium">{session.user?.name}</span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 px-3 py-1.5 rounded-md transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Salir
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* Botón de Menú para Celulares */}
                <button
                    className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

            </div>

            {/* Menú Desplegable (Celulares) */}
            {menuAbierto && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900 border-t border-slate-800 shadow-xl flex flex-col px-4 py-4 gap-2 z-50">

                    {/* Info del usuario en móvil */}
                    {session && (
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                            <div className="flex items-center gap-2 text-slate-300">
                                <UserCircle className="w-5 h-5 text-blue-400" />
                                <span className="font-medium">{session.user?.name}</span>
                            </div>
                            <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white rounded-md transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {rutas.map((ruta) => {
                        const Icono = ruta.icono;
                        const activo = pathname === ruta.url;

                        return (
                            <Link
                                key={ruta.url}
                                href={ruta.url}
                                onClick={() => setMenuAbierto(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activo
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icono className="w-5 h-5" />
                                {ruta.nombre}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
} 