import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/layout/NavBar";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Punto de Venta Papelería",
  description: "POS Moderno creado con Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} h-screen flex flex-col overflow-hidden`}>
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}