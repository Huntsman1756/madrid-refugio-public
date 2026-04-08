import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Madrid Refugio | Motor de Simulación Climática Urbana",
  description: "Herramienta de datos abiertos que calcula rutas de confort térmico en tiempo real cruzando sombras de edificios, arbolado y demografía para proteger a los mayores de 65 años del calor extremo en Madrid.",
  keywords: ["refugios climáticos Madrid", "estrés térmico mayores", "datos abiertos Madrid 2026", "sombra urbana", "rutas frescas madrid", "isla de calor", "confort térmico"],
  authors: [{ name: "Proyecto Concurso Datos Abiertos Madrid 2026" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Madrid Refugio | Motor de Simulación Climática Urbana",
    description: "Protegiendo a 430.000 mayores del calor extremo con rutas de sombra calculadas en tiempo real. 646.281 polígonos LiDAR · 661.000 árboles · 13 franjas horarias.",
    type: "website",
    locale: "es_ES",
    siteName: "Madrid Refugio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Madrid Refugio | Motor de Simulación Climática Urbana",
    description: "Rutas de confort térmico en tiempo real para Madrid. Datos abiertos al servicio de la salud pública.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-ES"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
