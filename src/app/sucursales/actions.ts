'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function guardarSucursal(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;
  
  const datos = {
    nombre: formData.get('nombre'),
    direccion: formData.get('direccion') || null,
    telefono: formData.get('telefono') || null,
  };

  let error;

  if (id) {
    // Si hay un ID, significa que estamos EDITANDO
    const { error: errUpdate } = await supabase.from('sucursales').update(datos).eq('id', id);
    error = errUpdate;
  } else {
    // Si no hay ID, estamos CREANDO una nueva
    const { error: errInsert } = await supabase.from('sucursales').insert(datos);
    error = errInsert;
  }

  if (error) {
    console.error("Error Sucursal:", error);
    return { error: 'No se pudo guardar la información de la sucursal.' };
  }

  revalidatePath('/sucursales');
  return { success: true };
}

export async function eliminarSucursal(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('sucursales').delete().eq('id', id);

  if (error) {
    console.error("Error al eliminar sucursal:", error);
    return { error: 'No se pudo eliminar. Es posible que esta sucursal ya tenga ventas o productos registrados.' };
  }

  revalidatePath('/sucursales');
  return { success: true };
}