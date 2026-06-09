import type { Metadata } from "next";
import "./globals.css";

import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "SGPI - Dashboard de Gestión de Proyectos",
  description: "Sistema de Gestión de Proyectos e Histórico Integrado - INIA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
