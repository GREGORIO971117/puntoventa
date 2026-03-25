'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function procesarVenta(datosVenta: {
  sucursalId: string;
  cajeroId: string;
  total: number;
  carrito: any[];
}) {
  const supabase = await createClient();
  const { sucursalId, cajeroId, total, carrito } = datosVenta;

  const sucursalFinal = sucursalId || carrito[0]?.sucursal_id;

  if (!sucursalFinal) {
    return { error: 'Error: No se pudo determinar a qué sucursal pertenece esta venta.' };
  }

  const { data: venta, error: errorVenta } = await supabase
    .from('ventas')
    .insert({
      sucursal_id: sucursalFinal, 
      cajero_id: cajeroId,
      total: total,
      metodo_pago: 'Efectivo',
    })
    .select()
    .single();

  if (errorVenta) {
    console.error("Error Venta:", errorVenta);
    return { error: 'No se pudo generar el ticket en la base de datos.' };
  }

  const detalles = carrito.map((item) => ({
    venta_id: venta.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_venta,
    subtotal: item.cantidad * item.precio_venta,
  }));

  const { error: errorDetalles } = await supabase.from('detalles_venta').insert(detalles);

  if (errorDetalles) {
    console.error("Error Detalles:", errorDetalles);
    return { error: 'Error al guardar los productos del ticket.' };
  }

  // 3. Descontar el inventario de cada producto
  for (const item of carrito) {
    const { data: prod } = await supabase
      .from('productos')
      .select('stock_actual')
      .eq('id', item.id)
      .single();

    if (prod) {
      await supabase
        .from('productos')
        .update({ stock_actual: prod.stock_actual - item.cantidad })
        .eq('id', item.id);
    }
  }

  // 4. Refrescar las pantallas
  revalidatePath('/ventas');
  revalidatePath('/inventario');

  return { success: true };
}