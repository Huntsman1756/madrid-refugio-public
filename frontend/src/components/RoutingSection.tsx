"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { AlertTriangle } from "lucide-react";

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--ds-gray-50)] rounded-xl flex items-center justify-center text-[var(--ds-gray-500)] text-sm animate-pulse">
      Cargando mapa...
    </div>
  ),
});

interface RoutingSectionProps {
  onRouteCalculated?: (result: any) => void;
}

export function RoutingSection({ onRouteCalculated }: RoutingSectionProps) {
  const [origin, setOrigin] = useState("Calle Marqués de Viana 1, Madrid");
  const [destination, setDestination] = useState("Plaza de Castilla, Madrid");
  const [hour, setHour] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [routeResult, setRouteResult] = useState<any>(null);

  const isHeatHour = hour >= 12 && hour <= 19;

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_BASE}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, hour }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error calculando la ruta");
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setRouteResult(data);       // ← owned locally, so the map rerenders instantly
      onRouteCalculated?.(data);  // ← also notify parent if needed
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
    <div className="mb-24">
      <div className="mb-8 border-b border-[var(--ds-gray-100)] pb-6">
        <h2 className="sub-heading-large text-[var(--ds-black)]">Navegador de Rutas Climáticas</h2>
        <p className="text-[var(--ds-gray-600)] mt-2">Planifica tu trayecto priorizando la sombra y la proximidad a fuentes y refugios.</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e]">
          <span>⚡</span>
          <span><strong>Demo:</strong> Grafo de sombras activo en corredor <strong>Estrecho / Valdeacederas / Plaza de Castilla</strong>. Origen y destino deben estar en esa zona.</span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Map panel — always visible, updates reactively with routeResult */}
        <div className="md:col-span-2 h-[520px] sticky top-24">
          <MapComponent
            mergedData={null}
            refugios={null}
            fuentes={null}
            onBarrioSelect={() => {}}
            routeResult={routeResult}
          />
        </div>

        {/* Form panel */}
        <div className="md:col-span-3 flex flex-col">
          <h3 className="card-title text-[var(--ds-black)] mb-4">Del origen al destino, con confort</h3>
          <p className="text-[var(--ds-gray-600)] mb-4">
            Selecciona tu ubicación inicial y final para obtener una comparativa inmediata validada por datos abiertos:
          </p>
          <ul className="space-y-2 mb-6 text-[var(--ds-gray-600)] text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--ds-gray-400)] flex-shrink-0" />
              <span><strong>Ruta Estándar:</strong> El trayecto más corto posible (basado en distancia pura).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-[#16a34a] flex-shrink-0" />
              <span><strong>Ruta Eco-Refugio:</strong> Recalcula los pesos priorizando calles arboladas y centros de hidratación.</span>
            </li>
          </ul>

          <Card level={2} className="p-6 border border-[var(--ds-gray-100)]">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-[var(--ds-gray-600)] mb-1">
                  Origen
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(pos => {
                          setOrigin(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                        });
                      }
                    }}
                    className="text-xs text-[#0a72ef] hover:underline flex items-center gap-1"
                    title="Usar mi ubicación actual"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                    Ubícame
                  </button>
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--ds-gray-100)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ds-focus-color)] text-[var(--ds-black)] shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ds-gray-600)] mb-1">Destino</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--ds-gray-100)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ds-focus-color)] text-[var(--ds-black)] shadow-sm text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--ds-gray-600)] mb-1">
                Contexto térmico (Hora: {hour}:00)
              </label>
              <input
                type="range"
                min="8" max="20"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-full accent-[var(--ds-black)]"
              />
              <div className="flex justify-between text-xs text-[var(--ds-gray-500)] mt-0.5">
                <span>8:00</span>
                <span>14:00</span>
                <span>20:00</span>
              </div>
            </div>

            {isHeatHour ? (
              <div className="mb-4 p-3 bg-[#fef2f2] text-[#991b1b] rounded-md border border-[#fecaca] flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p><strong>Aviso:</strong> Tramo de máxima insolación. La ruta más fresca es crítica para evitar golpes de calor.</p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-[#f0fdf4] text-[#166534] rounded-md border border-[#bbf7d0] text-sm">
                Tramo de insolación moderada: la ruta óptima sigue priorizando sombra por confort térmico.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                ⚠ {error}
              </div>
            )}

            <p className="text-xs text-[var(--ds-gray-500)] text-center mb-3">
              En el corredor de demo: ruta estándar ~611 m · ruta confort ~806 m · sombra acumulada ×20
            </p>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleCalculate}
              disabled={loading}
            >
              {loading ? "Calculando en grafo urbano..." : "Calcular ruta más fresca"}
            </Button>
          </Card>

          {metrics && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-[var(--ds-black)]">Comparativa de Rutas</h4>
                <Button variant="secondary" onClick={handleDownloadGPX} className="text-xs h-8 py-1">
                  Descargar GPX
                </Button>
              </div>
              <div className="border border-[var(--ds-gray-100)] rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)] border-b border-[var(--ds-gray-100)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Métrica</th>
                      <th className="px-4 py-3 font-medium">Ruta Estándar</th>
                      <th className="px-4 py-3 font-medium text-[#16a34a]">Ruta Refugio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-black)]">
                    <tr>
                      <td className="px-4 py-3">Distancia total</td>
                      <td className="px-4 py-3 font-mono">{metrics.shortest.length.toFixed(0)} m</td>
                      <td className="px-4 py-3 font-mono font-semibold">{metrics.comfort.length.toFixed(0)} m</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Sombra de árboles</td>
                      <td className="px-4 py-3 font-mono">{metrics.shortest.tree_shade.toFixed(0)} m</td>
                      <td className="px-4 py-3 font-mono text-[#16a34a] font-semibold">{metrics.comfort.tree_shade.toFixed(0)} m</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Sombra de edificios</td>
                      <td className="px-4 py-3 font-mono">{metrics.shortest.building_shade.toFixed(0)} m</td>
                      <td className="px-4 py-3 font-mono text-[#16a34a] font-semibold">{metrics.comfort.building_shade.toFixed(0)} m</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Refugios &lt;200m</td>
                      <td className="px-4 py-3 font-mono">{metrics.shortest.refugios}</td>
                      <td className="px-4 py-3 font-mono text-[#0a72ef] font-semibold">{metrics.comfort.refugios}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
