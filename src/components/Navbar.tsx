'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Navbar({ perfil, sucursalNombre, logoutAction }: { perfil: any, sucursalNombre: string, logoutAction: any }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="bg-slate-900 text-white shadow-sm shrink-0 relative z-50">
      <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
        
        {/* LOGO Y SUCURSAL */}
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-wide">PAPELERÍA GALINDOS</h1>
          <p className="text-[10px] lg:text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
            {sucursalNombre} • <span className="text-blue-400">{perfil?.username}</span>
          </p>
        </div>

        {/* MENÚ DE ESCRITORIO (Oculto en celular) */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-800 p-1.5 rounded-md">
          <Link href="/ventas" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">POS</Link>
          {perfil?.rol === 'admin' && (
            <>
              <Link href="/inventario" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Inventario</Link>
              <Link href="/sucursales" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Sucursales</Link>
              <Link href="/usuarios" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Usuarios</Link>
              <Link href="/historial" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors">Historial</Link>
            </>
          )}
        </nav>

        {/* BOTONES DERECHOS (Hamburguesa y Salir) */}
        <div className="flex items-center gap-3">
          <form action={logoutAction} className="hidden md:block">
            <button type="submit" className="text-sm font-medium text-slate-300 hover:text-white border border-slate-600 bg-slate-800 px-4 py-2 rounded-md transition-colors">
              Salir
            </button>
          </form>
          
          {/* BOTÓN HAMBURGUESA (Solo en celular) */}
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {menuAbierto && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-800 border-t border-slate-700 shadow-xl py-2 px-4 flex flex-col gap-2">
          <Link onClick={() => setMenuAbierto(false)} href="/ventas" className="px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 rounded">Terminal POS</Link>
          {perfil?.rol === 'admin' && (
            <>
              <Link onClick={() => setMenuAbierto(false)} href="/inventario" className="px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 rounded">Inventario</Link>
              <Link onClick={() => setMenuAbierto(false)} href="/sucursales" className="px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 rounded">Sucursales</Link>
              <Link onClick={() => setMenuAbierto(false)} href="/usuarios" className="px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 rounded">Usuarios</Link>
              <Link onClick={() => setMenuAbierto(false)} href="/historial" className="px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 rounded">Historial y Reportes</Link>
            </>
          )}
          <form action={logoutAction} className="mt-2 border-t border-slate-700 pt-2">
            <button type="submit" className="w-full text-left px-4 py-3 text-sm font-bold text-red-400 hover:bg-slate-700 rounded">
              Cerrar Sesión
            </button>
          </form>
        </div>
      )}
    </header>
  );
}