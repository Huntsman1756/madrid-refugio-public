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
        <h1 className="display-hero text-[var(--ds-black)] mb-8">Memoria del proyecto</h1>

        {/* 1. Introducción */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">1. Resumen ejecutivo</h2>
          <p className="text-[var(--ds-gray-600)] mb-4">
            <strong>Madrid Refugio</strong> es una herramienta de simulación climática urbana que calcula rutas peatonales de confort térmico en el momento de la consulta, combinando datos abiertos del Ayuntamiento de Madrid con un grafo de calles de OpenStreetMap.
          </p>
            <p className="text-[var(--ds-gray-600)]">
              El proyecto responde a una brecha de infraestructura y cobertura: el 64,1% de los barrios de Madrid no dispone de un refugio climático operativo en un radio de 300 metros. Frente a ello, la aplicación ofrece una respuesta útil para ciudadanía y gestores públicos, priorizando sombra, agua y acceso a equipamientos climatizados.
            </p>
        </section>

        {/* 2. Innovación Tecnológica */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">2. Innovación tecnológica</h2>
          <p className="text-[var(--ds-gray-600)] mb-6">
            La principal innovación de Madrid Refugio es la aplicación de un modelo de sombra urbana por hora del día al cálculo de rutas peatonales. Frente a visores estáticos o mapas agregados, el sistema estima el confort térmico tramo a tramo y compara una ruta directa con una alternativa más protegida.
          </p>
          <div className="space-y-4">
            <Card level={1} className="p-5 border-l-4 border-l-[#0a72ef]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Modelo de alturas de edificación</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Procesamiento de 662.173 polígonos del Geoportal de Madrid con atributos de altura real (Z).</p>
            </Card>
            <Card level={1} className="p-5 border-l-4 border-l-[#de1d8d]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Proyección geométrica solar</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Integración de las bibliotecas <code className="bg-[var(--ds-gray-50)] px-1 py-0.5 rounded text-xs">pvlib</code> y <code className="bg-[var(--ds-gray-50)] px-1 py-0.5 rounded text-xs">pybdshadow</code> para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar).</p>
            </Card>
            <Card level={1} className="p-5 border-l-4 border-l-[#ff5b4f]">
              <h4 className="font-semibold text-[var(--ds-black)] text-sm mb-1">Matriz de intersección calle-sombra</h4>
              <p className="text-sm text-[var(--ds-gray-600)]">Generación offline de una matriz de sombra por franjas horarias, que permite ajustar el peso de cada tramo de forma interactiva en el momento de la consulta.</p>
            </Card>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[var(--ds-black)] mb-3">Simulación temporal de sombras</h3>
            <p className="text-[var(--ds-gray-600)] mb-4">
              La posición del sol se calcula mediante geometría esférica estándar (azimut y elevación solar) en función de la hora del día y las coordenadas de Madrid (40,4° N). No se consultan APIs meteorológicas externas para la geometría de sombras: el sistema es completamente determinista y reproducible.
            </p>
            <p className="text-[var(--ds-gray-600)]">
              Los pesos de sombra se precomputan por franjas horarias y se almacenan en una matriz Parquet. En ejecución, el backend inyecta los pesos correspondientes antes de calcular la ruta, combinando detalle geoespacial con tiempos de respuesta operativos.
            </p>
          </div>
        </section>

        {/* 3. Reutilización de Datos Abiertos */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">3. Conjuntos de datos utilizados</h2>
          <p className="text-[var(--ds-gray-600)] mb-6">El proyecto reutiliza datos abiertos municipales, cartografía oficial y OpenStreetMap para resolver el problema con trazabilidad completa:</p>
          <div className="border border-[var(--ds-gray-100)] rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)] border-b border-[var(--ds-gray-100)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Dataset</th>
                  <th className="px-4 py-3 font-medium">Uso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-black)]">
                <tr><td className="px-4 py-3 font-medium">Modelo de alturas de edificación</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Base para la sombra proyectada por edificios.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Callejero oficial de Madrid</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Autocompletado y resolución fiable de origen y destino.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Arbolado viario</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Sombra biológica y mejora del confort por tramo.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Padrón municipal por edad</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Identificación de población vulnerable por barrio.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Calidad del aire y estaciones</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Interpolación espacial de NO₂ y contexto ambiental.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Fuentes de agua potable</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Puntos de alivio y recursos de proximidad en ruta.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Equipamientos municipales</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Refugios sustitutos ante la ausencia de un dataset oficial específico.</td></tr>
                <tr><td className="px-4 py-3 font-medium">Límites administrativos</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Unidad territorial oficial de análisis.</td></tr>
                <tr><td className="px-4 py-3 font-medium">OpenStreetMap</td><td className="px-4 py-3 text-[var(--ds-gray-600)]">Base de la red peatonal para el routing.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[var(--ds-black)] mb-3">Nota metodológica</h3>
            <p className="text-[var(--ds-gray-600)]">
              El proyecto documenta expresamente que no existe un dataset municipal reutilizable de refugios climáticos oficiales en formato operativo. Por ello, se emplea una sustitución defensiva basada en equipamientos municipales con climatización y coordenadas verificadas.
            </p>
          </div>
        </section>

        {/* 4. Impacto Social */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">4. Impacto esperado</h2>
          <p className="text-[var(--ds-gray-600)]">
            Madrid Refugio tiene impacto potencial directo en salud urbana, adaptación climática y planificación territorial. Facilita desplazamientos más seguros para la ciudadanía y genera evidencia útil para priorizar inversiones en barrios con mayor déficit de cobertura y mayor exposición de población vulnerable.
          </p>
        </section>

        {/* 5. Escalabilidad */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">5. Tecnología utilizada</h2>
          <p className="text-[var(--ds-gray-600)] mb-4">
            El procesamiento geoespacial se apoya en Python, GeoPandas, Shapely, PyProj, Pandas, <code className="bg-[var(--ds-gray-50)] px-1 py-0.5 rounded text-xs">pvlib</code> y <code className="bg-[var(--ds-gray-50)] px-1 py-0.5 rounded text-xs">pybdshadow</code>. El modelo de routing utiliza OSMnx y NetworkX sobre una red peatonal derivada de OpenStreetMap.
          </p>
          <p className="text-[var(--ds-gray-600)]">
            La aplicación web utiliza Next.js, React, FastAPI, Leaflet y React-Leaflet. La arquitectura combina precomputación offline de capas pesadas con cálculo interactivo en el momento de la consulta, manteniendo trazabilidad sobre las fuentes y un despliegue operativo en Vercel y Railway.
          </p>
        </section>

        {/* 6. Conclusión */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">6. Conclusión</h2>
          <p className="text-[var(--ds-gray-600)]">
            Madrid Refugio transforma datos abiertos en protección climática concreta. Es una herramienta operativa y funcional que permite calcular rutas peatonales más confortables en Madrid y, al mismo tiempo, producir evidencia territorial para orientar decisiones públicas de adaptación al calor.
          </p>
          <p className="text-[var(--ds-gray-600)] mt-4">
            URL pública: <a href="https://madridrefugio.es/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">https://madridrefugio.es/</a>
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
