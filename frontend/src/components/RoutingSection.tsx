"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { AlertTriangle, Download, Play, Pause, MapPin } from "lucide-react";
import { SearchBar, type ResolvedLocation, type SearchBarState } from "./SearchBar";
import { getApiBaseUrl } from "@/lib/search-source";

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
  const lastPlaybackHourRef = useRef<number | null>(null);
  const autoDemoStartedRef = useRef(false);

  const formatSunSaved = (minutes: number | null | undefined) => (minutes == null ? "—" : `${minutes} min`);
  const formatExtraEffort = (minutes: number | null | undefined) => {
    if (minutes == null) return "—";
    if (minutes === 0) return "0 min";
    return `+${minutes} min`;
  };

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
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
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
            <div className="rounded-2xl bg-orange-50 px-4 py-3 flex items-start gap-3">
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
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isPlaying ? 'bg-red-500 text-white shadow' : 'bg-[var(--ds-gray-100)] text-[var(--ds-black)] border-[1.5px] border-[#333] hover:bg-[var(--ds-gray-200)]'}`}
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
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 font-medium">
          ⚠ {error}
        </div>
      )}

      {/* Map + Results — only after search */}
      {hasSearched && routeResult && (
        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Map */}
          <div className="md:col-span-2 h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-[var(--ds-gray-100)] shadow-lg">
            <MapComponent
              mergedData={null}
              refugios={null}
              fuentes={null}
              onBarrioSelect={() => {}}
              routeResult={routeResult}
              showAreaLegend={false}
            />
          </div>

          {/* Metrics */}
          <div className="md:col-span-3">
            {/* Health impact */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-orange-600 mb-2">Protección</span>
                <span className="text-3xl font-black text-orange-700">{formatSunSaved(routeResult.metrics.human.sun_time_saved_min)}</span>
                <span className="text-xs font-bold text-orange-600 mt-1">bajo el sol directo</span>
              </div>
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col">
                <span className="text-xs font-bold text-blue-600 mb-2">Esfuerzo</span>
                <span className="text-3xl font-black text-blue-700">{formatExtraEffort(routeResult.metrics.human.extra_effort_min)}</span>
                <span className="text-xs font-bold text-blue-600 mt-1">de caminata adicional</span>
              </div>
            </div>

            {/* Comparison table */}
            <div className="bg-white border border-[var(--ds-gray-100)] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-[var(--ds-gray-100)]">
                  <tr className="bg-[var(--ds-gray-50)] text-[10px] font-black uppercase text-[var(--ds-gray-400)] tracking-widest">
                    <td className="px-6 py-3">Variable</td>
                    <td className="px-6 py-3 text-center">Ruta Directa</td>
                    <td className="px-6 py-3 text-center text-[#16a34a]">Ruta Refugio</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-[var(--ds-gray-600)]">Longitud</td>
                    <td className="px-6 py-4 text-center font-mono">{(routeResult.metrics.shortest.length / 1000).toFixed(1)} km</td>
                    <td className="px-6 py-4 text-center font-mono font-black text-[#16a34a]">{(routeResult.metrics.comfort.length / 1000).toFixed(1)} km</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-[var(--ds-gray-600)]">Sombra Total</td>
                    <td className="px-6 py-4 text-center font-mono">{(routeResult.metrics.shortest.tree_shade + routeResult.metrics.shortest.building_shade).toFixed(0)} m</td>
                    <td className="px-6 py-4 text-center font-mono font-black text-[#16a34a]">{(routeResult.metrics.comfort.tree_shade + routeResult.metrics.comfort.building_shade).toFixed(0)} m</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-[var(--ds-gray-600)]">Fuentes</td>
                    <td className="px-6 py-4 text-center font-mono">{routeResult.metrics.shortest.fuentes}</td>
                    <td className="px-6 py-4 text-center font-mono font-black text-[#16a34a]">{routeResult.metrics.comfort.fuentes}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-[var(--ds-gray-600)]">Refugios</td>
                    <td className="px-6 py-4 text-center font-mono">{routeResult.metrics.shortest.refugios}</td>
                    <td className="px-6 py-4 text-center font-mono font-black text-[#16a34a]">{routeResult.metrics.comfort.refugios}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => { setRouteResult(null); setHasSearched(false); setError(null); setIsPlaying(false); }}
                className="h-10 font-bold"
              >
                Nueva búsqueda
              </Button>
              <Button variant="secondary" onClick={handleDownloadGPX} className="h-10 font-bold">
                <Download className="w-4 h-4 mr-1.5" /> Exportar GPX
              </Button>
            </div>

            <p className="mt-4 text-[10px] text-[var(--ds-gray-400)] font-medium leading-relaxed px-2">
              * Cálculos basados en proyección geométrica de edificios (LiDAR) y 661.192 árboles del Inventario Municipal. Velocidad media estimada: 5km/h.
            </p>
          </div>
        </div>
      )}

      {/* Placeholder map when no search yet */}
      {!hasSearched && (
        <div className="h-[220px] md:h-[260px] rounded-2xl overflow-hidden border border-[var(--ds-gray-100)] shadow-lg relative">
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
