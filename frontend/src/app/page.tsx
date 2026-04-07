"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ThermometerSun, TreePine, Navigation, Map as MapIcon, Activity } from "lucide-react";
import { RoutingSection } from "@/components/RoutingSection";

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
  const [refugios, setRefugios] = useState<any>(null);
  const [fuentes, setFuentes] = useState<any>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<string | null>(null);
  const [barrioStats, setBarrioStats] = useState<any>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lon: number } | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const [clickStamp, setClickStamp] = useState(Date.now());

  useEffect(() => {
    fetch('/data/barrios_merged.geojson').then(res => res.json()).then(setMergedData);
    fetch('/data/refugios_sustitutos.geojson').then(res => res.json()).then(setRefugios);
    fetch('/data/fuentes.geojson').then(res => res.json()).then(setFuentes);
  }, []);

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

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b shadow-[var(--shadow-border)] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ThermometerSun className="w-6 h-6 text-[var(--ds-black)]" />
          <span className="font-sans font-semibold text-[var(--ds-black)] tracking-tight">Madrid Refugio</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 bg-[var(--ds-gray-50)] rounded-md border border-[var(--ds-gray-100)] px-1 py-1 mr-2 shadow-sm">
            <button onClick={() => changeScale(-0.1)} className="px-2 py-0.5 text-xs font-bold text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)] rounded transition-colors" title="Reducir letra">A-</button>
            <div className="w-px h-3 bg-[var(--ds-gray-100)]"></div>
            <button onClick={() => { setFontScale(1); document.documentElement.style.setProperty('--scale', '1'); }} className="px-2 py-0.5 text-xs font-bold text-[var(--ds-gray-600)] hover:text-[var(--ds-black)] transition-colors" title="Restaurar">{(fontScale*100).toFixed(0)}%</button>
            <div className="w-px h-3 bg-[var(--ds-gray-100)]"></div>
            <button onClick={() => changeScale(0.1)} className="px-2 py-0.5 text-sm font-bold text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)] rounded transition-colors" title="Aumentar letra">A+</button>
          </div>
          <Link href="/metodologia"><Button variant="primary" className="hidden sm:inline-flex">Metodología</Button></Link>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-24 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--ds-gray-50)] shadow-[var(--shadow-border)] text-[var(--ds-gray-600)] text-sm font-medium mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Madrid 2026 Data Open
          </div>
          <h1 className="display-hero text-[var(--ds-black)]">
            Protegiendo a la población mayor del calor extremo
          </h1>
          <p className="body-large text-[var(--ds-gray-600)]">
            Madrid Refugio es un motor dinámico de sombras que cruza la altura de los edificios (LiDAR) y la posición del sol con la densidad demográfica. Identificamos la ruta de mayor confort térmico calle a calle.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Button variant="primary" className="h-12 px-6 text-base" onClick={() => document.getElementById("routing")?.scrollIntoView({behavior: "smooth"})}>Explorar Mapa <ArrowRight className="w-4 h-4 ml-2" /></Button>
            <Link href="/metodologia"><Button variant="secondary" className="h-12 px-6 text-base">Leer Metodología</Button></Link>
          </div>
        </div>

        {/* Workflow / Pillars Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <Card level={2} className="p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ebf5ff] flex items-center justify-center text-[#0a72ef] mb-2 shadow-[var(--shadow-border)]">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="card-title text-[var(--ds-black)]">Salud</h3>
            <p className="text-[var(--ds-gray-600)] mb-1">Reducción del estrés térmico en el grupo de mayor mortalidad (Mayores 65+). Protección Activa.</p>
            <span className="text-sm font-semibold text-[#0a72ef] mt-auto">+<CountUp key={`c1-${clickStamp}`} end={432} /> m de sombra acumulada en ruta óptima</span>
          </Card>
          <Card level={2} className="p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#fdf2f8] flex items-center justify-center text-[#de1d8d] mb-2 shadow-[var(--shadow-border)]">
              <TreePine className="w-5 h-5" />
            </div>
            <h3 className="card-title text-[var(--ds-black)]">Clima</h3>
            <p className="text-[var(--ds-gray-600)] mb-1">Optimización de la sombra urbana como activo de salud pública precalculado. Infraestructura Verde.</p>
            <span className="text-sm font-semibold text-[#de1d8d] mt-auto">490.000 polígonos LiDAR procesados</span>
          </Card>
          <Card level={2} className="p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center text-[#ff5b4f] mb-2 shadow-[var(--shadow-border)]">
              <MapIcon className="w-5 h-5" />
            </div>
            <h3 className="card-title text-[var(--ds-black)]">Equidad</h3>
            <p className="text-[var(--ds-gray-600)] mb-1">Intervención prioritaria en barrios con déficit de refugios y alta contaminación. Justicia Térmica.</p>
            <span className="text-sm font-semibold text-[#ff5b4f] mt-auto">64,1% de barrios sin refugio a &lt;300 m</span>
          </Card>
        </div>

        {/* Diagnóstico Urbano (Insights) */}
        <div className="mb-12 border-b border-[var(--ds-gray-100)] pb-6">
          <h2 className="sub-heading-large text-[var(--ds-black)]">Diagnóstico Urbano</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <Card level={1} className="p-5 border-l-4 border-l-[#ff5b4f] bg-[#fef2f2]/30">
            <span className="mono-label text-[var(--ds-gray-500)] mb-2 block">Extremo Sur</span>
            <p className="text-sm text-[var(--ds-black)] font-medium">Villaverde presenta la mayor criticidad climática, con un <span className="font-bold">Índice de Prioridad de Intervención de <CountUp key={`c2-${clickStamp}`} end={1} decimals={2} /></span>, cruzando población mayor y déficit de sombras.</p>
          </Card>
          <Card level={1} className="p-5 border-l-4 border-l-[#0a72ef] bg-[#ebf5ff]/30">
             <span className="mono-label text-[var(--ds-gray-500)] mb-2 block">Déficit de Proximidad</span>
             <p className="text-sm text-[var(--ds-black)] font-medium"><span className="font-bold">64,1% de los barrios</span> de Madrid no cuentan con un refugio climático operativo a menos de 300 metros caminables.</p>
          </Card>
          <Card level={1} className="p-5 border-l-4 border-l-[#16a34a] bg-[#f0fdf4]/30">
             <span className="mono-label text-[var(--ds-gray-500)] mb-2 block">Rutas Optimizadas</span>
             <p className="text-sm text-[var(--ds-black)] font-medium">Desviarse 194 metros permite multiplicar por <span className="font-bold">20 la sombra acumulada</span> combinando arbolado y proyección geométrica de edificios.</p>
          </Card>
        </div>

        <div id="routing">
          <RoutingSection />
        </div>

        {/* Map and Detail Section */}
        <div className="mb-12 border-b border-[var(--ds-gray-100)] pb-6">
          <h2 className="sub-heading-large text-[var(--ds-black)]">Análisis de Vulnerabilidad Territorial</h2>
          <p className="text-[var(--ds-gray-600)] mt-2">Identificación de barrios prioritarios para la intervención climática.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 h-[600px] mb-24">
          <div className="md:col-span-2 h-full">
          <MapComponent
              mergedData={mergedData}
              refugios={null}
              fuentes={null}
              onBarrioSelect={handleBarrioSelect}
              routeResult={null}
              flyTarget={flyTarget}
            />
          </div>
          
          <div className="h-full">
            <Card level={3} className="h-full p-6 flex flex-col relative overflow-y-auto">
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
                          <span className="font-mono font-semibold text-[var(--ds-black)] text-sm">{score.toFixed(3)} / 1,00</span>
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
                            <span className="font-mono font-semibold text-sm text-[var(--ds-black)]">{no2?.toFixed(1)} µg/m³</span>
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
                    <h4 className="font-semibold text-[var(--ds-black)] text-sm">Top 10 · Prioridad de Intervención</h4>
                    <p className="text-xs text-[var(--ds-gray-500)] mt-0.5">Vulnerabilidad térmica climática. Click para ver detalle.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
                    {top10.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-[var(--ds-gray-400)] text-sm">
                        <Navigation className="w-5 h-5 mr-2 opacity-50" /> Cargando datos...
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
                              <span className="font-mono text-xs text-[var(--ds-gray-600)] shrink-0">{s.toFixed(3)}</span>
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

        {/* Footer */}
        <footer className="border-t border-[var(--ds-gray-100)] pt-12 mt-24 pb-12 flex flex-col md:flex-row justify-between items-center text-sm text-[var(--ds-gray-500)]">
          <div>&copy; 2026 Madrid Refugio. Datos Abiertos del Ayuntamiento de Madrid.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/metodologia" className="hover:text-[var(--ds-black)] transition-colors">Metodología</Link>
            <a href="https://datos.madrid.es/pages/premios-de-reutilizacion-2026" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ds-black)] transition-colors">Premios de Reutilización</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
