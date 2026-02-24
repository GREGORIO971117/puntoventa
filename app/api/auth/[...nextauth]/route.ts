import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                // 1. Aquí simulamos la Base de Datos real. 
                // Cuando conectes SQL o Dexie, aquí harás la consulta a la base de datos.
                const sucursalesDB = [
                    { id: '1', nombre: 'HelloKitty', username: 'caja_HelloKitty', password: '123', rol: 'cajero' },
                    { id: '2', nombre: 'Norte', username: 'caja_norte', password: '123', rol: 'cajero' },
                    { id: 'admin', nombre: 'Admin General', username: 'admin', password: 'admin123', rol: 'admin' }
                ];

                // 2. Buscamos si las credenciales coinciden
                const usuarioValido = sucursalesDB.find(
                    (u) => u.username === credentials?.username && u.password === credentials?.password
                );

                // 3. Si es válido, lo dejamos pasar y le adjuntamos su ID, Nombre y Rol
                if (usuarioValido) {
                    return { id: usuarioValido.id, name: usuarioValido.nombre, role: usuarioValido.rol };
                }

                // Si no, NextAuth lanzará un error automático
                return null;
            }
        })
    ],
    callbacks: {
        // 4. Inyectamos datos extra en el JWT (como el Rol)
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        // 5. Pasamos esos datos a la sesión del Frontend para que el Navbar los pueda leer
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/', // Si alguien no autorizado intenta entrar, lo mandamos a la raíz (Tu Login)
    },
    session: {
        strategy: "jwt", // Usamos el estándar JWT
    }
};

const handler = NextAuth(authOptions);

// Exportamos los métodos GET y POST que usa Next.js App Router
export { handler as GET, handler as POST };