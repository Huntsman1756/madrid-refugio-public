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
  Thermometer,
  Map,
  GitBranch,
  Layers,
} from "lucide-react";
import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────────────────────
const dataRows = [
  {
    name: "Edificación (Geoportal)",
    use: "Volumetría 3D y obstaculización solar teórica.",
    format: "GeoJSON / WFS",
    license: "CC BY 4.0",
    scope: "~200 000 edificios",
    url: "https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=d3c8a4cc6c6d4610VgnVCM1000001d4a900aRCRD",
  },
  {
    name: "Callejero Oficial",
    use: "Geocodificación precisa y autocompletado de direcciones.",
    format: "CSV / WFS",
    license: "CC BY 4.0",
    scope: "~90 000 tramos",
    url: "https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=b4c355a773b25610VgnVCM2000001f4a900aRCRD",
  },
  {
    name: "Arbolado Viario",
    use: "Cobertura de dosel vegetal (sombra biológica) asignada a tramos de calle mediante buffer espacial de 5 m.",
    format: "GeoJSON",
    license: "CC BY 4.0",
    scope: "~200 000 árboles",
    url: "https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=45cbc1bc50a25610VgnVCM1000001d4a900aRCRD",
  },
  {
    name: "Padrón Municipal (Edad)",
    use: "Análisis demográfico para ponderar la vulnerabilidad de áreas frente al calor extremo.",
    format: "CSV",
    license: "CC BY 4.0",
    scope: "Sección censal",
    url: "https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=7d5dc08b54f9b610VgnVCM2000001f4a900aRCRD",
  },
  {
    name: "Fuentes de Agua Potable",
    use: "Puntos de avituallamiento hídrico. Detección en ruta mediante un buffer dinámico de 75 m sobre el trayecto.",
    format: "GeoJSON",
    license: "CC BY 4.0",
    scope: "+1 200 puntos",
    url: "https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=60bc7d2bb09e9610VgnVCM1000001d4a900aRCRD",
  },
  {
    name: "Equipamientos Municipales",
    use: "Sustituto analítico ante la falta de dataset oficial de «Refugios Climáticos». Buffer de desvío de 200 m.",
    format: "GeoJSON / CSV",
    license: "CC BY 4.0",
    scope: "+4 000 equipamientos",
    url: "https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=dc758d4ac47f4410VgnVCM2000001f4a900aRCRD",
  },
];

const metrics = [
  { value: "6", label: "Datasets abiertos", sub: "Catálogo Madrid + OSM" },
  { value: "64,1 %", label: "Barrios sin refugio", sub: "Radio caminable 300 m" },
  { value: "~200 k", label: "Edificios procesados", sub: "Volumetría 3D" },
  { value: "48", label: "Franjas horarias", sub: "Simulación diaria" },
  { value: "<800 ms", label: "Tiempo de respuesta", sub: "Ruta óptima extremo a extremo" },
  { value: "5 m", label: "Buffer dosel vegetal", sub: "Sombra biológica" },
];

const backendStack = [
  { name: "Python", version: "3.11", role: "Core logic" },
  { name: "FastAPI", version: "0.110", role: "API RESTful" },
  { name: "GeoPandas", version: "0.14", role: "Operaciones vectoriales" },
  { name: "Shapely", version: "2.0", role: "Geometría espacial" },
  { name: "OSMnx", version: "1.9", role: "Descarga y topología OSM" },
  { name: "NetworkX", version: "3.3", role: "Algoritmo de Dijkstra" },
  { name: "pvlib", version: "0.10", role: "Posición solar (astro-geometría)" },
  { name: "pybdshadow", version: "0.4", role: "Sombras de edificios 3D" },
];

const frontendStack = [
  { name: "Next.js", version: "15", role: "App Router + SSR" },
  { name: "React", version: "19", role: "UI framework" },
  { name: "TypeScript", version: "5.4", role: "Tipado estricto" },
  { name: "Tailwind CSS", version: "v4", role: "Sistema de diseño" },
  { name: "Leaflet", version: "1.9", role: "Cartografía 2D" },
  { name: "React-Leaflet", version: "4.2", role: "Integración React" },
  { name: "Recharts", version: "2.12", role: "Data-viz de apoyo" },
];

// ─── Inline SVG: Data Pipeline ─────────────────────────────────────────────────
function PipelineDiagram() {
  const steps = [
    { id: "datos", label: "Datos Abiertos", sub: "Catálogo Madrid", color: "var(--climate-terracotta)", icon: "D" },
    { id: "osm", label: "OSM + LiDAR", sub: "Red vial + alturas", color: "var(--climate-cyan)", icon: "O" },
    { id: "shadow", label: "Modelo de Sombras", sub: "pvlib · pybdshadow", color: "var(--climate-green)", icon: "S" },
    { id: "graph", label: "Grafo de Red", sub: "OSMnx · NetworkX", color: "var(--climate-green)", icon: "G" },
    { id: "api", label: "API FastAPI", sub: "Dijkstra modificado", color: "var(--climate-cyan)", icon: "A" },
    { id: "visor", label: "Visor Web", sub: "Next.js · Leaflet", color: "var(--climate-terracotta)", icon: "V" },
  ];

  const W = 840;
  const H = 160;
  const boxW = 110;
  const boxH = 64;
  const gap = (W - steps.length * boxW) / (steps.length + 1);
  const y = (H - boxH) / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Pipeline de procesamiento de datos">
      {/* Arrow connectors */}
      {steps.slice(0, -1).map((_, i) => {
        const x1 = gap * (i + 1) + boxW * i + boxW;
        const x2 = gap * (i + 2) + boxW * (i + 1);
        const midY = H / 2;
        return (
          <g key={`arrow-${i}`}>
            <line
              x1={x1 + 2}
              y1={midY}
              x2={x2 - 2}
              y2={midY}
              stroke="var(--ds-gray-300)"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <polygon
              points={`${x2 - 2},${midY - 4} ${x2 + 5},${midY} ${x2 - 2},${midY + 4}`}
              fill="var(--ds-gray-300)"
            />
          </g>
        );
      })}

      {/* Step boxes */}
      {steps.map((step, i) => {
        const x = gap * (i + 1) + boxW * i;
        return (
          <g key={step.id}>
            <rect
              x={x}
              y={y}
              width={boxW}
              height={boxH}
              rx="10"
              fill="var(--ds-white)"
              stroke={step.color}
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            {/* Color top bar */}
            <rect x={x} y={y} width={boxW} height="4" rx="2" fill={step.color} opacity="0.6" />
            {/* Step number */}
            <text
              x={x + 10}
              y={y + 18}
              fontSize="8"
              fontFamily="monospace"
              fill={step.color}
              fontWeight="700"
              opacity="0.7"
            >
              0{i + 1}
            </text>
            {/* Label */}
            <text
              x={x + boxW / 2}
              y={y + 32}
              fontSize="9.5"
              fontFamily="'Instrument Sans', sans-serif"
              fontWeight="600"
              textAnchor="middle"
              fill="var(--ds-gray-800)"
            >
              {step.label}
            </text>
            {/* Sub-label */}
            <text
              x={x + boxW / 2}
              y={y + 46}
              fontSize="7.5"
              fontFamily="monospace"
              textAnchor="middle"
              fill="var(--ds-gray-500)"
            >
              {step.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Inline SVG: Cost Function Visualisation ───────────────────────────────────
function CostFunctionViz() {
  return (
    <svg viewBox="0 0 520 230" className="w-full" aria-label="Visualización de la función de coste térmico">
      {/* Background */}
      <rect width="520" height="230" rx="16" fill="var(--ds-gray-50)" />

      {/* Title */}
      <text x="260" y="28" textAnchor="middle" fontSize="11" fontWeight="700"
        fontFamily="'Instrument Sans', sans-serif" fill="var(--ds-gray-600)" letterSpacing="0.08em">
        COSTE RELATIVO POR TIPO DE PENALIZACIÓN
      </text>

      {/* Y axis label */}
      <text x="18" y="140" fontSize="8" fontFamily="monospace" fill="var(--ds-gray-400)"
        transform="rotate(-90,18,140)" textAnchor="middle">
        peso relativo
      </text>

      {/* Gridlines */}
      {[0.25, 0.5, 0.75, 1.0].map((v, i) => {
        const yg = 50 + (1 - v) * 130;
        return (
          <g key={i}>
            <line x1="50" y1={yg} x2="500" y2={yg} stroke="var(--ds-gray-200)" strokeWidth="0.8" />
            <text x="44" y={yg + 3} fontSize="7" fontFamily="monospace" textAnchor="end" fill="var(--ds-gray-400)">
              {v.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Bars: 3 scenarios × 4 components */}
      {/* Scenario 1: Minimal aversion (α=0.3, β=0.2, γ=0.1) */}
      {/* Scenario 2: Default (α=0.6, β=0.4, γ=0.25) */}
      {/* Scenario 3: Max aversion (α=1.0, β=0.8, γ=0.4) */}
      {[
        { label: "Longitud pura", color: "var(--ds-gray-400)", values: [1.0, 1.0, 1.0], x: 72 },
        { label: "Penalización edificios (α)", color: "var(--climate-terracotta)", values: [0.3, 0.6, 1.0], x: 220 },
        { label: "Penalización dosel (β)", color: "var(--climate-cyan)", values: [0.2, 0.4, 0.8], x: 348 },
        { label: "Bonificación amenity (γ)", color: "var(--climate-green)", values: [0.1, 0.25, 0.4], x: 436 },
      ].map((group, gi) => {
        const scLabels = ["Mín.", "Def.", "Máx."];
        return (
          <g key={gi}>
            {group.values.map((v, si) => {
              const bh = v * 130;
              const by = 50 + 130 - bh;
              const bx = group.x + si * 22;
              return (
                <g key={si}>
                  <rect x={bx} y={by} width="18" height={bh} rx="3"
                    fill={group.color} opacity={0.35 + si * 0.2} />
                  <text x={bx + 9} y={by - 4} fontSize="6.5" fontFamily="monospace"
                    textAnchor="middle" fill="var(--ds-gray-500)">
                    {scLabels[si]}
                  </text>
                </g>
              );
            })}
            {/* Group label */}
            <text x={group.x + 28} y={200} fontSize="7.5"
              fontFamily="'Instrument Sans', sans-serif"
              textAnchor="middle" fill="var(--ds-gray-600)" fontWeight="600">
              {group.label.split(" ").map((word, wi) => (
                <tspan key={wi} x={group.x + 28} dy={wi === 0 ? 0 : 10}>{word}</tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* X axis */}
      <line x1="50" y1="180" x2="500" y2="180" stroke="var(--ds-gray-300)" strokeWidth="1" />

      {/* Legend */}
      {[
        { label: "Aversión mínima", opacity: 0.35 },
        { label: "Configuración por defecto", opacity: 0.55 },
        { label: "Aversión máxima", opacity: 0.75 },
      ].map((l, i) => (
        <g key={i} transform={`translate(${56 + i * 148}, 218)`}>
          <rect width="10" height="10" rx="2" fill="var(--climate-terracotta)" opacity={l.opacity} />
          <text x="14" y="9" fontSize="8" fontFamily="'Instrument Sans', sans-serif"
            fill="var(--ds-gray-500)">{l.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Shadow Model SVG ──────────────────────────────────────────────────────────
function ShadowModelDiagram() {
  return (
    <svg viewBox="0 0 480 200" className="w-full" aria-label="Diagrama del modelo de sombras urbanas">
      <rect width="480" height="200" rx="14" fill="var(--ds-white)" />

      {/* Sun arc */}
      <path d="M40 160 Q 240 20 440 160" fill="none" stroke="var(--climate-terracotta)"
        strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      {/* Sun positions */}
      {[
        { cx: 90, cy: 130, label: "06:00" },
        { cx: 190, cy: 60, label: "10:00" },
        { cx: 240, cy: 38, label: "12:00" },
        { cx: 300, cy: 58, label: "15:00" },
        { cx: 390, cy: 120, label: "19:00" },
      ].map(({ cx, cy, label }) => (
        <g key={label}>
          <circle cx={cx} cy={cy} r="5" fill="var(--climate-terracotta)" opacity="0.55" />
          <text x={cx} y={cy - 9} fontSize="7" fontFamily="monospace" textAnchor="middle"
            fill="var(--climate-terracotta)" opacity="0.7">{label}</text>
        </g>
      ))}

      {/* Ground */}
      <line x1="30" y1="165" x2="450" y2="165" stroke="var(--ds-gray-300)" strokeWidth="1" />

      {/* Buildings */}
      {[
        { x: 120, w: 40, h: 80 },
        { x: 210, w: 55, h: 110 },
        { x: 320, w: 38, h: 65 },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={165 - b.h} width={b.w} height={b.h} rx="2"
            fill="var(--ds-gray-200)" stroke="var(--ds-gray-300)" strokeWidth="0.8" />
          {/* Shadow cast */}
          <polygon
            points={`${b.x},165 ${b.x + b.w},165 ${b.x + b.w + b.h * 0.4},165 ${b.x + b.h * 0.4},165`}
            fill="var(--ds-gray-400)"
            opacity="0.18"
          />
        </g>
      ))}

      {/* Shade zone annotation */}
      <rect x="128" y="155" width="55" height="10" rx="2"
        fill="var(--ds-gray-700)" opacity="0.10" />
      <text x="155" y="163" fontSize="6.5" fontFamily="monospace" textAnchor="middle"
        fill="var(--ds-gray-600)">zona sombreada</text>

      {/* Labels */}
      <text x="240" y="190" fontSize="8.5" fontFamily="'Instrument Sans', sans-serif"
        textAnchor="middle" fill="var(--ds-gray-500)" fontWeight="600">
        Simulación solar — resolución horaria — 48 franjas / día
      </text>
    </svg>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">

      {/* ── Navbar ── */}
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
            <div className="hidden sm:block text-right">
              <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--ds-gray-400)]">
                Documento técnico
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ds-gray-500)]">
                Memoria técnica
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 sm:pt-14">

        {/* ── Header ── */}
        <header className="section-shell rounded-[32px] px-6 py-10 sm:px-10 sm:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--ds-gray-200)] bg-[var(--ds-white)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--climate-green)] shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Documentación abierta · Premio Reutilización 2026
            </div>
            <h1 className="hero-title-serif text-[clamp(2.8rem,6vw,5.5rem)] text-[var(--ds-black)]">
              Arquitectura y
              <br />
              Algoritmia Climática
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[var(--ds-gray-600)] sm:text-xl">
              Memoria técnica detallada sobre la generación del modelo de sombras urbanas,
              el motor de enrutamiento térmico con Dijkstra modificado y la reutilización
              de <strong className="text-[var(--ds-black)] font-semibold">6 datasets abiertos</strong> del
              Catálogo de Datos Abiertos del Ayuntamiento de Madrid.
            </p>
          </div>
        </header>

        <div className="mt-10 space-y-10">

          {/* ── Impact metrics ── */}
          <section aria-label="Métricas clave">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {metrics.map((m) => (
                <Card key={m.label} level={1}
                  className="section-shell rounded-[24px] p-5 text-center">
                  <p className="stat-number text-[2rem] leading-none text-[var(--ds-black)]">
                    {m.value}
                  </p>
                  <p className="mt-1.5 text-[0.8rem] font-semibold text-[var(--ds-gray-700)]">
                    {m.label}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] text-[var(--ds-gray-400)] uppercase tracking-[0.14em]">
                    {m.sub}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* ── 01 Resumen Ejecutivo ── */}
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Card level={1} className="section-shell rounded-[32px] p-8 sm:p-10">
              <p className="editorial-kicker mb-3 text-[var(--ds-gray-400)] text-[10px] font-bold uppercase tracking-[0.28em]">
                01 — Resumen Ejecutivo
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl leading-[1.1]">
                Simulación climática operativa para caminar mejor
              </h2>
              <div className="mt-6 space-y-4 text-[1.03rem] leading-relaxed text-[var(--ds-gray-700)]">
                <p>
                  <strong className="text-[var(--ds-black)]">Madrid Refugio</strong> es una herramienta
                  de simulación climática urbana que calcula rutas peatonales optimizadas para el
                  confort térmico en el momento preciso de la consulta, combinando datos abiertos
                  municipales con topología de red.
                </p>
                <p>
                  El proyecto responde a una brecha crítica: el{" "}
                  <strong className="text-[var(--ds-black)]">64,1 % de los barrios de Madrid</strong>{" "}
                  no dispone de un refugio climático operativo en un radio caminable de 300 metros.
                  El sistema prioriza <em>sombra</em>, <em>fuentes de agua potable</em> y acceso
                  a equipamientos climatizados.
                </p>
                <p>
                  Toda la lógica de enrutamiento es determinista y reproducible: ante la misma
                  entrada (origen, destino, hora, preferencias), el sistema siempre produce la
                  misma ruta óptima. Los datos subyacentes se actualizan en origen desde el
                  Catálogo Municipal, garantizando trazabilidad completa.
                </p>
              </div>

              <blockquote className="mt-8 rounded-[24px] bg-[var(--climate-green)] px-6 py-7 text-white shadow-[0_20px_40px_rgba(33,48,43,0.14)] sm:px-8">
                <p className="font-display text-2xl italic leading-snug sm:text-3xl">
                  "No buscamos la ruta más corta, sino la de menor coste térmico
                  para poblaciones vulnerables durante episodios de calor extremo."
                </p>
              </blockquote>
            </Card>

            <div className="flex flex-col gap-5">
              <Card level={1} className="section-shell rounded-[28px] p-7 text-center flex-1">
                <Database className="mx-auto h-9 w-9 text-[var(--climate-cyan)]" />
                <h3 className="mt-3 font-display text-2xl text-[var(--ds-black)]">
                  Datos abiertos
                </h3>
                <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">
                  Catálogo municipal · CC BY 4.0
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ds-gray-600)]">
                  6 datasets del Portal de Datos Abiertos del Ayuntamiento de Madrid, todos bajo licencia abierta.
                </p>
              </Card>

              <Card level={1} className="rounded-[28px] border border-[rgba(30,106,79,0.16)] bg-[rgba(30,106,79,0.07)] p-7 text-center flex-1">
                <Cpu className="mx-auto h-9 w-9 text-[var(--climate-green)]" />
                <h3 className="mt-3 font-display text-2xl text-[var(--ds-black)]">
                  Modelo determinista
                </h3>
                <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">
                  Sombra urbana · resolución horaria
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ds-gray-600)]">
                  48 franjas horarias diarias. Resultados reproducibles. Código fuente abierto en GitHub.
                </p>
              </Card>
            </div>
          </section>

          {/* ── 02 Pipeline Visual ── */}
          <section className="section-shell rounded-[32px] p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ds-gray-400)] mb-2">
                02 — Pipeline de Datos
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
                Del dato abierto a la decisión peatonal
              </h2>
              <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-[var(--ds-gray-600)]">
                El pipeline transforma datos brutos heterogéneos (GeoJSON, CSV, WFS) en una
                respuesta de ruta en menos de 800 ms. Cada paso es reproducible y documentado.
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--ds-gray-200)] bg-[var(--ds-white)] p-6 sm:p-8 shadow-sm">
              <PipelineDiagram />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-center">
              {["Catálogo Municipal + OSM", "Geocodificación + LiDAR", "Sombras 3D por hora", "Grafo de 200k tramos", "Dijkstra térmico", "Respuesta ≤ 800 ms"].map((desc, i) => (
                <div key={i} className="rounded-[14px] bg-[var(--ds-white)] border border-[var(--ds-gray-100)] px-3 py-2.5 text-[0.7rem] font-medium text-[var(--ds-gray-600)] shadow-sm">
                  <span className="block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-400)] mb-0.5">paso 0{i + 1}</span>
                  {desc}
                </div>
              ))}
            </div>
          </section>

          {/* ── 03 Función de Coste ── */}
          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <Card level={1} className="section-shell rounded-[32px] p-8 sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ds-gray-400)] mb-2">
                03 — Función de Coste y Enrutamiento
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl leading-[1.1]">
                Penalización térmica dinámica
              </h2>
              <div className="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-[var(--ds-gray-700)]">
                <p>
                  El motor implementa <strong className="text-[var(--ds-black)]">Dijkstra modificado</strong>{" "}
                  sobre un grafo <code className="rounded-[6px] bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-[0.88em] font-mono text-[var(--ds-gray-800)]">NetworkX</code> derivado
                  de OpenStreetMap. Por cada consulta se evalúan dos caminos simultáneamente.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] p-4">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--ds-gray-400)] mb-1">Ruta Directa</p>
                    <p className="text-[0.9rem] text-[var(--ds-gray-700)]">Minimiza longitud euclidiana pura. Sin penalizaciones.</p>
                  </div>
                  <div className="rounded-[16px] border border-[rgba(30,106,79,0.2)] bg-[rgba(30,106,79,0.06)] p-4">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--climate-green)] mb-1">Ruta Térmica</p>
                    <p className="text-[0.9rem] text-[var(--ds-gray-700)]">Penaliza exposición solar, bonifica amenidades climáticas.</p>
                  </div>
                </div>
                <p>
                  El usuario controla los pesos α, β y γ mediante un selector de preferencia
                  térmica, variando desde modo conservador hasta aversión estricta al sol.
                </p>
              </div>

              <div className="mt-7 rounded-[20px] border border-[var(--ds-gray-200)] bg-[var(--ds-gray-900)] p-5 text-white shadow-inner sm:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--climate-green)]" />
                    Python · coste_termico.py
                  </span>
                </div>
                <pre className="overflow-x-auto font-mono text-[0.82rem] leading-[1.75] text-[var(--ds-gray-200)]">
{`cost_e = length_e * (
  1.0
  + (1 - shadow_building_e) * α   # sombra edificios
  + (1 - canopy_cover_e)   * β   # dosel vegetal
  - (amenity_bonus_e)      * γ   # bonif. amenidades
)`}
                </pre>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { param: "α", label: "Sombra edificios", color: "text-[var(--climate-terracotta)]", desc: "0 – 1.0" },
                    { param: "β", label: "Dosel vegetal", color: "text-[var(--climate-cyan)]", desc: "0 – 0.8" },
                    { param: "γ", label: "Bonificación", color: "text-[var(--climate-green)]", desc: "0 – 0.4" },
                  ].map(({ param, label, color, desc }) => (
                    <div key={param} className="rounded-[12px] border border-white/8 bg-white/5 p-3">
                      <p className={`text-xl font-bold font-mono ${color}`}>{param}</p>
                      <p className="text-[0.72rem] text-white/60 mt-0.5">{label}</p>
                      <p className="text-[0.68rem] text-white/35 mt-0.5 font-mono">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div className="section-shell rounded-[32px] p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--ds-gray-400)] mb-5">
                Impacto de los parámetros sobre el coste de cada tramo
              </p>
              <CostFunctionViz />
              <p className="mt-5 text-[0.82rem] leading-relaxed text-[var(--ds-gray-500)]">
                Cada barra muestra el peso relativo de cada componente de coste bajo tres
                niveles de aversión al calor. La longitud de base siempre vale 1,0;
                los coeficientes α, β y γ lo incrementan o reducen.
              </p>
            </div>
          </section>

          {/* ── 04 Modelo de Sombras ── */}
          <section className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <Card level={1} className="section-shell rounded-[32px] p-8 sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ds-gray-400)] mb-2">
                04 — Modelo de Sombras Urbanas
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl leading-[1.1]">
                Geometría solar aplicada a la red peatonal
              </h2>
              <div className="mt-6 space-y-4 text-[1.02rem] leading-relaxed text-[var(--ds-gray-700)]">
                <p>
                  El modelo de sombras combina dos fuentes: la{" "}
                  <strong className="text-[var(--ds-black)]">volumetría 3D de edificios</strong>{" "}
                  (Geoportal Municipal) con la posición astronómica del sol calculada mediante{" "}
                  <code className="rounded-[6px] bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-[0.88em] font-mono text-[var(--ds-gray-800)]">pvlib</code>{" "}
                  y proyectada con{" "}
                  <code className="rounded-[6px] bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-[0.88em] font-mono text-[var(--ds-gray-800)]">pybdshadow</code>.
                </p>
                <p>
                  Se generan <strong className="text-[var(--ds-black)]">48 franjas horarias</strong> por día (cada 30 minutos),
                  calculando para cada tramo de calle el porcentaje de superficie bajo sombra de
                  edificio. El resultado es una matriz{" "}
                  <code className="rounded-[6px] bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-[0.88em] font-mono">tramo × hora → shadow_factor ∈ [0,1]</code>.
                </p>
                <p>
                  La sombra biológica (dosel arbóreo) se calcula de forma independiente mediante
                  un buffer espacial de{" "}
                  <strong className="text-[var(--ds-black)]">5 metros</strong> sobre el dataset de arbolado
                  viario, produciendo el parámetro <code className="rounded-[6px] bg-[var(--ds-gray-100)] px-1.5 py-0.5 text-[0.88em] font-mono">canopy_cover_e</code>.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: <Thermometer className="h-5 w-5 text-[var(--climate-terracotta)]" />, label: "Altitud solar", desc: "Calculada con pvlib para Madrid (40.4°N / 3.7°W)" },
                  { icon: <Layers className="h-5 w-5 text-[var(--climate-cyan)]" />, label: "Proyección 3D", desc: "pybdshadow proyecta alturas de edificios sobre la trama de calles" },
                  { icon: <Map className="h-5 w-5 text-[var(--climate-green)]" />, label: "Resolución espacial", desc: "Buffer 5 m arbolado viario asignado a cada tramo de grafo" },
                  { icon: <GitBranch className="h-5 w-5 text-[var(--ds-gray-500)]" />, label: "Integración en grafo", desc: "shadow_factor y canopy_cover añadidos como atributos de arista" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="rounded-[16px] border border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] p-4">
                    <div className="flex items-center gap-2 mb-1.5">{icon}
                      <p className="text-[0.8rem] font-bold text-[var(--ds-black)]">{label}</p>
                    </div>
                    <p className="text-[0.78rem] leading-relaxed text-[var(--ds-gray-500)]">{desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="section-shell rounded-[32px] p-5 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--ds-gray-400)] mb-5">
                Simulación solar — trayectoria diurna sobre tejido urbano
              </p>
              <ShadowModelDiagram />
              <div className="mt-5 rounded-[16px] border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] p-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-400)] mb-2">
                  Parámetros de localización
                </p>
                <div className="grid grid-cols-3 gap-3 font-mono">
                  {[
                    { k: "Latitud", v: "40.4168° N" },
                    { k: "Longitud", v: "3.7038° O" },
                    { k: "Huso horario", v: "Europe/Madrid" },
                    { k: "Franjas/día", v: "48 (Δ 30 min)" },
                    { k: "Periodo tipo", v: "Jun – Sep" },
                    { k: "Resolución", v: "Por tramo OSM" },
                  ].map(({ k, v }) => (
                    <div key={k}>
                      <p className="text-[0.65rem] text-[var(--ds-gray-400)] uppercase tracking-[0.12em]">{k}</p>
                      <p className="text-[0.82rem] font-semibold text-[var(--ds-black)]">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── 05 Inventario de Datos Abiertos ── */}
          <section className="section-shell rounded-[32px] p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ds-gray-400)] mb-2">
                05 — Inventario de Datos Abiertos
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
                Trazabilidad completa de fuentes
              </h2>
              <p className="mt-4 max-w-3xl text-[1.02rem] leading-relaxed text-[var(--ds-gray-600)]">
                Todos los datasets provienen del{" "}
                <strong className="text-[var(--ds-black)]">Catálogo de Datos Abiertos del Ayuntamiento de Madrid</strong> y
                están publicados bajo licencia <strong className="text-[var(--ds-black)]">CC BY 4.0</strong>.
                Las URLs de origen están enlazadas directamente para garantizar reproducibilidad total.
              </p>
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-[var(--ds-gray-200)] bg-[var(--ds-white)] shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)]">
                    <th className="px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-500)]">Dataset</th>
                    <th className="px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-500)]">Aplicación en el modelo</th>
                    <th className="px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-500)] whitespace-nowrap">Formato</th>
                    <th className="px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-500)] whitespace-nowrap">Licencia</th>
                    <th className="px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-500)] whitespace-nowrap">Alcance</th>
                    <th className="px-5 py-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--ds-gray-500)]">Fuente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ds-gray-100)]">
                  {dataRows.map((row) => (
                    <tr key={row.name} className="align-top hover:bg-[var(--ds-gray-50)] transition-colors">
                      <td className="px-5 py-4 font-semibold text-[0.9rem] text-[var(--ds-black)] whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="px-5 py-4 text-[0.88rem] leading-relaxed text-[var(--ds-gray-600)] max-w-xs">
                        {row.use}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-[8px] border border-[var(--climate-cyan)]/30 bg-[var(--climate-cyan)]/8 px-2 py-0.5 text-[0.72rem] font-mono font-semibold text-[var(--climate-cyan)] whitespace-nowrap">
                          {row.format}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-[8px] border border-[var(--climate-green)]/25 bg-[var(--climate-green)]/8 px-2 py-0.5 text-[0.72rem] font-semibold text-[var(--climate-green)] whitespace-nowrap">
                          {row.license}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[0.8rem] font-mono text-[var(--ds-gray-600)] whitespace-nowrap">
                        {row.scope}
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-[var(--climate-cyan)] underline-offset-2 hover:underline transition-opacity hover:opacity-80"
                        >
                          datos.madrid.es
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── 06 Stack Tecnológico ── */}
          <section className="section-shell rounded-[32px] p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--ds-gray-400)] mb-2">
                06 — Stack Tecnológico
              </p>
              <h2 className="font-display text-4xl italic text-[var(--ds-black)] sm:text-5xl">
                Tecnología de código abierto
              </h2>
              <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-[var(--ds-gray-600)]">
                Toda la pila tecnológica es de código abierto. El repositorio es público y
                reproducible con un único comando de instalación.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-2">
              {[
                { title: "Backend & Geoprocesamiento", icon: <Cpu className="h-5 w-5 text-[var(--climate-green)]" />, color: "var(--climate-green)", items: backendStack },
                { title: "Frontend & Visualización", icon: <Map className="h-5 w-5 text-[var(--climate-cyan)]" />, color: "var(--climate-cyan)", items: frontendStack },
              ].map(({ title, icon, color, items }) => (
                <div key={title}>
                  <div className="flex items-center gap-2.5 mb-5">
                    {icon}
                    <h3 className="text-[1.1rem] font-bold text-[var(--ds-black)]">{title}</h3>
                  </div>
                  <div className="space-y-2">
                    {items.map(({ name, version, role }) => (
                      <div key={name}
                        className="flex items-center gap-3 rounded-[14px] border border-[var(--ds-gray-100)] bg-[var(--ds-white)] px-4 py-3 hover:border-[var(--ds-gray-200)] transition-colors">
                        <span className="font-semibold text-[0.92rem] text-[var(--ds-black)] min-w-[120px]">
                          {name}
                        </span>
                        <span
                          className="rounded-[7px] px-2 py-0.5 text-[0.68rem] font-mono font-bold border whitespace-nowrap"
                          style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                        >
                          v{version}
                        </span>
                        <span className="text-[0.82rem] text-[var(--ds-gray-500)] leading-tight">
                          {role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Footer ── */}
        <footer className="mt-16 border-t border-[var(--ds-gray-100)] pt-10 pb-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--ds-gray-400)] mb-2">
                Premio Reutilización de Datos Abiertos 2026 · Ayuntamiento de Madrid
              </p>
              <p className="text-sm text-[var(--ds-gray-500)] max-w-md">
                Toda la documentación, código y datos están disponibles públicamente.
                Proyecto de código abierto bajo licencia MIT.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Link href="/">
                <Button className="h-12 rounded-[14px] px-6 text-sm font-medium shadow-md">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ir al Visor Cartográfico
                </Button>
              </Link>
              <a
                href="https://github.com/vidalj/madrid-refugio"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ds-gray-500)] transition-colors hover:text-[var(--ds-black)]"
              >
                Ver código fuente en GitHub <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
