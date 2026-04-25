"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThermometerSun, TreePine, Navigation, Map as MapIcon, Activity, Database, Droplets, Building2, Users, Wind, MapPin, Landmark } from "lucide-react";
import { AlcalaLogo, HeroClimateArt, OrganicTree } from "@/components/branding/HomeVisuals";
import { RoutingSection } from "@/components/RoutingSection";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getTop10PanelState } from "./home-data-state";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <div className="w-full h-full bg-[var(--ds-gray-50)] rounded-xl animate-pulse flex items-center justify-center text-[var(--ds-gray-500)]">Loading Map...</div> });

function CountUp({ end, decimals = 0, suffix = "" }: { end: number, decimals?: number, suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    // Accesibilidad: reducir movimiento si el usuario lo tiene configurado en OS
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(end);
      return;
    }

    let start: number | null = null;
    const duration = 2000;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(end * ease);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };
    frameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(frameId);
  }, [end]);
  return <>{val.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

export default function Home() {
  const [mergedData, setMergedData] = useState<any>(null);
  const [mergedDataError, setMergedDataError] = useState<string | null>(null);
  const [refugios, setRefugios] = useState<any>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<string | null>(null);
  const [barrioStats, setBarrioStats] = useState<any>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lon: number } | null>(null);
  const [viewMode, setViewMode] = useState<'vulnerability' | 'shelter_deficit'>('vulnerability');
  const [fontScale, setFontScale] = useState(1);
  const [clickStamp, setClickStamp] = useState(Date.now());

  const loadMergedData = async () => {
    setMergedDataError(null);

    try {
      const response = await fetch('/data/barrios_merged.geojson');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMergedData(data);
    } catch {
      setMergedData(null);
      setSelectedBarrio(null);
      setBarrioStats(null);
      setMergedDataError('No se pudo cargar el análisis territorial.');
    }
  };

  useEffect(() => {
    loadMergedData();
    fetch('/data/refugios_sustitutos.geojson').then(res => res.json()).then(setRefugios).catch(() => setRefugios(null));
  }, []);

  // ── Scroll reveal observer ──
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const el = mainRef.current;
    if (el) {
      el.querySelectorAll('.fade-in-up').forEach((node) => observer.observe(node));
    }
    return () => observer.disconnect();
  }, [mergedData]);

  const changeScale = (delta: number) => {
    const newScale = Math.max(0.8, Math.min(1.5, fontScale + delta));
    setFontScale(newScale);
    document.documentElement.style.setProperty('--scale', newScale.toString());
  };

  const handleBarrioSelect = (name: string) => {
    setSelectedBarrio(name);
    setClickStamp(Date.now());
    if (mergedData) {
      const feature = mergedData.features.find((f: any) => f.properties.NOMBRE === name);
      if (feature) setBarrioStats(feature.properties);
    }
  };

  // Compute ranking: sort all barrios by priority_score_norm descending, find position
  const getBarrioRanking = (nombre: string) => {
    if (!mergedData) return null;
    const sorted = [...mergedData.features]
      .sort((a: any, b: any) => (b.properties.priority_score_norm || 0) - (a.properties.priority_score_norm || 0));
    const pos = sorted.findIndex((f: any) => f.properties.NOMBRE === nombre);
    return pos >= 0 ? pos + 1 : null;
  };

  // Get centroid of a barrio feature for flyTo
  const getBarrioCentroid = (nombre: string): { lat: number; lon: number } | null => {
    if (!mergedData) return null;
    const feature = mergedData.features.find((f: any) => f.properties.NOMBRE === nombre);
    if (!feature) return null;
    const coords = feature.geometry?.coordinates?.[0];
    if (!coords?.length) return null;
    const avgLon = coords.reduce((s: number, c: number[]) => s + c[0], 0) / coords.length;
    const avgLat = coords.reduce((s: number, c: number[]) => s + c[1], 0) / coords.length;
    return { lat: avgLat, lon: avgLon };
  };

  // Helper: click a barrio from ranking → select + flyTo
  const selectBarrioAndFly = (nombre: string) => {
    handleBarrioSelect(nombre);
    const centroid = getBarrioCentroid(nombre);
    if (centroid) setFlyTarget({ ...centroid, lat: centroid.lat + Math.random() * 0.000001 });
  };

  // Top 10 sorted by priority descending
  const top10 = mergedData
    ? [...mergedData.features]
        .sort((a: any, b: any) => (b.properties.priority_score_norm || 0) - (a.properties.priority_score_norm || 0))
        .slice(0, 10)
    : [];
  const top10PanelState = getTop10PanelState(mergedData, mergedDataError);
  const journeySteps = [
    {
      step: "01",
      title: "Define el trayecto",
      detail: "Selecciona dos puntos reales de Madrid desde el catálogo oficial o usa tu ubicación actual como origen.",
      icon: Navigation,
      tone: "bg-[#ebf5ff] text-[#0a72ef]",
    },
    {
      step: "02",
      title: "Leemos la ciudad",
      detail: "Contrastamos la ruta directa con una alternativa más fresca usando sombra urbana, arbolado, agua y refugios próximos.",
      icon: TreePine,
      tone: "bg-[#f0fdf4] text-[#2d6a4f]",
    },
    {
      step: "03",
      title: "Devuelve una decisión",
      detail: "El resultado muestra el coste real del desvío, la sombra acumulada y los recursos climáticos del recorrido.",
      icon: ThermometerSun,
      tone: "bg-[#fff7ed] text-[#e67e22]",
    },
  ] as const;
  const valuePillars = [
    {
      title: "Salud",
      detail: "+432 m de sombra acumulada en la ruta óptima para reducir exposición directa en trayectos cotidianos.",
      icon: ThermometerSun,
      testId: "value-pillar-icon-salud",
      tone: "bg-[#ebf5ff] text-[#0a72ef]",
    },
    {
      title: "Clima",
      detail: "662.173 polígonos LiDAR y 661.192 árboles municipales convertidos en una señal útil para caminar mejor.",
      icon: TreePine,
      testId: "value-pillar-icon-clima",
      tone: "bg-[#f0fdf4] text-[#2d6a4f]",
    },
    {
      title: "Equidad",
      detail: "64,1% de barrios sin refugio operativo a menos de 300 metros: evidencia para priorizar adaptación climática.",
      icon: Users,
      testId: "value-pillar-icon-equidad",
      tone: "bg-[#fef2f2] text-[#ff5b4f]",
    },
  ] as const;
  const sourceCards = [
    { icon: Building2, label: "Modelo 3D municipal", detail: "Fuente oficial de referencia no enlazada por falta de URL publica estable verificada", color: "#0a72ef" },
    { icon: TreePine, label: "Arbolado detallado", detail: "Ficha oficial del dataset municipal", color: "#16a34a", href: "https://datos.madrid.es/dataset/300761-0-arbolado-especies" },
    { icon: Users, label: "Padron municipal historico", detail: "Ficha oficial del dataset municipal", color: "#de1d8d", href: "https://datos.madrid.es/dataset/209163-0-padron-municipal-historico" },
    { icon: Wind, label: "Calidad del aire", detail: "Ficha oficial del dataset municipal", color: "#f97316", href: "https://datos.madrid.es/dataset/201200-0-calidad-aire-horario" },
    { icon: Database, label: "Estaciones de aire", detail: "Ficha oficial del dataset municipal", color: "#7c3aed", href: "https://datos.madrid.es/dataset/212629-0-estaciones-control-aire" },
    { icon: Droplets, label: "Fuentes de agua para beber", detail: "Ficha oficial del dataset municipal", color: "#0ea5e9", href: "https://datos.madrid.es/dataset/300051-0-fuentes" },
    { icon: Landmark, label: "Bibliotecas municipales", detail: "Ficha oficial del dataset municipal", color: "#8b5cf6", href: "https://datos.madrid.es/dataset/201747-0-bibliobuses-bibliotecas" },
    { icon: Landmark, label: "Centros culturales", detail: "Ficha oficial del dataset municipal", color: "#6d28d9", href: "https://datos.madrid.es/dataset/200304-0-centros-culturales" },
    { icon: Landmark, label: "Polideportivos municipales", detail: "Ficha oficial del dataset municipal", color: "#9333ea", href: "https://datos.madrid.es/dataset/200186-0-polideportivos" },
    { icon: MapPin, label: "Barrios municipales", detail: "Limites administrativos oficiales", color: "#ff5b4f", href: "https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Barrios/Barrios.zip" },
    { icon: Database, label: "Portal datos.madrid.es", detail: "Catalogo oficial del Ayuntamiento", color: "#171717", href: "https://datos.madrid.es/portal/site/egob" },
  ];

  return (
    <main ref={mainRef} className="min-h-screen bg-[var(--background)]">
      {/* Navbar — minimal */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(91,84,74,0.08)] bg-[rgba(255,251,246,0.82)] px-4 py-3 shadow-[0_12px_32px_rgba(36,53,65,0.05)] backdrop-blur-md sm:px-6">
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,242,233,0.92))] shadow-[0_10px_22px_rgba(33,48,43,0.08)] ring-1 ring-[rgba(91,84,74,0.08)]">
            <AlcalaLogo className="h-8 w-8" />
          </span>
          <div>
            <span className="block font-sans font-semibold text-[var(--ds-black)] tracking-tight text-sm sm:text-base">Madrid Refugio</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">Planificador peatonal climático</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/metodologia"><Button variant="primary" className="max-sm:hidden h-9 px-4 text-sm sm:inline-flex">Metodología</Button></Link>
        </div>
        </div>
      </nav>

      {/* Hero — focused on search, not exposition */}
      <div className="max-w-[1760px] mx-auto px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <section className="hero-atmosphere hero-grid hero-frame px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,650px)] lg:items-center xl:gap-14">
            <div id="routing" className="text-left">
              <div className="fade-in-up mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(45,106,79,0.12)] bg-[rgba(255,252,247,0.86)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#2d6a4f] shadow-[0_14px_28px_rgba(33,48,43,0.06)]">
                <OrganicTree className="h-5 w-4" />
                Madrid caminado con criterio climático
              </div>
              <h1 className="hero-title-serif fade-in-up mb-4 max-w-5xl text-[clamp(3rem,4.3vw,4.5rem)] text-[var(--ds-black)]">
                Camina por Madrid con menos calor
              </h1>
              <p className="fade-in-up mb-0 max-w-4xl text-base font-semibold leading-[1.65] text-[var(--ds-gray-500)] sm:text-lg">
                Calcula tu ruta a pie evitando el sol directo. Comparamos el trayecto directo con una alternativa más fresca usando sombra real de edificios, arbolado urbano y refugios climáticos.
              </p>
              <div className="fade-in-up mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[var(--ds-gray-600)]">
                <span className="hero-chip">Sombra urbana real</span>
                <span className="hero-chip">Comparación inmediata</span>
                <span className="hero-chip">Recursos climáticos en ruta</span>
              </div>
            </div>

            <div className="hero-art-shell hero-art-stage fade-in-up hidden lg:block" aria-hidden="true">
              <HeroClimateArt className="h-full w-full" />
            </div>
          </div>

          <div className="fade-in-up mt-5">
            <RoutingSection />
          </div>
        </section>
      </div>

      {/* Secondary content — below the fold */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <section className="section-shell mb-16 rounded-[32px] p-6 fade-in-up sm:p-8">
          <p className="editorial-kicker text-[var(--ds-gray-500)] mb-3">Como funciona</p>
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-6">Una herramienta principal, tres pasos claros</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.step} level={1} className="rounded-[24px] border border-[rgba(91,84,74,0.08)] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gray-400)]">{step.step}</span>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${step.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-base font-semibold text-[var(--ds-black)] mb-2">{step.title}</p>
                  <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">{step.detail}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-16 fade-in-up">
          <div className="section-shell rounded-[32px] p-6 sm:p-8">
            <p className="editorial-kicker text-[var(--ds-gray-500)] mb-3">Por que es distinto</p>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start">
              <div>
                <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">El calor deja de ser contexto y pasa a ser variable de ruta</h2>
                <div className="max-w-3xl space-y-4 text-[var(--ds-gray-600)] leading-relaxed">
                  <p>
                    Madrid Refugio no es solo un mapa de refugios ni un visor climático. Es una herramienta operativa que reutiliza datos abiertos del Ayuntamiento para ayudarte a caminar por Madrid con menos calor.
                  </p>
                  <p>
                    Calcula rutas concretas, compara alternativas y muestra los recursos disponibles a lo largo del camino para convertir información urbana compleja en una decisión útil.
                  </p>
                </div>
              </div>
              <div className="rounded-[28px] border border-[rgba(45,106,79,0.12)] bg-[linear-gradient(180deg,rgba(245,252,248,0.96),rgba(233,245,238,0.88))] p-5 shadow-[0_18px_40px_rgba(36,53,65,0.06)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2d6a4f]">En una frase</p>
                <p className="mt-3 text-[1.6rem] font-semibold leading-tight text-[var(--ds-black)]">Una capa climática encima del gesto más cotidiano: caminar.</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ds-gray-600)]">No pide aprender un visor complejo. Pide elegir mejor un trayecto cuando el sol castiga.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-[#2d6a4f] shadow-[0_10px_22px_rgba(31,26,23,0.05)]">
                  <OrganicTree className="h-5 w-4" /> Decisión peatonal con criterio climático
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {valuePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} level={1} className="rounded-[24px] border border-[rgba(91,84,74,0.08)] p-5">
                    <span data-testid={pillar.testId} className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[14px] ${pillar.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-bold text-[var(--ds-black)]">{pillar.title}</h3>
                    <p className="mt-2 text-sm text-[var(--ds-gray-600)] leading-relaxed">{pillar.detail}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Diagnóstico urbano (Insights) */}
        <div className="mb-12 border-b border-[var(--ds-gray-100)] pb-6 fade-in-up">
          <p className="editorial-kicker text-[var(--ds-gray-500)] mb-3">Lectura territorial</p>
          <h2 className="sub-heading-large text-[var(--ds-black)]">Diagnóstico urbano</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-24 stagger-children">
          <Card level={1} className="p-5 border-l-4 border-l-[#ff5b4f] bg-[#fef2f2]/30 fade-in-up">
            <span className="mono-label text-[var(--ds-gray-500)] mb-2 block">Extremo Sur</span>
            <p className="text-sm text-[var(--ds-black)] font-medium">Villaverde presenta la mayor criticidad climática, con un <span className="font-bold">Índice de Prioridad de Intervención de <CountUp key={`c2-${clickStamp}`} end={1} decimals={2} /></span>, cruzando población mayor y déficit de sombras.</p>
          </Card>
          <Card level={1} className="p-5 border-l-4 border-l-[#0a72ef] bg-[#ebf5ff]/30 fade-in-up">
              <span className="mono-label text-[var(--ds-gray-500)] mb-2 block">Déficit de proximidad</span>
             <p className="text-sm text-[var(--ds-black)] font-medium"><span className="font-bold">64,1% de los barrios</span> de Madrid no cuentan con un refugio climático operativo a menos de 300 metros caminables.</p>
          </Card>
          <Card level={1} className="p-5 border-l-4 border-l-[#16a34a] bg-[#f0fdf4]/30 fade-in-up">
              <span className="mono-label text-[var(--ds-gray-500)] mb-2 block">Rutas optimizadas</span>
             <p className="text-sm text-[var(--ds-black)] font-medium">Desviarse apenas <span className="font-bold">un 4,3% más de distancia</span> permite multiplicar por <span className="font-bold">5,4 la sombra acumulada</span> combinando arbolado y proyección geométrica de edificios.</p>
          </Card>
        </div>

        {/* Map and Detail Section */}
        <section className="section-shell mb-24 rounded-[32px] p-5 fade-in-up sm:p-6">
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--ds-gray-100)] pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="editorial-kicker text-[var(--ds-gray-500)] mb-3">Mapa de intervencion</p>
              <h2 className="sub-heading-large text-[var(--ds-black)]">Análisis de vulnerabilidad territorial</h2>
              <p className="text-[var(--ds-gray-600)] mt-2 max-w-2xl">Identificación de barrios prioritarios para la intervención climática, con el selector integrado en el propio bloque del mapa.</p>
            </div>

            <div className="flex flex-col gap-2 lg:items-end">
              <div className="flex bg-[var(--ds-gray-50)] p-1 rounded-xl border border-[var(--ds-gray-100)] shadow-sm">
                <button 
                  onClick={() => setViewMode('vulnerability')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${viewMode === 'vulnerability' ? 'bg-white text-[var(--ds-black)] shadow-sm' : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'}`}
                >
                  Vulnerabilidad general
                </button>
                <button 
                  onClick={() => setViewMode('shelter_deficit')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${viewMode === 'shelter_deficit' ? 'bg-white text-[var(--ds-black)] shadow-sm' : 'text-[var(--ds-gray-500)] hover:text-[var(--ds-black)]'}`}
                >
                  Déficit de refugios
                </button>
              </div>
              <p className="max-w-[420px] text-sm text-[var(--ds-gray-500)]">
                {viewMode === 'vulnerability' 
                  ? "Índice compuesto: temperatura superficial + % mayores de 65 + cobertura de arbolado. Rojo intenso = intervención urgente."
                  : "Barrios donde la distancia media al refugio más cercano supera 500m. A mayor déficit, mayor riesgo para población vulnerable."}
              </p>
            </div>
          </div>
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="md:col-span-2 h-[500px] md:h-[750px]">
          <MapComponent
              mergedData={mergedData}
              refugios={null}
              fuentes={null}
              onBarrioSelect={handleBarrioSelect}
              routeResult={null}
              flyTarget={flyTarget}
              viewMode={viewMode}
            />
          </div>
          
          <div className="h-[600px] md:h-[750px] flex flex-col min-h-0">
            <Card level={3} className="flex-1 p-6 flex flex-col relative overflow-y-auto min-h-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0a72ef] via-[#de1d8d] to-[#ff5b4f]" />

              {selectedBarrio && barrioStats ? (() => {
                const score = barrioStats.priority_score_norm || 0;
                const ranking = getBarrioRanking(selectedBarrio);
                const no2 = barrioStats.no2_medio;
                const no2OverOMS = no2 && no2 > 10;   // OMS annual guideline (2021)
                const no2OverUE  = no2 && no2 > 40;   // EU/Madrid legal limit
                const no2NearUE  = no2 && no2 > 35;   // warning zone near legal limit
                const refugiosCount = barrioStats.refugios_400m ?? 0;
                const urgencyLabel = score > 0.8 ? '🔴 Urgencia Alta' : score > 0.5 ? '🟠 Urgencia Media' : '🟢 Urgencia Baja';

                return (
                  <>
                    {/* Header: back + name + urgency badge */}
                    <button
                      onClick={() => { setSelectedBarrio(null); setBarrioStats(null); }}
                      className="flex items-center gap-1 text-xs text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] mb-3 transition-colors"
                    >
                      ← Ranking
                    </button>
                    <div className="flex justify-between items-start mb-5">
                      <h3 className="card-title text-[var(--ds-black)] leading-tight">{selectedBarrio}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)] whitespace-nowrap ml-2">{urgencyLabel}</span>
                    </div>

                    <div className="space-y-5 flex-1">
                      {/* Priority bar */}
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-medium text-[var(--ds-gray-600)]">Índice de Prioridad</span>
                          <span className="font-mono font-semibold text-[var(--ds-black)] text-sm">{score.toFixed(3).replace('.', ',')} / 1,00</span>
                        </div>
                        <div className="w-full bg-[var(--ds-gray-100)] h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(100, score * 100)}%`,
                              background: score > 0.8 ? '#a50026' : score > 0.5 ? '#f46d43' : '#1a9850'
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Population */}
                        <div className="p-3 rounded-md bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)]">
                          <span className="block text-xs text-[var(--ds-gray-500)] mb-0.5">Población &gt;65</span>
                          <span className="block font-semibold text-[var(--ds-black)] text-sm">{barrioStats.pop_65plus?.toLocaleString('es-ES')} personas</span>
                        </div>

                        {/* NO₂ — dual threshold: OMS 10 µg/m³ / UE 40 µg/m³ */}
                        <div className={`p-3 rounded-md border col-span-2 ${no2NearUE ? 'bg-[#fff7ed] border-[#fed7aa]' : 'bg-[var(--ds-gray-50)] border-[var(--ds-gray-100)]'}`}>
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="text-xs text-[var(--ds-gray-500)]">NO₂ medio</span>
                            <span className="font-mono font-semibold text-sm text-[var(--ds-black)]">{no2?.toFixed(1).replace('.', ',')} µg/m³</span>
                          </div>
                          {/* Visual bar: 0–40 µg/m³ scale */}
                          <div className="relative w-full h-2 bg-[var(--ds-gray-100)] rounded-full overflow-visible mb-2">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.min(100, ((no2 || 0) / 40) * 100)}%`,
                                background: no2OverUE ? '#dc2626' : no2NearUE ? '#f97316' : '#eab308'
                              }}
                            />
                            {/* OMS marker at 10/40 = 25% */}
                            <div className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-[#dc2626]/60" style={{ left: '25%' }} title="Límite OMS" />
                          </div>
                          <div className="flex justify-between text-xs mt-1 gap-2">
                            <span className={`flex items-center gap-1 ${no2OverOMS ? 'text-[#991b1b]' : 'text-[#16a34a]'}`}>
                              {no2OverOMS ? '⚠' : '✓'} OMS: 10 µg/m³ {no2OverOMS ? '— superado' : '— OK'}
                            </span>
                            <span className={`flex items-center gap-1 ${no2OverUE ? 'text-[#991b1b]' : 'text-[var(--ds-gray-500)]'}`}>
                              {no2OverUE ? '⚠' : '✓'} UE: 40 µg/m³ {no2OverUE ? '— superado' : '— OK'}
                            </span>
                          </div>
                        </div>

                        {/* Fuentes */}
                        <div className="p-3 rounded-md bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)]">
                          <span className="block text-xs text-[var(--ds-gray-500)] mb-0.5">Fuentes a 400m</span>
                          <span className="block font-semibold text-[var(--ds-black)] text-sm">{barrioStats.fuentes_400m ?? '—'}</span>
                        </div>

                        {/* Refugios with Madrid average */}
                        <div className={`p-3 rounded-md border ${refugiosCount < 2 ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[var(--ds-gray-50)] border-[var(--ds-gray-100)]'}`}>
                          <span className="block text-xs text-[var(--ds-gray-500)] mb-0.5">Refugios a 400m</span>
                          <span className={`block font-semibold text-sm ${refugiosCount < 2 ? 'text-[#991b1b]' : 'text-[var(--ds-black)]'}`}>
                            {refugiosCount} {refugiosCount < 2 && '⚠'}
                          </span>
                          <span className="block text-xs text-[var(--ds-gray-500)] mt-0.5">Media Madrid: 1,4</span>
                        </div>
                      </div>

                      {/* Radar Chart for Vulnerability Profile */}
                      <div className="mt-4 p-3 rounded-xl bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)]">
                        <span className="block text-xs font-semibold text-[var(--ds-black)] mb-2 text-center">Perfil de Vulnerabilidad Climática</span>
                        <div className="h-[220px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                              { subject: 'Mayores >65', value: Math.min(100, ((barrioStats.pop_65plus || 0) / 12000) * 100) },
                              { subject: 'Calor (LST)', value: Math.max(0, Math.min(100, (((barrioStats.LST_mean || 38) - 35) / 10) * 100)) },
                              { subject: 'Contaminación', value: Math.min(100, ((no2 || 0) / 40) * 100) },
                              { subject: 'Falta Refugios', value: Math.max(0, 100 - ((refugiosCount || 0) / 4) * 100) },
                              { subject: 'Falta Fuentes', value: Math.max(0, 100 - ((barrioStats.fuentes_400m || 0) / 15) * 100) },
                            ]}>
                              <PolarGrid stroke="#e5e5e5" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: '#737373', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                              <Radar name="Vulnerabilidad" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-center text-[var(--ds-gray-400)] mt-1">Mayor área = Mayor necesidad de intervención</p>
                      </div>

                      {/* Ranking */}
                      {ranking && (
                        <div className="flex items-center justify-between py-3 border-t border-[var(--ds-gray-100)]">
                          <span className="text-xs text-[var(--ds-gray-500)]">Posición en el ranking</span>
                          <span className="font-mono font-semibold text-[var(--ds-black)] text-sm">
                            #{ranking} de {mergedData.features.length} barrios
                          </span>
                        </div>
                      )}
                    </div>

                    {/* flyTo button */}
                    <button
                      onClick={() => {
                        const centroid = getBarrioCentroid(selectedBarrio);
                        if (centroid) setFlyTarget({ ...centroid, lat: centroid.lat + Math.random() * 0.00001 }); // tiny nudge forces effect re-run
                      }}
                      className="mt-4 w-full py-2 text-sm font-medium rounded-md border border-[var(--ds-gray-100)] text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-50)] hover:text-[var(--ds-black)] transition-colors"
                    >
                      Centrar mapa en {selectedBarrio} →
                    </button>
                  </>
                );
              })() : (
                /* ── Default state: Top 10 ranking ── */
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h4 className="font-semibold text-[var(--ds-black)] text-sm">Top 10 · Prioridad de intervención</h4>
                    <p className="text-xs text-[var(--ds-gray-500)] mt-0.5">Vulnerabilidad térmica climática. Click para ver detalle.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
                    {top10PanelState === 'loading' ? (
                      <div className="flex items-center justify-center h-full text-[var(--ds-gray-400)] text-sm">
                        <Navigation className="w-5 h-5 mr-2 opacity-50" /> Cargando datos...
                      </div>
                    ) : top10PanelState === 'error' ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <p className="text-sm font-medium text-[var(--ds-black)]">{mergedDataError}</p>
                        <p className="text-xs text-[var(--ds-gray-500)] mt-2">Reintenta la carga para recuperar el ranking y el mapa territorial.</p>
                        <Button variant="primary" className="mt-4 h-9 px-4 text-sm" onClick={() => void loadMergedData()}>
                          Reintentar carga
                        </Button>
                      </div>
                    ) : (
                      top10.map((f: any, i: number) => {
                        const s = f.properties.priority_score_norm || 0;
                        const barColor = s > 0.8 ? '#a50026' : s > 0.5 ? '#f46d43' : '#1a9850';
                        return (
                          <button
                            key={f.properties.NOMBRE}
                            onClick={() => selectBarrioAndFly(f.properties.NOMBRE)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--ds-gray-50)] border border-transparent hover:border-[var(--ds-gray-100)] transition-all group"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-xs text-[var(--ds-gray-400)] w-5 shrink-0">#{i + 1}</span>
                              <span className="text-sm font-medium text-[var(--ds-black)] truncate flex-1 group-hover:text-[#0a72ef] transition-colors">
                                {f.properties.NOMBRE}
                              </span>
                              <span className="font-mono text-xs text-[var(--ds-gray-600)] shrink-0">{s.toFixed(3).replace('.', ',')}</span>
                            </div>
                            {/* Mini progress bar */}
                            <div className="ml-7 w-full h-1 bg-[var(--ds-gray-100)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(100, s * 100)}%`, background: barColor }}
                              />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <p className="text-xs text-[var(--ds-gray-400)] mt-3 pt-3 border-t border-[var(--ds-gray-100)] text-center">
                    Haz clic en el mapa o en el ranking para ver el perfil completo
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
        </section>

        <section className="section-shell mb-16 rounded-[32px] p-6 fade-in-up sm:p-8">
          <p className="editorial-kicker text-[var(--ds-gray-500)] mb-3">Metodologia</p>
          <h2 className="sub-heading-large text-[var(--ds-black)] mb-4">Metodología</h2>
          <div className="max-w-3xl mb-6 text-[var(--ds-gray-600)] leading-relaxed">
            <p>Madrid Refugio reutiliza datos abiertos del Ayuntamiento de Madrid para estimar el confort de una ruta peatonal tramo a tramo.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card level={1} className="p-5">
              <p className="text-sm font-semibold text-[var(--ds-black)] mb-2">1. Integramos capas urbanas oficiales</p>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Combinamos información geoespacial sobre el callejero oficial, arbolado, edificios, fuentes y refugios climáticos para construir una base única de análisis peatonal.</p>
            </Card>
            <Card level={1} className="p-5">
              <p className="text-sm font-semibold text-[var(--ds-black)] mb-2">2. Estimamos la sombra disponible</p>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Calculamos la exposición solar de cada tramo usando sombra urbana derivada de edificios y arbolado, con apoyo de datos LiDAR e inventario municipal.</p>
            </Card>
            <Card level={1} className="p-5">
              <p className="text-sm font-semibold text-[var(--ds-black)] mb-2">3. Evaluamos el recorrido</p>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Para cada trayecto, comparamos una ruta directa con una alternativa Eco-Refugio incorporando sombra, recursos próximos y confort térmico.</p>
            </Card>
            <Card level={1} className="p-5">
              <p className="text-sm font-semibold text-[var(--ds-black)] mb-2">4. Devolvemos una decisión útil</p>
              <p className="text-sm text-[var(--ds-gray-600)] leading-relaxed">Presentamos el resultado como minutaje concreto de exposición evitada y recursos disponibles en el camino, no como análisis territorial.</p>
            </Card>
          </div>
        </section>

        <section className="section-shell mb-24 rounded-[32px] p-6 fade-in-up sm:p-8">
          <div className="mb-8 grid gap-6 border-b border-[var(--ds-gray-100)] pb-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div>
              <p className="editorial-kicker text-[var(--ds-gray-500)] mb-3">Trazabilidad publica</p>
              <h2 className="sub-heading-large text-[var(--ds-black)]">Fuentes de datos abiertos</h2>
              <p className="text-[var(--ds-gray-600)] mt-2">Los enlaces de esta sección abren la ficha oficial de cada fuente para consultar metadatos, licencia y opciones de descarga.</p>
              <p className="text-[var(--ds-gray-600)] mt-2">No existe un dataset municipal operativo de refugios climáticos oficiales; por eso la capa de sustitución usa bibliotecas, centros culturales y polideportivos con trazabilidad explícita.</p>
            </div>
            <div className="rounded-[24px] border border-[rgba(91,84,74,0.08)] bg-[rgba(255,253,250,0.88)] p-5 shadow-[0_12px_28px_rgba(31,26,23,0.05)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">Criterio de publicación</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ds-gray-600)]">Si una URL oficial pública estable no está verificada, la fuente se mantiene como referencia informativa sin enlace activo.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sourceCards.map((src) => {
            const cardClassName = `fade-in-up rounded-[24px] border border-[rgba(91,84,74,0.08)] bg-[rgba(255,253,250,0.8)] p-5 transition-all group block shadow-[0_12px_28px_rgba(31,26,23,0.05)] ${src.href ? "hover:-translate-y-[2px] hover:border-[var(--ds-gray-400)] hover:shadow-[0_20px_40px_rgba(31,26,23,0.09)]" : "opacity-90"}`;

            const content = (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px]" style={{ background: `${src.color}12` }}>
                    <src.icon className="w-4.5 h-4.5" style={{ color: src.color }} />
                  </div>
                  <span className="rounded-full bg-[rgba(17,24,39,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-gray-500)]">
                    {src.href ? "Ficha oficial" : "Referencia"}
                  </span>
                </div>
                <p className="text-base font-semibold text-[var(--ds-black)] mb-1 leading-tight">{src.label}</p>
                <p className="text-sm text-[var(--ds-gray-500)] leading-relaxed">{src.detail}</p>
              </>
            );

            return src.href ? (
              <a key={src.label} href={src.href} target="_blank" rel="noopener noreferrer" className={cardClassName}>
                {content}
              </a>
            ) : (
              <div key={src.label} className={cardClassName}>
                {content}
              </div>
            );
          })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 pb-12">
          <div className="rounded-[28px] border border-[rgba(91,84,74,0.08)] bg-[linear-gradient(180deg,rgba(255,253,250,0.94),rgba(248,250,249,0.9))] p-6 shadow-[0_18px_42px_rgba(36,53,65,0.05)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,242,233,0.92))] shadow-[0_10px_22px_rgba(33,48,43,0.08)] ring-1 ring-[rgba(91,84,74,0.08)]">
                    <AlcalaLogo className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ds-black)]">Madrid Refugio</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gray-500)]">Planificador peatonal climático</p>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ds-gray-600)]">
                  Proyecto demostrador que convierte datos abiertos urbanos en una decisión peatonal más segura durante episodios de calor en Madrid.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ds-gray-500)]">
                  <span className="rounded-full border border-[rgba(91,84,74,0.08)] bg-white/80 px-3 py-1.5">Datos abiertos municipales</span>
                  <span className="rounded-full border border-[rgba(91,84,74,0.08)] bg-white/80 px-3 py-1.5">Metodología trazable</span>
                  <span className="rounded-full border border-[rgba(91,84,74,0.08)] bg-white/80 px-3 py-1.5">Madrid 2026</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-[var(--ds-gray-600)] lg:items-end">
                <Link href="/metodologia" className="font-medium transition-colors hover:text-[var(--ds-black)]">Metodología</Link>
                <a href="https://datos.madrid.es/pages/premios-de-reutilizacion-2026" target="_blank" rel="noopener noreferrer" className="font-medium transition-colors hover:text-[var(--ds-black)]">Premios de reutilización</a>
                <a href="https://datos.madrid.es/portal/site/egob" target="_blank" rel="noopener noreferrer" className="font-medium transition-colors hover:text-[var(--ds-black)]">Portal datos.madrid.es</a>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-[var(--ds-gray-100)] pt-4 text-xs text-[var(--ds-gray-500)] sm:flex-row sm:items-center sm:justify-between">
              <span>&copy; 2026 Madrid Refugio. Datos Abiertos del Ayuntamiento de Madrid.</span>
              <span>Herramienta de rutas peatonales con criterio climático y trazabilidad pública.</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
