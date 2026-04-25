"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { AlertTriangle, Download, Play, Pause, MapPin, Clock3, ThermometerSun, ArrowRight } from "lucide-react";
import { SearchBar, type ResolvedLocation, type SearchBarState } from "./SearchBar";
import { getApiBaseUrl } from "@/lib/search-source";
import { ClimateRouteBadge, ClimateShelterIcon, MadridHeatmapMiniArt, MadridShelterBuildingArt, OrganicTree, TreeBenchArt, WaterFountainIcon } from "./branding/HomeVisuals";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--ds-gray-50)] rounded-xl flex items-center justify-center text-[var(--ds-gray-500)] text-sm animate-pulse">
      Cargando mapa...
    </div>
  ),
});

const STORAGE_KEY = "madrid-refugio-preference";
const RESULT_PREFERENCE_OPTIONS = [
  { value: 0.0, label: "Directa", actionLabel: "Mostrar ruta directa", detail: "La más rápida" },
  { value: 0.5, label: "Equilibrada", actionLabel: "Mostrar ruta equilibrada", detail: "Buen balance" },
  { value: 1.0, label: "Más sombra", actionLabel: "Mostrar ruta con más sombra", detail: "Mayor protección" },
] as const;
const OFFICIAL_HEAT_GUIDANCE_URL = "https://www.comunidad.madrid/servicios/salud/calor-salud";

function normalizePreference(val: number): number {
  const options = [0, 0.5, 1];
  return options.reduce((closest, option) =>
    Math.abs(option - val) < Math.abs(closest - val) ? option : closest
  , 0.5);
}

function loadSavedPreference(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val !== null) return normalizePreference(parseFloat(val));
  } catch { /* ignore */ }
  return null;
}

function savePreference(val: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(normalizePreference(val)));
  } catch { /* ignore */ }
}

interface RoutingSectionProps {
  onRouteCalculated?: (result: any) => void;
  autoDemo?: boolean;
}

const DEMO_ROUTE: SearchBarState = {
  origin: {
    label: "Plaza Mayor, Madrid",
    kind: "place",
    lat: 40.4155,
    lon: -3.7074,
  },
  destination: {
    label: "Museo del Prado, Madrid",
    kind: "place",
    lat: 40.4138,
    lon: -3.6921,
  },
  hour: 14,
  preference: 1,
  useMyLocation: false,
};

export function RoutingSection({ onRouteCalculated, autoDemo = false }: RoutingSectionProps) {
  const [origin, setOrigin] = useState<ResolvedLocation | null>(null);
  const [destination, setDestination] = useState<ResolvedLocation | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [hour, setHour] = useState(() => {
    const now = new Date().getHours();
    return Math.max(8, Math.min(20, now));
  });
  const [preference, setPreference] = useState(() => loadSavedPreference() ?? 0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const lastPlaybackHourRef = useRef<number | null>(null);
  const autoDemoStartedRef = useRef(false);

  const formatSunSaved = (minutes: number | null | undefined) => (minutes == null ? "—" : `${minutes} min`);
  const formatExtraEffort = (minutes: number | null | undefined) => {
    if (minutes == null) return "—";
    if (minutes === 0) return "0 min";
    return `+${minutes} min`;
  };
  const comfortMinutes = routeResult ? Math.max(1, Math.round(routeResult.metrics.comfort.length / 83.33)) : null;
  const comfortLengthKm = routeResult ? (routeResult.metrics.comfort.length / 1000).toFixed(1) : null;
  const shortestLengthKm = routeResult ? (routeResult.metrics.shortest.length / 1000).toFixed(1) : null;
  const shortestShadeMeters = routeResult ? (routeResult.metrics.shortest.tree_shade + routeResult.metrics.shortest.building_shade) : null;
  const comfortShadeMeters = routeResult ? (routeResult.metrics.comfort.tree_shade + routeResult.metrics.comfort.building_shade) : null;
  const shadeCoverage = routeResult && routeResult.metrics.comfort.length > 0
    ? Math.min(100, Math.round((comfortShadeMeters! / routeResult.metrics.comfort.length) * 100))
    : null;
  const estimatedCooling = routeResult
    ? Math.max(1.2, Math.min(4.8, (routeResult.metrics.human.sun_time_saved_min || 0) / 3.75)).toFixed(1).replace('.', ',')
    : null;
  const shadeMetersLabel = comfortShadeMeters != null ? comfortShadeMeters.toLocaleString("es-ES") : "—";
  const routeHourLabel = `Hoy a las ${String(hour).padStart(2, "0")}:00`;
  const isLongRoute = routeResult ? Number(comfortLengthKm) > 8 || (comfortMinutes ?? 0) > 90 : false;
  const adviceText = hour >= 17
    ? "Haz la ultima parada en una plaza arbolada o refugio antes del tramo final: el asfalto retiene calor incluso al caer la tarde."
    : hour >= 12
      ? "Si sales en hora critica, reserva una pausa corta cada 10-15 minutos en sombra o junto a una fuente para bajar pulsaciones."
      : "Aprovecha las primeras horas para llenar agua y cubrir los tramos mas abiertos antes de que suba la temperatura.";

  useEffect(() => {
    if (!routeResult) return;

    setAnimateResults(true);
    const timer = window.setTimeout(() => setAnimateResults(false), 360);
    return () => window.clearTimeout(timer);
  }, [routeResult]);

  useEffect(() => {
    const savedPreference = loadSavedPreference();
    if (savedPreference !== null) {
      setPreference(savedPreference);
    }
    const now = new Date().getHours();
    setHour(Math.max(8, Math.min(20, now)));
  }, []);

  // Time slider automation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setHour(prev => prev >= 20 ? 8 : prev + 1);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto-calculate route when hour changes during playback
  useEffect(() => {
    if (!isPlaying) {
      lastPlaybackHourRef.current = null;
      return;
    }

    if (!hasSearched || !origin || !destination) {
      return;
    }

    if (lastPlaybackHourRef.current === null) {
      lastPlaybackHourRef.current = hour;
      return;
    }

    if (lastPlaybackHourRef.current === hour) {
      return;
    }

    lastPlaybackHourRef.current = hour;
    doCalculate(origin, destination, hour, preference);
  }, [hour, isPlaying, hasSearched, origin, destination, preference]);

  const isHeatHour = hour >= 12 && hour <= 17;

  const handleSearch = useCallback((state: SearchBarState) => {
    setOrigin(state.origin);
    setDestination(state.destination);
    setUseMyLocation(state.useMyLocation);
    setHour(state.hour);
    setPreference(state.preference);
    savePreference(state.preference);

    doCalculate(state.origin, state.destination, state.hour, state.preference);
  }, []);

  useEffect(() => {
    if (!autoDemo || autoDemoStartedRef.current || hasSearched || loading) {
      return;
    }

    autoDemoStartedRef.current = true;
    setDemoLoaded(true);
    handleSearch(DEMO_ROUTE);
  }, [autoDemo, hasSearched, loading, handleSearch]);

  const doCalculate = async (originVal: ResolvedLocation, destVal: ResolvedLocation, hourVal: number, prefVal: number) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: originVal, destination: destVal, hour: hourVal, preference: prefVal }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error calculando la ruta");
      }

      const data = await response.json();
      setRouteResult(data);
      onRouteCalculated?.(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceRefresh = useCallback((nextPreference: number) => {
    if (!origin || !destination || nextPreference === preference) {
      return;
    }

    setPreference(nextPreference);
    savePreference(nextPreference);
    doCalculate(origin, destination, hour, nextPreference);
  }, [destination, hour, origin, preference]);

  const handleDownloadGPX = () => {
    if (!routeResult?.comfort_coords) {
      alert("Primero debes calcular una ruta para descargar el GPX.");
      return;
    }
    const gpxPoints = routeResult.comfort_coords
      .map((c: number[]) => `    <trkpt lat="${c[0]}" lon="${c[1]}"></trkpt>`)
      .join("\n");
    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Madrid Refugio">
  <trk>
    <name>Ruta Climática Eco-Refugio</name>
    <trkseg>
${gpxPoints}
    </trkseg>
  </trk>
</gpx>`;
    const blob = new Blob([gpxData], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ruta_madrid_refugio.gpx";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-10 sm:mb-12">
      <div className="mb-8">
        {demoLoaded && !useMyLocation && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-[24px] border border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(220,252,231,0.82))] px-4 py-3 text-left shadow-[0_10px_24px_rgba(22,163,74,0.10)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Ejemplo cargado</p>
              <p className="text-sm font-medium text-emerald-900">Hemos precargado una ruta Plaza Mayor → Museo del Prado a las 14:00 para mostrar el valor del producto desde el primer momento.</p>
            </div>
          </div>
        )}
        <SearchBar
          onSearch={handleSearch}
          initialState={{
            origin: origin ?? undefined,
            destination: destination ?? undefined,
            hour,
            preference,
            useMyLocation,
          }}
          loading={loading}
          footerNotice={isHeatHour && hasSearched ? (
            <div className="flex items-start gap-3 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,247,237,0.98),rgba(255,237,213,0.88))] px-4 py-3 shadow-[0_10px_24px_rgba(249,115,22,0.10)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
              <div>
                <p className="text-xs font-bold text-orange-800">Calor Extremo a las {hour}:00</p>
                <p className="text-xs text-orange-700">La Ruta Refugio es prioritaria para minimizar el riesgo de golpe de calor.</p>
              </div>
            </div>
          ) : null}
        />
      </div>

      {/* Simulate day control — only after search */}
      {hasSearched && (
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${isPlaying ? 'bg-red-500 text-white shadow-[0_12px_20px_rgba(239,68,68,0.24)]' : 'bg-[rgba(255,253,250,0.92)] text-[var(--ds-black)] shadow-[0_10px_20px_rgba(31,26,23,0.08)] hover:bg-white'}`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? "DETENER SIMULACIÓN" : "SIMULAR DÍA"}
          </button>
          {isPlaying && (
            <span className="text-xs text-[var(--ds-gray-500)]">
              Hora actual: {hour}:00
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-[22px] border border-red-200 bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(254,226,226,0.90))] p-4 text-sm font-medium text-red-700 shadow-[0_10px_24px_rgba(239,68,68,0.08)]">
          ⚠ {error}
        </div>
      )}

      {/* Map + Results — only after search */}
      {hasSearched && routeResult && (
        <div className="space-y-6">
          {/* Map */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(91,84,74,0.08)] bg-[rgba(255,255,255,0.9)] shadow-[0_24px_54px_rgba(31,26,23,0.08)]">
              <div className="h-[500px] md:h-[600px] overflow-hidden border-b border-[var(--ds-gray-100)]">
                <MapComponent
                  mergedData={null}
                  refugios={null}
                  fuentes={null}
                  onBarrioSelect={() => {}}
                  routeResult={routeResult}
                  showHeatmap={showHeatmap}
                  showAreaLegend={false}
                />
              </div>

              <div className={`grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6 ${loading ? "opacity-70" : "opacity-100"} ${animateResults ? "results-refresh" : ""}`}>
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#d4ead7] px-3 py-1 text-xs font-bold text-[#2d6a4f] shadow-[0_10px_18px_rgba(45,106,79,0.12)]">
                      <ClimateRouteBadge className="h-4 w-7" /> Ruta recomendada
                    </span>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ds-gray-500)]">Equilibrada</div>
                  </div>

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(45,106,79,0.12)] bg-[rgba(255,252,247,0.9)] px-3 py-2 text-xs font-semibold text-[#2d6a4f] shadow-[0_10px_22px_rgba(31,26,23,0.05)]">
                    <OrganicTree testId="route-legend-tree" className="h-5 w-4" />
                    Ruta con alivio climático
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Recomendación de ruta calculada">
                    {RESULT_PREFERENCE_OPTIONS.map((option) => {
                      const active = option.value === preference;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={active}
                          aria-label={option.actionLabel}
                          onClick={() => handlePreferenceRefresh(option.value)}
                          className={`rounded-[18px] border px-4 py-2 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 ${active ? "border-[#2d6a4f] bg-[#d4ead7] text-[#2d6a4f] shadow-[0_8px_18px_rgba(45,106,79,0.16)]" : "border-[var(--ds-gray-100)] bg-white text-[var(--ds-gray-600)] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"}`}
                        >
                          <span className="block">{option.label}</span>
                          <span className="block text-[11px] font-medium opacity-70">{option.detail}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 sm:gap-4 sm:grid-cols-3">
                    <Card level={1} className="rounded-[20px] border border-[var(--ds-gray-100)] p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(17,24,39,0.06)] text-[var(--ds-gray-600)]">
                          <Clock3 className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-lg font-bold text-[var(--ds-black)]">{comfortMinutes} min</p>
                          <p className="text-xs text-[var(--ds-gray-500)]">Tiempo estimado</p>
                        </div>
                      </div>
                    </Card>

                    <Card level={1} className="rounded-[20px] border border-[#d4ead7] p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4ead7] text-[#2d6a4f]">
                          <OrganicTree className="h-7 w-5" />
                        </span>
                        <div>
                          <p className="text-lg font-bold text-[#2d6a4f]">{shadeMetersLabel} m</p>
                          <p className="text-xs text-[var(--ds-gray-500)]">Sombra acumulada</p>
                        </div>
                      </div>
                      <div
                        className="mt-3 h-2.5 overflow-hidden rounded-full bg-[rgba(17,24,39,0.08)]"
                        role="progressbar"
                        aria-label="Sombra acumulada relativa al total de la ruta"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={shadeCoverage ?? 0}
                        data-testid="shade-progress"
                      >
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#52b788,#2d6a4f)] transition-[width] duration-700 ease-out"
                          style={{ width: `${shadeCoverage ?? 0}%` }}
                        />
                      </div>
                    </Card>

                    <Card level={1} className="rounded-[20px] border border-[#fdebd0] p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdebd0] text-[#e67e22]">
                          <ThermometerSun className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-lg font-bold text-[#e67e22]">-{estimatedCooling} °C</p>
                          <p className="text-xs text-[var(--ds-gray-500)]">Reducción térmica estimada</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {isLongRoute ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[20px] border border-[rgba(192,57,43,0.18)] bg-[linear-gradient(180deg,rgba(254,242,242,0.98),rgba(254,226,226,0.92))] px-4 py-3 text-sm text-[#8f2d23] shadow-[0_10px_24px_rgba(192,57,43,0.08)]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p className="font-medium">Ruta larga · Considera dividirla en tramos</p>
                    </div>
                  ) : null}

                  <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--ds-gray-100)] bg-[rgba(250,250,248,0.9)]">
                    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] border-b border-[var(--ds-gray-100)] bg-[rgba(238,237,233,0.55)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--ds-gray-400)] sm:px-5">
                      <span>Comparativa</span>
                      <span className="text-center">Directa</span>
                      <span className="text-center text-[#2d6a4f]">Equilibrada</span>
                    </div>
                    <div className="divide-y divide-[var(--ds-gray-100)] text-sm">
                      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center px-4 py-4 sm:px-5">
                        <span className="font-semibold text-[var(--ds-gray-600)]">Longitud</span>
                        <span className="text-center font-medium text-[var(--ds-black)]">{shortestLengthKm} km</span>
                        <span className="text-center font-bold text-[#2d6a4f]">{comfortLengthKm} km</span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center px-4 py-4 sm:px-5">
                        <span className="font-semibold text-[var(--ds-gray-600)]">Sombra total</span>
                        <span className="text-center font-medium text-[var(--ds-black)]">{shortestShadeMeters?.toFixed(0)} m</span>
                        <span className="text-center font-bold text-[#2d6a4f]">{comfortShadeMeters?.toFixed(0)} m</span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center px-4 py-4 sm:px-5">
                        <span className="font-semibold text-[var(--ds-gray-600)]">Fuentes</span>
                        <span className="text-center font-medium text-[var(--ds-black)]">{routeResult.metrics.shortest.fuentes}</span>
                        <span className="text-center font-bold text-[#2d6a4f]">{routeResult.metrics.comfort.fuentes}</span>
                      </div>
                      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center px-4 py-4 sm:px-5">
                        <span className="font-semibold text-[var(--ds-gray-600)]">Refugios</span>
                        <span className="text-center font-medium text-[var(--ds-black)]">{routeResult.metrics.shortest.refugios}</span>
                        <span className="text-center font-bold text-[#2d6a4f]">{routeResult.metrics.comfort.refugios}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="flex flex-col gap-4 rounded-[24px] border border-[var(--ds-gray-100)] bg-[rgba(255,255,255,0.96)] p-5 shadow-[0_10px_24px_rgba(31,26,23,0.05)]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-gray-500)]">Recursos en ruta</p>
                    <h3 className="mt-2 text-[28px] font-semibold leading-none text-[var(--ds-black)]">Equilibrada</h3>
                    <p className="mt-2 text-sm text-[var(--ds-gray-500)]">Buen balance entre tiempo, sombra y acceso a puntos de alivio.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[var(--ds-gray-100)] px-4 py-3">
                      <WaterFountainIcon className="h-5 w-5" />
                      <span className="text-sm text-[var(--ds-gray-500)]">Fuentes de agua</span>
                      <span className="text-base font-bold text-[var(--ds-black)]">{routeResult.metrics.comfort.fuentes}</span>
                    </div>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[var(--ds-gray-100)] px-4 py-3">
                      <ClimateShelterIcon className="h-5 w-5" />
                      <span className="text-sm text-[var(--ds-gray-500)]">Refugios climáticos</span>
                      <span className="text-base font-bold text-[var(--ds-black)]">{routeResult.metrics.comfort.refugios}</span>
                    </div>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[var(--ds-gray-100)] px-4 py-3">
                      <OrganicTree className="h-6 w-5" />
                      <span className="text-sm text-[var(--ds-gray-500)]">Zonas arboladas</span>
                      <span className="text-xs font-semibold text-[var(--ds-gray-500)]">En ruta</span>
                    </div>
                  </div>

                  <Button variant="secondary" onClick={handleDownloadGPX} className="h-11 justify-between rounded-[18px] border-[1.5px] border-[var(--ds-gray-100)] px-4 font-semibold">
                    <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" /> Exportar GPX</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </aside>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card level={1} className="overflow-hidden rounded-[28px] border border-[#d4ead7] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(244,250,245,0.95))] p-5 shadow-[0_14px_32px_rgba(45,106,79,0.08)]">
              <div className="flex h-full items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2d6a4f]">Lugares frescos a tu alrededor</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--ds-black)]">Refugios cercanos</h3>
                  <p className="mt-3 font-serif text-5xl font-semibold leading-none text-[#2d6a4f]">{routeResult.metrics.comfort.refugios}</p>
                  <p className="mt-3 text-sm text-[var(--ds-gray-500)]">La ruta recomendada conecta {routeResult.metrics.comfort.refugios} refugios y {routeResult.metrics.comfort.fuentes} puntos de agua para descansar o recargar.</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2d6a4f]">Ver refugios <ArrowRight className="h-4 w-4" /></p>
                </div>
                <MadridShelterBuildingArt className="h-28 w-28 flex-shrink-0 text-[#2d6a4f]" aria-hidden="true" />
              </div>
            </Card>

            <button
              type="button"
              aria-pressed={showHeatmap}
              aria-label="Ver mapa de calor"
              onClick={() => setShowHeatmap((current) => !current)}
              className={`overflow-hidden rounded-[28px] border p-5 text-left shadow-[0_14px_32px_rgba(230,126,34,0.10)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 ${showHeatmap ? "border-[#e67e22] bg-[linear-gradient(180deg,rgba(255,247,237,0.98),rgba(253,235,208,0.92))]" : "border-[#fdebd0] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(255,247,237,0.96))] hover:border-[#e67e22]"}`}
            >
              <div className="flex h-full items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c26a1b]">Radiación prevista</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--ds-black)]">Mapa de calor</h3>
                  <p className="mt-3 text-sm text-[var(--ds-gray-500)]">{showHeatmap ? "Capa térmica superpuesta" : `El desvio te evita ${formatSunSaved(routeResult.metrics.human.sun_time_saved_min)} de exposición directa al sol en el tramo más duro.`}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#c26a1b]">Ver mapa <ArrowRight className="h-4 w-4" /></p>
                </div>
                <MadridHeatmapMiniArt className="h-28 w-28 flex-shrink-0" aria-hidden="true" />
              </div>
            </button>

            <Card level={1} className="overflow-hidden rounded-[28px] border border-[rgba(45,106,79,0.14)] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(240,247,242,0.95))] p-5 shadow-[0_14px_32px_rgba(45,106,79,0.08)]">
              <div className="flex h-full items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2d6a4f]">{routeHourLabel}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--ds-black)]">Consejo del día</h3>
                  <p className="mt-3 text-sm text-[var(--ds-gray-500)]">{adviceText}</p>
                  <a
                    href={OFFICIAL_HEAT_GUIDANCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Recomendaciones oficiales frente al calor de la Comunidad de Madrid"
                    title="Recomendaciones oficiales frente al calor de la Comunidad de Madrid"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2d6a4f] transition-opacity hover:opacity-80"
                  >
                    Ver más consejos <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <TreeBenchArt className="h-28 w-28 flex-shrink-0" aria-hidden="true" />
              </div>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => { setRouteResult(null); setHasSearched(false); setError(null); setIsPlaying(false); }}
              className="h-10 rounded-full font-bold"
            >
              Nueva búsqueda
            </Button>
            <Button variant="secondary" onClick={handleDownloadGPX} className="h-10 rounded-full font-bold">
              <Download className="w-4 h-4 mr-1.5" /> Exportar GPX
            </Button>
          </div>

          <p className="px-2 mt-4 text-[10px] font-medium leading-relaxed text-[var(--ds-gray-400)]">
            * Cálculos basados en proyección geométrica de edificios (LiDAR) y 661.192 árboles del Inventario Municipal. Velocidad media estimada: 5km/h.
          </p>
        </div>
      )}

      {/* Placeholder map when no search yet */}
      {!hasSearched && (
        <div className="relative h-[220px] overflow-hidden rounded-[28px] border border-[rgba(91,84,74,0.08)] shadow-[0_28px_64px_rgba(31,26,23,0.10)] md:h-[260px]">
          <MapComponent
            mergedData={null}
            refugios={null}
            fuentes={null}
            onBarrioSelect={() => {}}
            routeResult={null}
            showAreaLegend={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none flex items-end justify-center pb-5">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-[var(--ds-gray-400)] mx-auto mb-2" />
              <p className="text-sm text-[var(--ds-gray-500)]">Busca una ruta para ver el mapa interactivo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
