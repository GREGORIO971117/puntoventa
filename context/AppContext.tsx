'use client';

import React, { createContext, useContext, useState } from 'react';
import { ItemInventario, RegistroVenta, ItemCarrito, NombreSucursal, MetodoPago, UsuarioSucursal } from '@/types';

interface AppContextType {
    inventario: ItemInventario[];
    ventas: RegistroVenta[];
    sucursales: UsuarioSucursal[];
    registrarVenta: (sucursal: NombreSucursal, metodo: MetodoPago, carrito: ItemCarrito[]) => void;
    surtirInventario: (idProducto: number, sucursal: NombreSucursal, cantidad: number) => void;
    agregarNuevoProducto: (producto: ItemInventario) => void;
    agregarSucursal: (sucursal: UsuarioSucursal) => void;
    editarSucursal: (id: string, sucursalActualizada: UsuarioSucursal) => void; // 👈 NUEVA FUNCIÓN
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SUCURSALES_INICIALES: UsuarioSucursal[] = [
    { id: '1', nombre: 'HelloKitty', encargado: 'María López', direccion: 'Av. Principal #123', username: 'caja_hellokitty', password: '123' },
    { id: '2', nombre: 'Norte', encargado: 'Carlos Ruiz', direccion: 'Plaza Norte L-4', username: 'caja_norte', password: '123' },
    { id: '3', nombre: 'Sur', encargado: 'Ana Silva', direccion: 'Blvd. Sur #88', username: 'caja_sur', password: '123' },
];

const INVENTARIO_INICIAL: ItemInventario[] = [
    { id: 1, nombre: 'Hojas Blancas Carta', categoria: 'Papelería', precio: 85.0, stock: 150, stockMinimo: 20, sucursal: 'HelloKitty' },
    { id: 2, nombre: 'Cuaderno Profesional', categoria: 'Escolar', precio: 35.5, stock: 40, stockMinimo: 15, sucursal: 'HelloKitty' },
    { id: 3, nombre: 'Lápiz HB Mirado 2', categoria: 'Escritura', precio: 6.0, stock: 100, stockMinimo: 10, sucursal: 'HelloKitty' },
];

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [inventario, setInventario] = useState<ItemInventario[]>(INVENTARIO_INICIAL);
    const [ventas, setVentas] = useState<RegistroVenta[]>([]);
    const [sucursales, setSucursales] = useState<UsuarioSucursal[]>(SUCURSALES_INICIALES);

    const registrarVenta = (sucursal: NombreSucursal, metodo: MetodoPago, carrito: ItemCarrito[]) => {
        const nuevoTicket: RegistroVenta = {
            id: `TKT-${(ventas.length + 1).toString().padStart(5, '0')}`,
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
            sucursal, metodo, productos: carrito,
            totalArticulos: carrito.reduce((acc, item) => acc + item.cantidad, 0),
            total: carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
        };
        setVentas(prev => [nuevoTicket, ...prev]);
        setInventario(prev => prev.map(item => {
            const vendido = carrito.find(c => c.id === item.id && item.sucursal === sucursal);
            if (vendido) return { ...item, stock: item.stock - vendido.cantidad };
            return item;
        }));
    };

    const surtirInventario = (idProducto: number, sucursal: NombreSucursal, cantidad: number) => {
        setInventario(prev => prev.map(item => item.id === idProducto && item.sucursal === sucursal ? { ...item, stock: item.stock + cantidad } : item));
    };

    const agregarNuevoProducto = (producto: ItemInventario) => setInventario(prev => [...prev, producto]);

    const agregarSucursal = (sucursal: UsuarioSucursal) => setSucursales(prev => [...prev, sucursal]);

    // 👈 LÓGICA DE EDICIÓN
    const editarSucursal = (id: string, sucursalActualizada: UsuarioSucursal) => {
        setSucursales(prev => prev.map(suc => suc.id === id ? sucursalActualizada : suc));
    };

    return (
        <AppContext.Provider value={{ inventario, ventas, sucursales, registrarVenta, surtirInventario, agregarNuevoProducto, agregarSucursal, editarSucursal }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp debe usarse dentro de un AppProvider');
    return context;
};