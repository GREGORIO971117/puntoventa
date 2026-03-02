'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// ACCIONES PARA SUCURSALES
// ==========================================

export async function obtenerSucursales() {
    // Traemos todas las sucursales ordenadas por fecha de creación
    return await prisma.sucursal.findMany({
        orderBy: { createdAt: 'asc' }
    });
}

export async function crearSucursalBD(data: any) {
    try {
        await prisma.sucursal.create({
            data: {
                nombre: data.nombre,
                encargado: data.encargado,
                direccion: data.direccion,
                username: data.username,
                password: data.password,
                rol: 'cajero' // Por defecto
            }
        });
        // Refrescamos la caché de la página para que aparezca inmediatamente
        revalidatePath('/sucursales');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al crear la sucursal. Quizá el usuario ya existe.' };
    }
}

export async function editarSucursalBD(id: string, data: any) {
    try {
        await prisma.sucursal.update({
            where: { id: id },
            data: {
                nombre: data.nombre,
                encargado: data.encargado,
                direccion: data.direccion,
                username: data.username,
                password: data.password,
            }
        });
        revalidatePath('/sucursales');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error al actualizar' };
    }
}

// ==========================================
// ACCIONES PARA INVENTARIO
// ==========================================

export async function obtenerInventario() {
    // Traemos todos los productos ordenados por nombre
    return await prisma.producto.findMany({
        orderBy: { nombre: 'asc' }
    });
}

export async function crearProductoBD(data: any) {
    try {
        await prisma.producto.create({
            data: {
                nombre: data.nombre,
                categoria: data.categoria,
                precio: Number(data.precio),
                stock: Number(data.stock),
                stockMinimo: Number(data.stockMinimo),
                sucursal: data.sucursal, // A qué sucursal pertenece
                // 📷 NUEVO: Lógica del código de barras (convertimos vacío a null para evitar choques)
                codigoBarras: data.codigoBarras && String(data.codigoBarras).trim() !== '' ? String(data.codigoBarras).trim() : null,
            }
        });
        revalidatePath('/inventario');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al crear el producto. ¿Quizá el código de barras ya existe en otro producto?' };
    }
}

export async function editarProductoBD(id: string, data: any) {
    try {
        await prisma.producto.update({
            where: { id: id },
            data: {
                nombre: data.nombre,
                categoria: data.categoria,
                precio: Number(data.precio),
                stock: Number(data.stock),
                stockMinimo: Number(data.stockMinimo),
                sucursal: data.sucursal,
                // 📷 NUEVO: Lógica del código de barras al editar
                codigoBarras: data.codigoBarras && String(data.codigoBarras).trim() !== '' ? String(data.codigoBarras).trim() : null,
            }
        });
        revalidatePath('/inventario');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al actualizar. ¿El código de barras ya pertenece a otro artículo?' };
    }
}

export async function surtirProductoBD(id: string, cantidadExtra: number) {
    try {
        // 1. Buscamos el producto actual para saber cuánto stock tiene
        const productoActual = await prisma.producto.findUnique({
            where: { id: id }
        });

        if (!productoActual) throw new Error("Producto no encontrado");

        // 2. Sumamos el stock actual + la cantidad extra
        const nuevoStock = productoActual.stock + cantidadExtra;

        // 3. Actualizamos en la base de datos
        await prisma.producto.update({
            where: { id: id },
            data: { stock: nuevoStock }
        });

        revalidatePath('/inventario');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al surtir el producto.' };
    }
}

export async function eliminarProductoBD(id: string) {
    try {
        await prisma.producto.delete({
            where: { id: id }
        });
        revalidatePath('/inventario');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al eliminar el producto.' };
    }
}

export async function importarInventarioMasivoBD(productos: any[]) {
    try {
        let insertados = 0;

        // Usamos una transacción para que sea más rápido y seguro
        await prisma.$transaction(async (tx) => {
            for (const prod of productos) {
                // Validamos que al menos tenga nombre
                if (!prod.Nombre && !prod.nombre) continue;

                // 📷 NUEVO: Escaneamos múltiples posibilidades de cómo se llame la columna en el Excel
                const rawCodigo = prod['Código de Barras'] || prod['Codigo de Barras'] || prod.Codigo || prod.codigo || prod.codigoBarras || null;
                const finalCodigo = rawCodigo && String(rawCodigo).trim() !== '' ? String(rawCodigo).trim() : null;

                await tx.producto.create({
                    data: {
                        // Soportamos si en el Excel lo escribieron con mayúscula o minúscula
                        nombre: String(prod.Nombre || prod.nombre || 'Sin nombre'),
                        categoria: String(prod.Categoria || prod.categoria || 'Papelería'),
                        precio: Number(prod.Precio || prod.precio || 0),
                        stock: Number(prod.Stock || prod.stock || 0),
                        stockMinimo: Number(prod.StockMinimo || prod.stockMinimo || 5),
                        sucursal: String(prod.Sucursal || prod.sucursal || 'Centro'),
                        codigoBarras: finalCodigo, // 👈 Lo agregamos a la creación masiva
                    }
                });
                insertados++;
            }
        });

        revalidatePath('/inventario');
        return { success: true, count: insertados };
    } catch (error) {
        console.error("Error importando Excel:", error);
        return { success: false, error: 'Hubo un error al procesar el archivo. Revisa que no haya códigos de barras duplicados en el Excel.' };
    }
}

export async function eliminarTodoInventarioBD() {
    try {
        // deleteMany sin condiciones ({}) borra TODOS los registros de esa tabla
        await prisma.producto.deleteMany({});

        revalidatePath('/inventario');
        return { success: true };
    } catch (error) {
        console.error("Error al vaciar inventario:", error);
        return { success: false, error: 'Error al eliminar todos los productos.' };
    }
}

// ==========================================
// ACCIONES PARA VENTAS
// ==========================================

export async function registrarVentaBD(sucursalActiva: string, metodoPago: string, carrito: any[]) {
    try {
        // 1. Calculamos totales (Validando desde el servidor por seguridad)
        let totalCobrado = 0;
        let totalArticulos = 0;

        for (const item of carrito) {
            totalCobrado += item.precio * item.cantidad;
            totalArticulos += item.cantidad;
        }

        // 2. Buscamos el ID de la sucursal activa basándonos en su nombre
        const sucursalDB = await prisma.sucursal.findUnique({
            where: { nombre: sucursalActiva }
        });

        if (!sucursalDB) throw new Error("Sucursal no encontrada");

        // 3. Ejecutamos una TRANSACCIÓN (O se hace todo, o no se hace nada)
        await prisma.$transaction(async (tx) => {

            // A) Creamos el registro del ticket de venta
            await tx.venta.create({
                data: {
                    sucursalId: sucursalDB.id,
                    total: totalCobrado,
                    totalArticulos: totalArticulos,
                    metodoPago: metodoPago,
                    items: carrito, // Guardamos el array de productos en la columna JSON
                }
            });

            // B) Descontamos el stock de cada producto vendido
            for (const item of carrito) {
                await tx.producto.update({
                    where: { id: item.id },
                    data: {
                        stock: {
                            decrement: item.cantidad // Prisma resta automáticamente
                        }
                    }
                });
            }
        });

        // 4. Refrescamos las pantallas que dependen de esto
        revalidatePath('/ventas');
        revalidatePath('/inventario');
        revalidatePath('/reportes');

        return { success: true };
    } catch (error) {
        console.error("Error al procesar la venta:", error);
        return { success: false, error: 'Ocurrió un error al procesar el ticket. Revisa el stock.' };
    }
}

export async function obtenerReportesBD() {
    // Traemos todas las ventas ordenadas de la más reciente a la más antigua
    // Usamos 'include' para que Prisma traiga también el nombre de la sucursal
    return await prisma.venta.findMany({
        orderBy: { fecha: 'desc' },
        include: {
            sucursal: {
                select: { nombre: true } // Solo traemos el nombre para no exponer contraseñas
            }
        }
    });
}