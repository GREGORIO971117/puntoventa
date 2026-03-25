'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function guardarProducto(formData: FormData) {
  const supabase = await createClient();
  
  const nuevoProducto = {
    sucursal_id: formData.get('sucursal_id'),
    categoria_id: formData.get('categoria_id'),
    codigo_barras: formData.get('codigo_barras') || null, // Opcional
    nombre: formData.get('nombre'),
    precio_venta: parseFloat(formData.get('precio_venta') as string),
    stock_actual: parseInt(formData.get('stock_actual') as string),
    stock_minimo: parseInt(formData.get('stock_minimo') as string),
    tipo_venta: formData.get('tipo_venta'),
    piezas_por_paquete: parseInt(formData.get('piezas_por_paquete') as string) || 1,
  };

  const { error } = await supabase.from('productos').insert(nuevoProducto);

  if (error) {
    console.error("Error al guardar:", error);
    return { error: 'No se pudo guardar el producto. Revisa los datos.' };
  }

  // Esto hace que Next.js recargue la tabla de inventario automáticamente al terminar
  revalidatePath('/inventario'); 
  return { success: true };
}