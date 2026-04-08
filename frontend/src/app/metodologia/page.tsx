"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThermometerSun, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b shadow-[var(--shadow-border)] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ThermometerSun className="w-6 h-6 text-[var(--ds-black)]" />
          <span className="font-sans font-semibold text-[var(--ds-black)] tracking-tight">Madrid Refugio</span>
        </div>
        <Link href="/">
          <Button variant="secondary"><ArrowLeft className="w-4 h-4 mr-2" /> Volver al mapa</Button>
        </Link>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 py-16 sm:py-24">
        <h1 className="display-hero text-[var(--ds-black)] mb-8">Memoria Técnica</h1>

        {/* 1. Introducción */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">1. Introducción y Propuesta de Valor</h2>
          <p className="text-[var(--ds-gray-600)] mb-4">
            <strong>Madrid Refugio</strong> no es solo un mapa; es un <strong>motor de simulación climática urbana</strong> diseñado para proteger a la población más vulnerable de la capital frente al fenómeno de la isla de calor. Aunque la interfaz es accesible, el sistema está concebido como una <strong>herramienta de apoyo a la decisión para gestores municipales y servicios sociales</strong>.
          </p>
          <p className="text-[var(--ds-gray-600)]">
            A diferencia de soluciones estáticas que simplemente muestran &quot;islas de calor&quot; históricas, nuestra plataforma ofrece una <strong>operatividad real</strong> mediante el cálculo de rutas de confort térmico en tiempo real. Todo este motor se ha encapsulado en una <strong>Aplicación Web Progresiva (Next.js + FastAPI)</strong> de acceso público, diseñada para que cualquier ciudadano, sin necesidad de conocimientos técnicos o descargas previas, pueda planificar su exposición térmica.
          </p>
        </section>

        {/* 2. Innovación Tecnológica */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">2. Innovación Tecnológica: Motor de Sombra Dinámica Proyectada</h2>
          <p className="text-[var(--ds-gray-600)] mb-6">
            La principal ventaja competitiva de Madrid Refugio reside en su capacidad de cálculo de <strong>Sombra Dinámica Proyectada por Edificación</strong>. Mientras que otras propuestas se limitan a mapas de calor estáticos o históricos, nosotros hemos implementado:
          </p>
          <div className="space-y-4">
            <Card level={1} className="p-5 border-l-4 border-l-[#0a72ef]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Modelo de Alturas de Edificación</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Procesamiento de 448.997 polígonos del Geoportal de Madrid con atributos de altura real (Z).</p>
            </Card>
            <Card level={1} className="p-5 border-l-4 border-l-[#de1d8d]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Proyección Geométrica Solar</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Integración de las bibliotecas <code className="bg-[var(--ds-gray-50)] px-1 py-0.5 rounded text-xs">pvlib</code> y <code className="bg-[var(--ds-gray-50)] px-1 py-0.5 rounded text-xs">pybdshadow</code> para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar).</p>
            </Card>
            <Card level={1} className="p-5 border-l-4 border-l-[#ff5b4f]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Matriz de Intersección Calle-Sombra</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Generación offline de una matriz de 320.844 aristas × 13 franjas horarias (08:00 a 20:00), que permite al algoritmo de routing ajustar el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.</p>
            </Card>
            <Card level={1} className="p-5 border-l-4 border-l-[#16a34a]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Integración Meteorológica en Tiempo Real</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Conexión directa con la API OpenData de AEMET para obtener temperatura y estado del cielo actual en Madrid, permitiendo al sistema validar dinámicamente las alertas por calor extremo.</p>
            </Card>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[var(--ds-black)] mb-3">Simulación temporal de sombras</h3>
            <p className="text-[var(--ds-gray-600)] mb-4">
              La posición del sol se calcula mediante geometría esférica estándar (azimut y elevación solar) en función de la hora del día y las coordenadas de Madrid (40,4° N). No se consultan APIs meteorológicas externas para la geometría de sombras: el sistema es completamente determinista y reproducible.
            </p>
            <p className="text-[var(--ds-gray-600)]">
              Los pesos de sombra se precomputan para 13 franjas horarias (08:00 a 20:00) y se almacenan en la matriz Parquet. En tiempo de ejecución, el backend inyecta los pesos correspondientes a la franja seleccionada por el usuario antes de ejecutar el algoritmo de Dijkstra.
            </p>
          </div>
        </section>

        {/* 3. Reutilización de Datos Abiertos */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">3. Reutilización de Datos Abiertos</h2>
          <p className="text-[var(--ds-gray-600)] mb-6">Hemos integrado 7 datasets críticos del ecosistema de datos de Madrid:</p>
          <div className="border border-[var(--ds-gray-100)] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)] border-b border-[var(--ds-gray-100)]">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Dataset</th>
                  <th className="px-4 py-3 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-black)]">
                <tr><td className="px-4 py-3 font-mono text-xs">1</td><td className="px-4 py-3 font-medium">Modelo de Alturas (2024)</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">662.173 polígonos con atributo Z (altura real). Base para la simulación de sombras.</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">2</td><td className="px-4 py-3 font-medium">Arbolado Viario</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">661.192 ejemplares geolocalizados integrados como factor de sombra biológica base.</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">3</td><td className="px-4 py-3 font-medium">Padrón Municipal (2026)</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Población por barrio segregada por edad (&gt;65 años).</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">4</td><td className="px-4 py-3 font-medium">Calidad del Aire (AEMET)</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Integración de predicciones horarias en tiempo real y series históricas de NO₂.</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">5</td><td className="px-4 py-3 font-medium">Fuentes de Agua Potable</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Red de hidrantes integrada en el algoritmo de proximidad.</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">6</td><td className="px-4 py-3 font-medium">Equipamientos Municipales</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Bibliotecas y centros deportivos como &quot;refugios sustitutos&quot;.</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs">7</td><td className="px-4 py-3 font-medium">Límites Administrativos</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Geometría oficial de barrios y distritos.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[var(--ds-black)] mb-3">Datos de NO₂</h3>
            <p className="text-[var(--ds-gray-600)]">
              Los valores de contaminación por dióxido de nitrógeno provienen del dataset histórico de la Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (datos.madrid.es). Se utilizan medias anuales por estación, suficientes para identificar patrones estructurales de exposición crónica en los barrios. La integración de lecturas en tiempo real es una extensión prevista del sistema.
            </p>
          </div>
        </section>

        {/* 4. Impacto Social */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">4. Impacto Social y Justicia Térmica</h2>
          <p className="text-[var(--ds-gray-600)]">
            El análisis territorial ha revelado realidades críticas: <strong>Villaverde y Aluche</strong> emergen como zonas de máxima prioridad por su combinación de población envejecida y déficit de infraestructura de refugio. Madrid Refugio proporciona a los planificadores urbanos una hoja de ruta basada en datos para la creación de la red oficial de refugios climáticos.
          </p>
        </section>

        {/* 5. Escalabilidad */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">5. Escalabilidad y Arquitectura</h2>
          <p className="text-[var(--ds-gray-600)] mb-4">
            Madrid Refugio nace con vocación de producto estable y exportable. La arquitectura modular (Frontend, Backend y Motor Algorítmico) está diseñada para ser replicable por otros consistorios que deseen implementar sistemas similares de protección climática.
          </p>
          <p className="text-[var(--ds-gray-600)]">
            La arquitectura algorítmica expuesta en este demostrador está diseñada para escalar: el salto a <em>Madrid Completo</em> abandona los grafos en memoria (NetworkX) en favor de nodos espaciales en base de datos (<strong>PostgreSQL + PostGIS con pgRouting</strong>), permitiendo cálculos de millones de aristas con sombra dinámica en apenas milisegundos gracias al pre-cálculo masivo en formato Parquet.
          </p>
        </section>

        {/* 6. Conclusión */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">6. Conclusión</h2>
          <p className="text-[var(--ds-gray-600)]">
            Madrid Refugio representa la excelencia en la reutilización de datos abiertos: transforma filas de bases de datos en una herramienta de salud pública proactiva, visualmente impecable y técnicamente avanzada. <strong>No es una prueba de concepto, es infraestructura lista para amortiguar el impacto del cambio climático en los ciudadanos que levantaron esta ciudad.</strong>
          </p>
        </section>

        {/* Back button */}
        <div className="text-center pt-8 border-t border-[var(--ds-gray-100)]">
          <Link href="/">
            <Button variant="primary" className="h-12 px-8 text-base"><ArrowLeft className="w-4 h-4 mr-2" /> Volver al mapa</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
