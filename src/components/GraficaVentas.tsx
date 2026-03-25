'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficaVentas({ ventas }: { ventas: any[] }) {
  // Procesamos los datos para agrupar las ventas por fecha (Día)
  const ventasPorDia = ventas.reduce((acc: any, venta: any) => {
    // Extraemos solo la fecha (YYYY-MM-DD)
    const fecha = new Date(venta.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    
    if (!acc[fecha]) {
      acc[fecha] = { fecha, total: 0 };
    }
    acc[fecha].total += Number(venta.total);
    return acc;
  }, {});

  // Convertimos el objeto a un arreglo para la gráfica y lo ordenamos cronológicamente
  const datosGrafica = Object.values(ventasPorDia).reverse();

  if (datosGrafica.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No hay datos suficientes para la gráfica.</div>;
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="fecha" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            formatter={(value) => typeof value === 'number' ? [`$${value.toFixed(2)}`, 'Ingresos'] : value}
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}