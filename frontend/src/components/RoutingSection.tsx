"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Navigation, ArrowRight, Clock3, ThermometerSun } from "lucide-react";
import {
  PremiumAdviceVisual,
  PremiumCoolPlacesVisual,
  PremiumHeatmapVisual,
} from "./branding/HomeVisuals";
import { AddressAutocompleteField } from "./AddressAutocompleteField";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[var(--sand-50)] animate-pulse rounded-[32px]" />,
});

const EMPTY_GEOJSON = { type: "FeatureCollection", features: [] };

export function RoutingSection() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeResult, setRouteResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [originOptions] = useState<any[]>([]);
  const [destinationOptions] = useState<any[]>([]);

  const calculateRoute = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    // Lógica simulada para el ejemplo, manteniendo la estructura de datos original
    setTimeout(() => {
      setRouteResult({
        metrics: {
          human: { sun_time_saved_min: 12, shade_percentage: 75 }
        }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* 1. PLANNER CARD — Interfaz Operativa Premium */}
      <Card level={2} className="premium-card p-10 space-y-10">
        <div className="space-y-2">
          <h2 className="serif text-2xl italic font-semibold text-[var(--teal-700)]">Planifica tu recorrido</h2>
          <p className="text-[9px] text-[var(--sand-500)] font-bold tracking-[0.3em] uppercase">Introduce origen y destino</p>
        </div>

        <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[8px] font-bold uppercase tracking-widest text-[var(--teal-700)] opacity-40 ml-1">Origen</label>
              <div className="rounded-[24px] border border-black/5 bg-white/45 px-4 py-2">
                <AddressAutocompleteField
                  label="Origen"
                  hideLabelVisually
                  name="origin"
                  options={originOptions}
                  value={origin}
                  onValueChange={setOrigin}
                  onSelect={(option) => setOrigin(option.label)}
                  placeholder="Punto de partida..."
                />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[8px] font-bold uppercase tracking-widest text-[var(--teal-700)] opacity-40 ml-1">Destino</label>
              <div className="rounded-[24px] border border-black/5 bg-white/45 px-4 py-2">
                <AddressAutocompleteField
                  label="Destino"
                  hideLabelVisually
                  name="destination"
                  options={destinationOptions}
                  value={destination}
                  onValueChange={setDestination}
                  onSelect={(option) => setDestination(option.label)}
                  placeholder="Llegada..."
                />
              </div>
           </div>
         </div>

        <div className="flex gap-4 items-center">
            <div className="flex-1 bg-white/30 rounded-2xl border border-black/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Clock3 className="w-4 h-4 text-[var(--teal-700)] opacity-40" />
                    <span className="text-xs font-bold text-[var(--teal-700)]">Ahora</span>
                </div>
                <ArrowRight className="w-3 h-3 text-[var(--teal-700)] opacity-20" />
            </div>
            <Button 
                onClick={calculateRoute}
                disabled={loading || !origin || !destination}
                className="h-14 px-10 bg-[var(--teal-700)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-teal-900/20 hover:scale-[1.02] transition-all"
            >
                {loading ? "Calculando..." : "Calcular Ruta"}
            </Button>
        </div>
      </Card>

      {/* 2. MAP CARD — El lienzo dominante */}
      <div className="h-[500px] w-full relative group">
          <div className="absolute inset-0 -z-10 rounded-[40px] border border-black/5 bg-white/20 backdrop-blur-sm shadow-[var(--shadow-premium)]" />
          <MapComponent
            mergedData={EMPTY_GEOJSON}
            refugios={EMPTY_GEOJSON}
            fuentes={EMPTY_GEOJSON}
            onBarrioSelect={() => {}}
            routeResult={routeResult}
            showAreaLegend={false}
            showHeatmap={showHeatmap}
          />
          {!routeResult && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-3xl border border-black/5 shadow-2xl text-center space-y-2">
                      <Navigation className="w-8 h-8 text-[var(--teal-700)] opacity-20 mx-auto" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--teal-700)] opacity-60">Esperando coordenadas</p>
                  </div>
              </div>
          )}
      </div>

      {/* 3. INSIGHT STRIP — Micro-dashboards horizontales */}
      {routeResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-up">
            {/* Card Refugios */}
            <Card className="premium-card p-6 flex flex-col justify-between aspect-square">
                <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--teal-700)] opacity-40 mb-2">Lugares Frescos</p>
                    <h3 className="serif text-xl font-bold leading-tight">Refugios <br/>cercanos</h3>
                    <div className="text-5xl font-light serif italic mt-2 text-[var(--teal-700)] tabular-nums">6</div>
                </div>
                <PremiumCoolPlacesVisual className="h-12 w-full mt-4" />
            </Card>

            {/* Card Mapa Calor */}
            <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                type="button"
                className={`premium-card p-6 flex flex-col justify-between aspect-square text-left transition-all ${showHeatmap ? 'ring-2 ring-[var(--gold-500)]' : ''}`}
            >
                <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--teal-700)] opacity-40 mb-2">Previsión</p>
                    <h3 className="serif text-xl font-bold leading-tight text-[var(--teal-700)]">Mapa de <br/>radiación</h3>
                </div>
                <PremiumHeatmapVisual className="h-16 w-full rounded-xl opacity-80" />
            </button>

            {/* Card Consejo */}
            <Card className="premium-card p-6 flex flex-col justify-between aspect-square">
                <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--teal-700)] opacity-40 mb-2">Sugerencia</p>
                    <h3 className="serif text-xl font-bold leading-tight">Consejo <br/>del día</h3>
                    <p className="text-[10px] text-[var(--sand-500)] mt-3 leading-relaxed italic">“Busca arbolado denso.”</p>
                </div>
                <PremiumAdviceVisual className="h-12 w-full opacity-60" />
            </Card>
        </div>
      )}
    </div>
  );
}
