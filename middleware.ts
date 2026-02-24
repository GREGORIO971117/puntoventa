import { withAuth } from "next-auth/middleware";

// Exportamos explícitamente la función por defecto
export default withAuth({
    pages: {
        signIn: "/", // Si falla la autenticación, lo mandamos a la raíz (Login)
    },
});

// Definimos qué rutas están protegidas
export const config = {
    matcher: [
        "/ventas/:path*",
        "/inventario/:path*",
        "/reportes/:path*",
        "/sucursales/:path*"
    ]
};