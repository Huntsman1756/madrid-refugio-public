"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThermometerSun, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--ds-gray-100)] bg-[rgba(255,255,255,0.82)] px-4 py-3 shadow-[0_8px_24px_rgba(36,53,65,0.04)] backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--ds-black)]" />
            <div>
              <span className="block font-sans font-semibold text-[var(--ds-black)] tracking-tight text-sm sm:text-base">Madrid Refugio</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">Planificador peatonal climático</span>
            </div>
          </div>
          <Link href="/">
            <Button variant="secondary" className="h-9 px-4 text-sm"><ArrowLeft className="w-4 h-4 mr-2" /> Volver al mapa</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-[1760px] mx-auto px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <section className="hero-atmosphere hero-grid px-1 py-4 sm:px-2 sm:py-6 lg:px-3 lg:py-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,650px)] lg:items-center xl:gap-12">
            <div className="text-left">
              <h1 className="hero-title-serif mb-4 max-w-5xl text-[clamp(3rem,4.3vw,4.5rem)] text-[var(--ds-black)]">
                Metodología del proyecto
              </h1>
              <p className="mb-0 max-w-4xl text-base font-semibold leading-[1.65] text-[var(--ds-gray-500)] sm:text-lg">
                Memoria técnica, conjuntos de datos reutilizados y decisiones de diseño que sostienen el cálculo de rutas peatonales climáticas en Madrid Refugio.
              </p>
              <p className="editorial-kicker mt-6 text-[#247b56]">Transparencia metodológica, trazabilidad pública y arquitectura reproducible.</p>
            </div>

            <div className="hero-art-shell hidden lg:block" aria-hidden="true">
              <svg width="100%" height="100%" viewBox="0 0 680 232" fill="none" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="method-wash" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#edf4f0"/>
                    <stop offset="1" stopColor="#d7e9df"/>
                  </linearGradient>
                  <linearGradient id="method-tree" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#9fbea8"/>
                    <stop offset="1" stopColor="#6d9d7b"/>
                  </linearGradient>
                </defs>
                <path d="M0 178c78-26 145-24 219-17 61 6 130-6 211-30 78-23 160-27 250-6v107H0Z" fill="url(#method-wash)" opacity=".72"/>
                <circle cx="42" cy="55" r="25" fill="#dfeae4" opacity=".75"/>
                <path d="M151 86h42v100h-42V86Zm54 34h32v66h-32v-66Zm74-46h38v112h-38V74Zm128-15h46v127h-46V59Zm178-16h48v143h-48V43Z" fill="#dfe8e6" opacity=".64"/>
                <path d="M106 110h52v76h-52v-76Zm340-82h18v158h-18V28Zm35 51 27-32 27 32v107h-54V79Zm80 17h30v90h-30V96Z" fill="#e7eeee" opacity=".70"/>
                <path d="M242 105c4-34 20-55 47-55s43 21 47 55v81H242v-81Z" fill="#dde9e8" opacity=".86"/>
                <path d="M261 107c2-22 11-36 29-36 17 0 27 14 29 36v79h-58v-79Z" fill="#c8dbd7" opacity=".55"/>
                <path d="M286 50V31M276 34h20" stroke="#c4d9d2" strokeWidth="4" strokeLinecap="round"/>
                <g opacity=".62" stroke="#bacfc9" strokeWidth="3" strokeLinecap="round">
                  <path d="M239 133h100M250 151h78M260 169h58"/>
                  <path d="M284 72v-7M296 73v-7"/>
                </g>
                <g transform="translate(390 89)">
                  <rect x="0" y="80" width="74" height="8" rx="4" fill="#98b8a4" opacity=".75"/>
                  <path d="M9 88v21M63 88v21M11 72h51c7 0 12 5 12 12v2H0v-2c0-7 5-12 11-12Z" stroke="#7fa18c" strokeWidth="3" fill="none"/>
                  <path d="M14 73v-13M61 73v-13" stroke="#7fa18c" strokeWidth="3" strokeLinecap="round"/>
                </g>
                <g opacity=".9">
                  <path d="M348 119c-13-3-23-15-23-30 0-18 15-32 33-32 6 0 12 2 17 5 6-18 22-31 42-31 25 0 45 20 45 45 0 7-2 14-5 20 15 4 26 17 26 33 0 19-15 34-34 34H355c-17 0-31-14-31-31 0-16 12-29 28-31" fill="url(#method-tree)" opacity=".74"/>
                  <path d="M413 161v36" stroke="#78977f" strokeWidth="8" strokeLinecap="round"/>
                  <path d="M399 198h31" stroke="#78977f" strokeWidth="6" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-8 sm:py-14">

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
            La aplicación web utiliza Next.js, React, FastAPI, Leaflet y React-Leaflet. La arquitectura combina precomputación offline de capas pesadas con cálculo interactivo en el momento de la consulta, manteniendo trazabilidad sobre las fuentes. El despliegue se realiza en Vercel (frontend) y un servidor privado con Cloudflare Tunnel (backend), con Railway como alternativa de despliegue.
          </p>
          <p className="text-[var(--ds-gray-600)] mt-4">
            La metodología de operación separa explícitamente la generación offline de artefactos pesados y la resolución online de consultas. Esto permite mantener reproducibilidad técnica, tiempos de respuesta bajos y una arquitectura pública estable para evaluación externa.
          </p>
        </section>

        {/* 6. Conclusión */}
        <section className="mb-12">
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">6. Conclusión</h2>
          <p className="text-[var(--ds-gray-600)]">
            Madrid Refugio transforma datos abiertos en protección climática concreta. Es una herramienta operativa y funcional que permite calcular rutas peatonales más confortables en Madrid y, al mismo tiempo, producir evidencia territorial para orientar decisiones públicas de adaptación al calor.
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
