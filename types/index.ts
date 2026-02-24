// types/index.ts

export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type CategoriaProducto = 'Papelería' | 'Escolar' | 'Oficina' | 'Escritura';

// 1. Flexibilizamos la sucursal para que acepte cualquier texto nuevo
export type NombreSucursal = string;

// 2. NUEVA ENTIDAD: La Sucursal / Usuario
export interface UsuarioSucursal {
    id: string;
    nombre: string;       // Ej: "Centro", "Plaza Dorada"
    encargado: string;    // Ej: "Juan Pérez"
    direccion: string;
    username: string;     // Ej: "caja_centro"
    password: string;     // En un futuro esto irá encriptado
}

export interface ProductoBase {
    id: number;
    nombre: string;
    categoria: CategoriaProducto | string;
    precio: number;
}

export interface ItemInventario extends ProductoBase {
    stock: number;
    stockMinimo: number;
    sucursal: NombreSucursal;
}

export interface ItemCarrito extends ProductoBase {
    cantidad: number;
}

export interface RegistroVenta {
    id: string | number;
    fecha: string;
    hora: string;
    sucursal: NombreSucursal;
    metodo: MetodoPago;
    productos: ItemCarrito[];
    totalArticulos: number;
    total: number;
}