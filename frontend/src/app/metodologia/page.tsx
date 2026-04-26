"use client";

import { Button } from "@/components/ui/Button";
import { AlcalaLogo } from "@/components/branding/HomeVisuals";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--ds-gray-200)] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,242,233,0.92))] shadow-sm border border-[var(--ds-gray-200)]">
              <AlcalaLogo className="h-8 w-8" />
            </span>
            <div>
              <span className="block font-sans font-semibold text-[var(--ds-black)] tracking-tight text-sm sm:text-base">Madrid Refugio</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">Memoria Técnica</span>
            </div>
          </div>
          <Link href="/">
            <Button variant="secondary" className="h-9 px-4 text-sm rounded-md border-[var(--ds-gray-200)] bg-white text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-100)] hover:text-[var(--ds-black)]"><ArrowLeft className="w-4 h-4 mr-2" /> Volver al visor</Button>
          </Link>
        </div>
      </nav>

      {/* Header Editorial */}
      <header className="border-b border-[var(--ds-gray-200)] bg-white pt-16 pb-16">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="mb-4 inline-flex items-center rounded border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] px-3 py-1 text-xs font-medium text-[var(--ds-gray-600)]">
            <span className="mr-1.5 flex h-2 w-2 rounded bg-[var(--climate-green)]"></span>
            Documentación Abierta
          </div>
          <h1 className="hero-title-serif text-4xl sm:text-5xl text-[var(--ds-black)] mb-6 leading-tight">
            Arquitectura y <br/>Algoritmia Climática
          </h1>
          <p className="text-lg sm:text-xl text-[var(--ds-gray-600)] leading-relaxed max-w-[700px] font-sans">
            Memoria técnica detallada sobre la generación del modelo de sombras, el motor de enrutamiento térmico y la reutilización de datos abiertos del Ayuntamiento de Madrid.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-6 py-12 sm:py-16">

        {/* 1. Resumen Ejecutivo */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-[var(--ds-black)] mb-6 pb-2 border-b border-[var(--ds-gray-200)]">1. Resumen Ejecutivo</h2>
          <div className="prose prose-gray max-w-none font-sans text-[var(--ds-gray-700)] leading-relaxed">
            <p className="mb-4 text-lg">
              <strong className="text-[var(--ds-black)]">Madrid Refugio</strong> es una herramienta de simulación climática urbana que calcula rutas peatonales optimizadas para el confort térmico en el momento preciso de la consulta.
            </p>
            <p className="mb-4">
              El proyecto responde a una brecha crítica de infraestructura: el <strong className="text-[var(--ds-black)]">64,1% de los barrios de Madrid</strong> no dispone de un refugio climático operativo en un radio caminable de 300 metros. Frente a este déficit, el sistema combina datos abiertos municipales con topología de red para ofrecer navegación que prioriza sombra, fuentes de agua potable y acceso a equipamientos climatizados.
            </p>
            <div className="bg-[var(--ds-gray-50)] border-l-4 border-[var(--climate-green)] p-5 rounded-r-lg mt-6">
              <p className="m-0 text-sm italic text-[var(--ds-gray-700)]">"No buscamos la ruta más corta, sino la de menor coste térmico para poblaciones vulnerables durante episodios de calor extremo."</p>
            </div>
          </div>
        </section>

        {/* 2. Innovación */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-[var(--ds-black)] mb-6 pb-2 border-b border-[var(--ds-gray-200)]">2. Modelo Geométrico de Sombras</h2>
          <div className="prose prose-gray max-w-none font-sans text-[var(--ds-gray-700)] leading-relaxed mb-8">
            <p>
              La principal innovación algorítmica reside en la aplicación de un modelo determinista de sombra urbana por hora del día. A diferencia de visores estáticos, el sistema estima el nivel de insolación tramo a tramo (edge) basándose en volumetría real.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            <div className="border border-[var(--ds-gray-200)] rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded bg-[var(--ds-gray-100)] flex items-center justify-center mb-4 border border-[var(--ds-gray-200)]">
                <span className="font-mono text-xs font-bold text-[var(--ds-black)]">01</span>
              </div>
              <h4 className="font-display font-semibold text-base text-[var(--ds-black)] mb-2">Altimetría de Edificación</h4>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Procesamiento masivo de <strong className="text-[var(--ds-black)]">662.173 polígonos</strong> del Geoportal de Madrid, extrayendo el atributo de altura real (Z) para construir el entorno de oclusión.</p>
            </div>
            
            <div className="border border-[var(--ds-gray-200)] rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded bg-[var(--ds-gray-100)] flex items-center justify-center mb-4 border border-[var(--ds-gray-200)]">
                <span className="font-mono text-xs font-bold text-[var(--ds-black)]">02</span>
              </div>
              <h4 className="font-display font-semibold text-base text-[var(--ds-black)] mb-2">Trigonometría Solar</h4>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Cálculo astronómico (<code className="text-xs bg-[var(--ds-gray-100)] px-1 rounded font-mono">pvlib</code>) de azimut y elevación para Madrid (40.4° N) en fecha de máxima exigencia (15 de julio).</p>
            </div>
            
            <div className="border border-[var(--ds-gray-200)] rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
              <div className="w-8 h-8 rounded bg-[var(--ds-gray-100)] flex items-center justify-center mb-4 border border-[var(--ds-gray-200)]">
                <span className="font-mono text-xs font-bold text-[var(--ds-black)]">03</span>
              </div>
              <h4 className="font-display font-semibold text-base text-[var(--ds-black)] mb-2">Matriz de Intersección Precomputada</h4>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Generación offline de una estructura de datos indexada por franjas horarias (08:00 - 20:00). Esto permite que el enrutador en tiempo real asigne pesos a la topología de la calle en &lt;150ms sin calcular geometría 3D en caliente.</p>
            </div>
          </div>
        </section>

        {/* 3. Lógica de cálculo */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-[var(--ds-black)] mb-6 pb-2 border-b border-[var(--ds-gray-200)]">3. Función de Coste y Enrutamiento</h2>
          <div className="prose prose-gray max-w-none font-sans text-[var(--ds-gray-700)] leading-relaxed">
            <p className="mb-4">
              El motor de navegación implementa el algoritmo de Dijkstra modificado sobre un grafo <code className="text-xs bg-[var(--ds-gray-100)] px-1 rounded font-mono">NetworkX</code> derivado de OpenStreetMap. Siempre evalúa dos caminos:
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li><strong className="text-[var(--ds-black)]">Ruta Directa (Baseline):</strong> Minimiza exclusivamente la distancia euclidiana (<code className="text-xs bg-[var(--ds-gray-100)] px-1 rounded font-mono">weight = length</code>).</li>
              <li><strong className="text-[var(--ds-black)]">Ruta Térmica (Optimizada):</strong> Utiliza una función de coste dinámica (<code className="text-xs bg-[var(--ds-gray-100)] px-1 rounded font-mono">weight = length * thermal_penalty</code>).</li>
            </ul>
            
            <h4 className="font-semibold text-[var(--ds-black)] mt-8 mb-3">Penalización Térmica</h4>
            <p className="mb-4">
              El multiplicador térmico se compone de tres variables invertidas (mayor valor = menor penalización):
            </p>
            
            <div className="bg-[var(--ds-gray-50)] border border-[var(--ds-gray-200)] rounded-lg p-5 font-mono text-sm overflow-x-auto mb-6 text-[var(--ds-gray-800)] shadow-inner">
              <pre className="leading-relaxed whitespace-pre">
{`cost_e = length_e * (
  1.0 +
  (1 - shadow_building_e) * α +
  (1 - canopy_cover_e) * β -
  (amenity_bonus_e) * γ
)`}
              </pre>
            </div>
            
            <p>
              El usuario controla los hiperparámetros α, β y γ a través de un <em className="italic">slider</em> de tolerancia en la interfaz, variando desde un enfoque conservador (Equilibrada) hasta la aversión estricta al sol (Más Sombra).
            </p>
          </div>
        </section>

        {/* 4. Datos */}
        <section className="mb-16">
          <h2 className="font-display font-semibold text-2xl text-[var(--ds-black)] mb-6 pb-2 border-b border-[var(--ds-gray-200)]">4. Inventario de Datos Abiertos</h2>
          <p className="font-sans text-[var(--ds-gray-700)] mb-6">
            El sistema garantiza trazabilidad total. Las fuentes provienen primariamente del Catálogo de Datos Abiertos del Ayuntamiento de Madrid y cartografía colaborativa.
          </p>
          
          <div className="border border-[var(--ds-gray-200)] rounded-lg overflow-hidden bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--ds-gray-50)] text-[var(--ds-gray-600)] border-b border-[var(--ds-gray-200)]">
                <tr>
                  <th className="px-5 py-4 font-semibold w-1/3">Conjunto de Datos</th>
                  <th className="px-5 py-4 font-semibold">Aplicación en el Modelo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-gray-700)] font-sans">
                <tr className="hover:bg-[var(--ds-gray-50)] transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--ds-black)]">Edificación (Geoportal)</td>
                  <td className="px-5 py-4">Volumetría 3D y obstaculización solar teórica.</td>
                </tr>
                <tr className="hover:bg-[var(--ds-gray-50)] transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--ds-black)]">Callejero Oficial</td>
                  <td className="px-5 py-4">Geocodificación precisa y autocompletado de direcciones.</td>
                </tr>
                <tr className="hover:bg-[var(--ds-gray-50)] transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--ds-black)]">Arbolado Viario</td>
                  <td className="px-5 py-4">Cobertura de dosel vegetal (sombra biológica) asignada a tramos de calle mediante buffer espacial de 5m.</td>
                </tr>
                <tr className="hover:bg-[var(--ds-gray-50)] transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--ds-black)]">Padrón Municipal (Edad)</td>
                  <td className="px-5 py-4">Análisis demográfico para ponderar la vulnerabilidad de áreas frente al calor extremo.</td>
                </tr>
                <tr className="hover:bg-[var(--ds-gray-50)] transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--ds-black)]">Fuentes de Agua Potable</td>
                  <td className="px-5 py-4">Puntos de avituallamiento hídrico. Detección en ruta mediante un buffer dinámico de 75m sobre el trayecto.</td>
                </tr>
                <tr className="hover:bg-[var(--ds-gray-50)] transition-colors">
                  <td className="px-5 py-4 font-medium text-[var(--ds-black)]">Equipamientos Municipales</td>
                  <td className="px-5 py-4">Sustituto analítico ante la falta de dataset oficial de 'Refugios Climáticos'. Buffer de desvío de 200m.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Arquitectura */}
        <section className="mb-12">
          <h2 className="font-display font-semibold text-2xl text-[var(--ds-black)] mb-6 pb-2 border-b border-[var(--ds-gray-200)]">5. Stack Tecnológico</h2>
          <div className="grid sm:grid-cols-2 gap-8 font-sans text-[var(--ds-gray-700)]">
            <div>
              <h4 className="font-semibold text-[var(--ds-black)] mb-3 flex items-center">
                <div className="w-1.5 h-4 bg-[var(--ds-black)] mr-2 rounded-sm"></div>
                Backend & Geoprocesamiento
              </h4>
              <ul className="space-y-2 text-sm list-disc pl-5">
                <li><strong className="text-[var(--ds-black)]">Python 3.11</strong> (Core logic)</li>
                <li><strong className="text-[var(--ds-black)]">FastAPI</strong> (API RESTful de alto rendimiento)</li>
                <li><strong className="text-[var(--ds-black)]">GeoPandas & Shapely</strong> (Operaciones espaciales vectoriales)</li>
                <li><strong className="text-[var(--ds-black)]">OSMnx & NetworkX</strong> (Topología de grafos y Dijkstra)</li>
                <li><strong className="text-[var(--ds-black)]">pvlib & pybdshadow</strong> (Astro-geometría)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--ds-black)] mb-3 flex items-center">
                <div className="w-1.5 h-4 bg-[var(--ds-gray-400)] mr-2 rounded-sm"></div>
                Frontend & Visualización
              </h4>
              <ul className="space-y-2 text-sm list-disc pl-5">
                <li><strong className="text-[var(--ds-black)]">Next.js 15 (App Router)</strong> + React 19</li>
                <li><strong className="text-[var(--ds-black)]">TypeScript</strong> (Tipado estricto)</li>
                <li><strong className="text-[var(--ds-black)]">Tailwind CSS v4</strong> (Sistema de diseño)</li>
                <li><strong className="text-[var(--ds-black)]">Leaflet & React-Leaflet</strong> (Motor cartográfico 2D)</li>
                <li><strong className="text-[var(--ds-black)]">Recharts</strong> (Data-viz de altimetría y cobertura)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer actions */}
        <div className="mt-16 pt-8 border-t border-[var(--ds-gray-200)] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link href="/">
            <Button className="h-12 px-6 rounded-lg bg-[var(--ds-black)] text-white hover:bg-[var(--ds-gray-800)] font-medium text-sm transition-all shadow-md">
              <ArrowLeft className="w-4 h-4 mr-2" /> 
              Abrir Visor Cartográfico
            </Button>
          </Link>
          <a href="https://github.com/vidalj/madrid-refugio" target="_blank" rel="noreferrer" className="text-sm font-medium text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] flex items-center transition-colors">
            Ver código fuente <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>

      </div>
    </main>
  );
}