'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, KeyRound, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { sucursales } = useApp(); // Traemos las sucursales para validar

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    // Simulamos un pequeño retraso de red para que se vea natural
    setTimeout(() => {
      // 1. Buscamos si existe la sucursal con esas credenciales
      const sucursalEncontrada = sucursales.find(
        (suc) => suc.username === username && suc.password === password
      );

      // 2. También dejamos una puerta trasera "admin" para el dueño
      const esAdmin = username === 'admin' && password === 'admin123';

      if (sucursalEncontrada || esAdmin) {
        // Credenciales correctas -> Lo mandamos al Punto de Venta
        router.push('/ventas');
      } else {
        // Credenciales incorrectas
        setError('Usuario o contraseña incorrectos. Intenta de nuevo.');
        setCargando(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      {/* Contenedor Principal */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Logo / Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Store className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Goyo<span className="text-blue-600">Manda</span></h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Ingresa las credenciales de tu sucursal</p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in shake-in duration-300">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={iniciarSesion} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Usuario de Sucursal</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="ej. caja_centro"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={cargando}
            className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {cargando ? 'Verificando...' : (
              <>Ingresar al Sistema <ArrowRight className="w-5 h-5" /></>
            )}
          </Button>
        </form>

        {/* Ayuda visual en modo desarrollo */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex flex-col gap-1">
          <p className="font-bold text-slate-700 mb-1">Cuentas de prueba:</p>
          <p>• Admin: <span className="font-mono text-blue-600 font-bold">admin / admin123</span></p>
          <p>• Sucursal: <span className="font-mono text-blue-600 font-bold">caja_centro / 123</span></p>
        </div>

      </div>
    </div>
  );
}