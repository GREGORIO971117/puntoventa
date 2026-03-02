import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // 👈 Importamos nuestra conexión real a BD

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credenciales",
            credentials: {
                username: { label: "Usuario", type: "text" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                // 👈 1. BUSCAMOS EN POSTGRESQL DIRECTAMENTE
                const sucursal = await prisma.sucursal.findUnique({
                    where: { username: credentials.username }
                });

                // 2. Si no existe la sucursal, rechazamos
                if (!sucursal) return null;

                // 3. Validamos la contraseña (Nota: En un futuro, si quieres más seguridad, 
                // aquí usaríamos bcrypt para comparar contraseñas encriptadas)
                if (sucursal.password === credentials.password) {
                    // 4. Si es correcto, retornamos los datos para crear la Cookie JWT
                    return {
                        id: sucursal.id,
                        name: sucursal.nombre,
                        role: sucursal.rol
                    };
                }

                // Contraseña incorrecta
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
    },
    session: {
        strategy: "jwt",
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };