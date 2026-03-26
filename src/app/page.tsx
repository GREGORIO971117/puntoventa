'use client';

import { useState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    // 🌈 FONDO MULTICOLOR ANIMADO
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-600 p-4">
      
      {/* ✨ BURBUJAS DE COLORES FLOTANTES (Fondo) */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse delay-700"></div>
      <div className="absolute -bottom-8 left-1/3 w-40 h-40 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse delay-1000"></div>

      {/* 🔮 TARJETA DE CRISTAL (Glassmorphism) */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-white/50">
        
        <div className="mb-10 text-center">
          <div className="text-6xl mb-4 animate-bounce">🎨🖍️</div>
          {/* TEXTO CON GRADIENTE */}
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-sm">
            HelloKitty
          </h1>
          <p className="text-md font-bold text-pink-500 mt-2 tracking-widest uppercase">
            ✨ Punto de Venta ✨
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100/90 border-l-8 border-red-500 text-red-800 text-sm font-bold rounded-2xl shadow-sm transform hover:scale-105 transition-transform">
            🚨 ¡Ups! {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="group">
            <label className="block text-sm font-extrabold text-purple-600 mb-2 uppercase tracking-wider group-focus-within:text-pink-500 transition-colors">
              👤 Usuario
            </label>
            <input
              type="text"
              name="username"
              required
              autoComplete="off"
              className="w-full p-4 rounded-full border-4 border-pink-200 text-slate-700 font-bold focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-200/50 bg-white shadow-inner transition-all transform hover:scale-[1.02]"
              placeholder="Ej. admin"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-extrabold text-purple-600 mb-2 uppercase tracking-wider group-focus-within:text-cyan-500 transition-colors">
              🔑 Contraseña Secreta
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-4 rounded-full border-4 border-cyan-200 text-slate-700 font-bold focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50 bg-white shadow-inner transition-all transform hover:scale-[1.02]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white font-black text-xl rounded-full shadow-[0_10px_20px_rgba(240,_46,_170,_0.3)] transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🚀 Volando al sistema...' : '¡ENTRAR A LA MAGIA! ✨'}
          </button>
          
        </form>

      </div>
    </main>
  );
}