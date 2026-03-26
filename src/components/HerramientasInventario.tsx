'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { cargaMasivaProductos, vaciarInventario } from '@/app/inventario/actions';

export function HerramientasInventario({ sucursales, categorias, productos }: any) {
  const [loading, setLoading] = useState(false);
  const [sucursalDestino, setSucursalDestino] = useState(''); // 👈 NUEVO: Estado para saber a dónde va el Excel
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 📤 EXPORTAR A EXCEL ---
  const exportarExcel = () => {
    const dataParaExcel = productos.map((p: any) => ({
      codigoBarras: p.codigo_barras,
      Nombre: p.nombre,
      Categoria: p.categoria?.nombre || 'Sin categoría',
      Precio: p.precio_venta,
      Stock: p.stock_actual,
      Sucursal: p.sucursal?.nombre || 'Sin sucursal'
    }));

    const ws = XLSX.utils.json_to_sheet(dataParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `Inventario_Galindos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 👈 NUEVO: Valida que haya sucursal antes de abrir la ventana de archivos
  const triggerUpload = () => {
    if (!sucursalDestino) {
      alert("⚠️ Por favor, selecciona a qué sucursal vas a cargar este inventario en el menú desplegable.");
      return;
    }
    fileInputRef.current?.click();
  };

  // --- 📥 IMPORTAR DESDE EXCEL ---
  const manejarSubidaExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      alert("Archivo demasiado grande. Máximo 5MB.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          throw new Error("El archivo no tiene hojas de cálculo.");
        }

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("El archivo Excel está vacío.");
          return;
        }

        // 👈 LÓGICA MEJORADA: Ya no buscamos la sucursal en el Excel, usamos la del Selector
        const productosProcesados = data.map((fila: any) => {
          const cat = categorias.find((c: any) => c.nombre === fila.Categoria);
          return {
            codigo_barras: String(fila.codigoBarras || '').trim().substring(0, 50),
            nombre: String(fila.Nombre || 'Sin Nombre').trim().substring(0, 100),
            precio_venta: Number(fila.Precio) || 0,
            stock_actual: Number(fila.Stock) || 0,
            categoria_id: cat?.id || categorias[0]?.id, // Si no halla la categoría, pone la primera
            sucursal_id: sucursalDestino, // 👈 Se asigna directamente a la sucursal elegida
            tipo_venta: 'Pieza'
          };
        });

        const res = await cargaMasivaProductos(productosProcesados);
        if (res.success) {
          alert("¡Carga masiva completada!");
          setSucursalDestino(''); // Limpiamos el selector
        } else {
          alert(res.error);
        }

      } catch (err) {
        alert("❌ SEGURIDAD: El archivo ha sido rechazado. No es un Excel válido.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(archivo);
  };

  const handleVaciar = async () => {
    const pass = prompt("⚠️ ¡ADVERTENCIA! Estás a punto de borrar TODO el inventario.\n\nPor seguridad, escribe la palabra CONFIRMAR en la caja de abajo:");
    
    if (pass === null) return;

    if (pass.trim().toUpperCase() !== 'CONFIRMAR') {
      alert("Palabra incorrecta. Operación cancelada por seguridad.");
      return;
    }

    // Ya no pedimos un segundo "confirm", con que hayan escrito la palabra es suficiente
    setLoading(true);
    const res = await vaciarInventario('admin'); 
    setLoading(false);
    
    if (res?.error) alert(res.error);
    else alert("✅ Inventario vaciado correctamente.");
  };
return (
  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
      
      {/* 👈 NUEVO: Selector de Sucursal Destino */}
      <select
        className="p-2 border border-slate-300 rounded-md text-sm bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-700 shadow-sm"
        value={sucursalDestino}
        onChange={(e) => setSucursalDestino(e.target.value)}
      >
        <option value="">📁 Selecciona sucursal destino...</option>
        {sucursales.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
      </select>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={manejarSubidaExcel} 
        className="hidden" 
        accept=".xlsx, .xls"
      />
      
      <button 
        onClick={triggerUpload}
        disabled={loading}
        className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        {loading ? 'Procesando...' : 'Importar Excel'}
      </button>

      <button 
        onClick={exportarExcel}
        className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Exportar
      </button>

      <button 
      onClick={handleVaciar}
      disabled={loading}
      className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      Vaciar Inventario
    </button>
    </div>
  );
}