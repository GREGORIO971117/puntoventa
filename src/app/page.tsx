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
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white p-8 rounded-sm shadow-sm border border-slate-200">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Papelería Galindos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistema de Punto de Venta
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              required
              autoComplete="off"
              className="w-full p-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50"
              placeholder="Ej. admin"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-2.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 bg-slate-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-sm transition-colors disabled:bg-slate-600"
          >
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>

      </div>
    </main>
  );
}