'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function eliminarVentasMasivo(ventaIds: string[]) {
  const supabase = await createClient();
  
  // 1. Verificamos que sea el administrador
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
  if (perfil?.rol !== 'admin') return { error: 'Solo el administrador puede borrar el historial.' };

  // 2. Borrar primero los productos de esos tickets (detalles_venta)
  const { error: errDetalles } = await supabase
    .from('detalles_venta')
    .delete()
    .in('venta_id', ventaIds); // .in() busca todos los IDs que le pasemos en la lista

  if (errDetalles) {
    console.error(errDetalles);
    return { error: 'Error al limpiar los detalles de los tickets.' };
  }

  // 3. Borrar los tickets principales (ventas)
  const { error: errVentas } = await supabase
    .from('ventas')
    .delete()
    .in('id', ventaIds);

  if (errVentas) {
    console.error(errVentas);
    return { error: 'Error al borrar los tickets principales.' };
  }

  // 4. Actualizamos la pantalla
  revalidatePath('/historial');
  return { success: true };
}