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

export async function editarProducto(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  
  const datosActualizados = {
    sucursal_id: formData.get('sucursal_id'),
    categoria_id: formData.get('categoria_id'),
    codigo_barras: formData.get('codigo_barras') || null,
    nombre: formData.get('nombre'),
    precio_venta: parseFloat(formData.get('precio_venta') as string),
    stock_actual: parseInt(formData.get('stock_actual') as string),
    stock_minimo: parseInt(formData.get('stock_minimo') as string),
    tipo_venta: formData.get('tipo_venta'),
    piezas_por_paquete: parseInt(formData.get('piezas_por_paquete') as string) || 1,
  };

  const { error } = await supabase.from('productos').update(datosActualizados).eq('id', id);

  if (error) {
    console.error("Error al editar:", error);
    return { error: 'No se pudo actualizar el producto.' };
  }

  revalidatePath('/inventario'); 
  revalidatePath('/ventas'); // Actualizamos también la terminal
  return { success: true };
}

export async function eliminarProducto(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('productos').delete().eq('id', id);

  if (error) {
    console.error("Error al eliminar:", error);
    return { error: 'No se pudo eliminar. Revisa si este producto ya tiene ventas registradas.' };
  }

  revalidatePath('/inventario');
  revalidatePath('/ventas');
  return { success: true };
}

export async function vaciarInventario(passwordConfirm: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
  if (perfil?.rol !== 'admin') return { error: 'Solo el administrador puede vaciar el inventario.' };

  const { error } = await supabase
    .from('productos')
    .delete()
    .not('id', 'is', null);

  if (error) {
    if (error.code === '23503') {
      return { error: '❌ ERROR DE BASE DE DATOS: Aún hay ventas amarradas a estos productos. Debes correr el script SQL en Supabase (ON DELETE SET NULL) primero.' };
    }
    return { error: `Error interno de base de datos: ${error.message}` };
  }
  
  revalidatePath('/inventario');
  return { success: true };
}

// 2. Acción para Carga Masiva (Recibe arreglo de objetos limpios)
export async function cargaMasivaProductos(productos: any[]) {
  const supabase = await createClient();
  
  // Insertamos en bloques para mayor seguridad
  const { error } = await supabase.from('productos').insert(productos);

  if (error) {
    console.error(error);
    return { error: 'Error al insertar productos. Verifique que los códigos de barras no estén duplicados.' };
  }

  revalidatePath('/inventario');
  return { success: true };
}