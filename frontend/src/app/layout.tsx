import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madrid Refugio | Navegador de Rutas Climáticas",
  description: "Herramienta analítica de datos abiertos para la identificación de zonas de riesgo crítico de estrés térmico y enrutamiento hacia refugios climáticos en Madrid.",
  keywords: ["refugios climáticos Madrid", "estrés térmico mayores", "datos abiertos Madrid 2026", "sombra urbana", "rutas frescas madrid"],
  authors: [{ name: "Proyecto Concurso Datos Abiertos" }],
  openGraph: {
    title: "Madrid Refugio | Identificador de Riesgo Térmico",
    description: "Analiza el riesgo térmico de los barrios de Madrid cruzando población vulnerable, NO2 y cobertura arbórea.",
    type: "website",
    locale: "es_ES",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-ES"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
