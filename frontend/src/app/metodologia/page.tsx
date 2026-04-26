"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlcalaLogo } from "@/components/branding/HomeVisuals";
import {
  ArrowLeft,
  Cpu,
  Database,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const dataRows = [
  ["Edificación (Geoportal)", "Volumetría 3D y obstaculización solar teórica."],
  ["Callejero Oficial", "Geocodificación precisa y autocompletado de direcciones."],
  [
    "Arbolado Viario",
    "Cobertura de dosel vegetal (sombra biológica) asignada a tramos de calle mediante buffer espacial de 5m.",
  ],
  [
    "Padrón Municipal (Edad)",
    "Análisis demográfico para ponderar la vulnerabilidad de áreas frente al calor extremo.",
  ],
  [
    "Fuentes de Agua Potable",
    "Puntos de avituallamiento hídrico. Detección en ruta mediante un buffer dinámico de 75m sobre el trayecto.",
  ],
  [
    "Equipamientos Municipales",
    "Sustituto analítico ante la falta de dataset oficial de 'Refugios Climáticos'. Buffer de desvío de 200m.",
  ],
];

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      <nav className="sticky top-0 z-50 navbar px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ds-white)] shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-[1.03]">
              <ArrowLeft className="h-5 w-5 text-[var(--climate-green)]" />
            </span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--ds-gray-500)]">
                Volver al visor
              </span>
              <span className="block text-sm font-semibold text-[var(--ds-black)]">
                Madrid Refugio
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <AlcalaLogo className="h-8 w-8 opacity-30" />
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ds-gray-500)] sm:block">
              Memoria técnica
            </span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 sm:pt-14">
        <header className="section-shell rounded-[32px] px-6 py-10 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-white)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--climate-green)] shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Documentación abierta
            </div>
            <h1 className="hero-title-serif text-[clamp(3rem,6vw,5.75rem)] text-[var(--ds-black)]">
              Arquitectura y
              <br />
              Algoritmia Climática
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[var(--ds-gray-600)] sm:text-xl">
              Memoria técnica detallada sobre la generación del modelo de sombras,
              el motor de enrutamiento térmico y la reutilización de datos abiertos
              del Ayuntamiento de Madrid.
            </p>
          </div>
        </header>

        <div className="mt-12 space-y-10">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card level={1} className="section-shell rounded-[32px] p-8 sm:p-10">
              <p className="editorial-kicker mb-3 text-[var(--ds-gray-500)]">
                1. Resumen Ejecutivo
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
                Simulación climática operativa para caminar mejor
              </h2>
              <div className="mt-6 space-y-5 text-[1.05rem] leading-relaxed text-[var(--ds-gray-700)]">
                <p>
                  <strong className="text-[var(--ds-black)]">Madrid Refugio</strong>{" "}
                  es una herramienta de simulación climática urbana que calcula
                  rutas peatonales optimizadas para el confort térmico en el
                  momento preciso de la consulta.
                </p>
                <p>
                  El proyecto responde a una brecha crítica de infraestructura:
                  el <strong className="text-[var(--ds-black)]">64,1% de los barrios de Madrid</strong>{" "}
                  no dispone de un refugio climático operativo en un radio
                  caminable de 300 metros. Frente a este déficit, el sistema
                  combina datos abiertos municipales con topología de red para
                  ofrecer navegación que prioriza sombra, fuentes de agua potable
                  y acceso a equipamientos climatizados.
                </p>
              </div>

              <div className="mt-8 rounded-[28px] bg-[var(--climate-green)] px-6 py-7 text-white shadow-[0_20px_40px_rgba(33,48,43,0.12)] sm:px-8">
                <p className="font-display text-2xl italic leading-snug sm:text-3xl">
                  "No buscamos la ruta más corta, sino la de menor coste térmico
                  para poblaciones vulnerables durante episodios de calor extremo."
                </p>
              </div>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <Card level={1} className="section-shell rounded-[32px] p-8 text-center">
                <Database className="mx-auto h-10 w-10 text-[var(--climate-cyan)]" />
                <h3 className="mt-4 font-display text-2xl text-[var(--ds-black)]">
                  Datos abiertos
                </h3>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">
                  Catálogo municipal reutilizado
                </p>
              </Card>

              <Card level={1} className="rounded-[32px] border border-[rgba(30,106,79,0.16)] bg-[rgba(30,106,79,0.08)] p-8 text-center shadow-sm">
                <Cpu className="mx-auto h-10 w-10 text-[var(--climate-green)]" />
                <h3 className="mt-4 font-display text-2xl text-[var(--ds-black)]">
                  Modelo determinista
                </h3>
                <p className="mt-2 text-sm uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">
                  Sombra urbana por franja horaria
                </p>
              </Card>
            </div>
          </section>

          <section className="section-shell rounded-[32px] p-6 sm:p-8">
            <div className="mb-6 text-center">
              <p className="editorial-kicker mb-3 text-[var(--ds-gray-500)]">
                2. Pipeline Visual
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
                Del LiDAR a la decisión peatonal
              </h2>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-[var(--ds-gray-200)] bg-[var(--ds-white)] shadow-sm">
              <img
                src="/pipeline_diagram.png"
                alt="Diagrama del flujo de procesamiento de datos: Desde LiDAR hasta la ruta optimizada"
                className="w-full"
              />
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <Card level={1} className="section-shell rounded-[32px] p-8 sm:p-10">
              <p className="editorial-kicker mb-3 text-[var(--ds-gray-500)]">
                3. Función de Coste y Enrutamiento
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
                Penalización térmica dinámica
              </h2>
              <div className="mt-6 space-y-5 text-[1.02rem] leading-relaxed text-[var(--ds-gray-700)]">
                <p>
                  El motor de navegación implementa el algoritmo de Dijkstra
                  modificado sobre un grafo <code className="rounded bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-sm">NetworkX</code>{" "}
                  derivado de OpenStreetMap.
                </p>
                <p>
                  Siempre evalúa dos caminos: una <strong className="text-[var(--ds-black)]">Ruta Directa</strong>{" "}
                  basada en longitud pura y una <strong className="text-[var(--ds-black)]">Ruta Térmica</strong>{" "}
                  que penaliza exposición solar y bonifica amenidades climáticas.
                </p>
              </div>

              <div className="mt-8 rounded-[28px] border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] p-6 text-[var(--ds-gray-800)] shadow-inner sm:p-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">
                  Penalización Térmica
                </p>
                <pre className="overflow-x-auto text-sm leading-relaxed sm:text-base">
{`cost_e = length_e * (
  1.0 +
  (1 - shadow_building_e) * α +
  (1 - canopy_cover_e) * β -
  (amenity_bonus_e) * γ
)`}
                </pre>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ds-gray-600)]">
                  El usuario controla α, β y γ a través del selector de
                  preferencia en la interfaz, variando desde un enfoque
                  conservador hasta la aversión estricta al sol.
                </p>
              </div>
            </Card>

            <div className="section-shell rounded-[32px] p-4 sm:p-6">
              <img
                src="/cost_function_diagram.png"
                alt="Visualización de la función de penalización térmica: Sombra de edificios vs Exposición solar"
                className="w-full rounded-[28px] border border-[var(--ds-gray-200)]"
              />
            </div>
          </section>

          <section className="section-shell rounded-[32px] p-6 sm:p-8">
            <p className="editorial-kicker mb-3 text-[var(--ds-gray-500)]">
              4. Inventario de Datos Abiertos
            </p>
            <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
              Trazabilidad completa de fuentes
            </h2>
            <p className="mt-5 max-w-3xl text-[1.02rem] leading-relaxed text-[var(--ds-gray-700)]">
              El sistema garantiza trazabilidad total. Las fuentes provienen
              primariamente del Catálogo de Datos Abiertos del Ayuntamiento de
              Madrid y cartografía colaborativa.
            </p>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--ds-gray-200)] bg-[var(--ds-white)] shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--ds-gray-50)] text-[var(--ds-gray-600)]">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Conjunto de Datos</th>
                    <th className="px-5 py-4 font-semibold">Aplicación en el Modelo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-gray-700)]">
                  {dataRows.map(([name, detail]) => (
                    <tr key={name} className="align-top hover:bg-[var(--ds-gray-50)]/70">
                      <td className="px-5 py-4 font-medium text-[var(--ds-black)]">{name}</td>
                      <td className="px-5 py-4">{detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section-shell rounded-[32px] p-8 sm:p-10">
            <p className="editorial-kicker mb-3 text-[var(--ds-gray-500)]">
              5. Stack Tecnológico
            </p>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-display text-3xl text-[var(--ds-black)]">
                  Backend & Geoprocesamiento
                </h3>
                <ul className="mt-5 space-y-2 text-[1.02rem] leading-relaxed text-[var(--ds-gray-700)]">
                  <li><strong className="text-[var(--ds-black)]">Python 3.11</strong> · Core logic</li>
                  <li><strong className="text-[var(--ds-black)]">FastAPI</strong> · API RESTful de alto rendimiento</li>
                  <li><strong className="text-[var(--ds-black)]">GeoPandas & Shapely</strong> · Operaciones espaciales vectoriales</li>
                  <li><strong className="text-[var(--ds-black)]">OSMnx & NetworkX</strong> · Topología y Dijkstra</li>
                  <li><strong className="text-[var(--ds-black)]">pvlib & pybdshadow</strong> · Astro-geometría</li>
                </ul>
              </div>
              <div>
                <h3 className="font-display text-3xl text-[var(--ds-black)]">
                  Frontend & Visualización
                </h3>
                <ul className="mt-5 space-y-2 text-[1.02rem] leading-relaxed text-[var(--ds-gray-700)]">
                  <li><strong className="text-[var(--ds-black)]">Next.js 15 + React 19</strong> · App Router</li>
                  <li><strong className="text-[var(--ds-black)]">TypeScript</strong> · Tipado estricto</li>
                  <li><strong className="text-[var(--ds-black)]">Tailwind CSS v4</strong> · Sistema de diseño</li>
                  <li><strong className="text-[var(--ds-black)]">Leaflet & React-Leaflet</strong> · Cartografía 2D</li>
                  <li><strong className="text-[var(--ds-black)]">Recharts</strong> · Data-viz de apoyo</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-16 border-t border-[var(--ds-gray-100)] pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/">
              <Button className="h-12 rounded-[14px] px-6 text-sm font-medium shadow-md">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Abrir Visor Cartográfico
              </Button>
            </Link>
            <a
              href="https://github.com/vidalj/madrid-refugio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ds-gray-500)] transition-colors hover:text-[var(--ds-black)]"
            >
              Ver código fuente <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
