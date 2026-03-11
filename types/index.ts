// types/index.ts

export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type CategoriaProducto = 'Papelería' | 'Escolar' | 'Oficina' | 'Escritura';

export type NombreSucursal = string;

export interface UsuarioSucursal {
    id: string;
    nombre: string;       
    encargado: string;    
    direccion: string;
    username: string;     
    password: string;     
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

export interface ItemCarrito extends ItemInventario {
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