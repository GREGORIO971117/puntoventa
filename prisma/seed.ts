import 'dotenv/config';
import { Pool } from 'pg'; // 👈 Importamos el driver nativo
import { PrismaPg } from '@prisma/adapter-pg'; // 👈 Importamos el adaptador
import { PrismaClient } from '@prisma/client';

// 1. Creamos la conexión directa a tu contenedor Docker
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Le ponemos el adaptador de Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos el cliente correctamente (¡Al estilo Prisma 7!)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la siembra de datos...');

  // 1. Crear el usuario Administrador
  const admin = await prisma.sucursal.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nombre: 'Admin General',
      encargado: 'Dueño del Sistema',
      direccion: 'Oficina Central',
      username: 'admin',
      password: 'admin123',
      rol: 'admin',
    },
  });

  // 2. Crear la Sucursal Centro
  const centro = await prisma.sucursal.upsert({
    where: { username: 'caja_centro' },
    update: {},
    create: {
      nombre: 'Centro',
      encargado: 'María López',
      direccion: 'Av. Principal #123',
      username: 'caja_centro',
      password: '123',
      rol: 'cajero',
    },
  });

  // 3. Crear el Inventario inicial
  await prisma.producto.deleteMany(); 

  await prisma.producto.createMany({
    data: [
      { nombre: 'Hojas Blancas Carta', categoria: 'Papelería', precio: 85.0, stock: 150, stockMinimo: 20, sucursal: 'Centro' },
      { nombre: 'Cuaderno Profesional', categoria: 'Escolar', precio: 35.5, stock: 40, stockMinimo: 15, sucursal: 'Centro' },
      { nombre: 'Lápiz HB Mirado 2', categoria: 'Escritura', precio: 6.0, stock: 100, stockMinimo: 10, sucursal: 'Centro' },
    ],
  });

  console.log('✅ ¡Siembra de datos completada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerramos la conexión limpiamente
    await prisma.$disconnect();
    await pool.end();
  });