"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Download, Navigation, Share2 } from "lucide-react";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--ds-gray-50)] text-sm text-[var(--ds-gray-500)]">
      Cargando mapa...
    </div>
  ),
});

interface RoutingSectionProps {
  onRouteCalculated?: (result: any) => void;
}

type ScenarioId = "carabanchel" | "villaverde";
type Step = 1 | 2;
type Priority = "directa" | "equilibrada" | "protegida";

type RouteApiResult = {
  comfort_coords: number[][];
  metrics: {
    shortest: {
      length: number;
      total_shade: number;
      fuentes: number;
      refugios: number;
    };
    comfort: {
      length: number;
      total_shade: number;
      fuentes: number;
      refugios: number;
    };
    human: {
      sun_time_saved_min: number;
      extra_effort_min: number;
    };
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const SCENARIOS: Record<
  ScenarioId,
  {
    label: string;
    tag: string;
    origin: string;
    destination: string;
    shortestLength: number;
    comfortLength: number;
    sunSavedMin: number;
    extraEffortMin: number;
    context: string;
  }
> = {
  carabanchel: {
    label: "Plaza Eliptica -> Gomez Ulla",
    tag: "Demo base",
    origin: "Plaza Eliptica, Madrid",
    destination: "Hospital Central de la Defensa Gomez Ulla, Madrid",
    shortestLength: 4276.4,
    comfortLength: 4676.9,
    sunSavedMin: 15.3,
    extraEffortMin: 4.8,
    context: "Caso de uso sanitario realista: 15 min menos al sol a cambio de 5 min de rodeo.",
  },
  villaverde: {
    label: "Villaverde Alto -> Ciudad de los Angeles",
    tag: "Zona critica",
    origin: "Villaverde Alto, Madrid",
    destination: "Ciudad de los Angeles, Madrid",
    shortestLength: 3070,
    comfortLength: 3190,
    sunSavedMin: 3.4,
    extraEffortMin: 1.4,
    context:
      "En zonas con deficit de arbolado e infraestructura verde, el sistema optimiza lo disponible pero evidencia la necesidad de mas inversion.",
  },
};

const HOUR_OPTIONS = [
  { value: 10, label: "10:00", note: "Manana" },
  { value: 14, label: "14:00", note: "Mas calor" },
  { value: 18, label: "18:00", note: "Tarde" },
];

const PRIORITY_OPTIONS: { key: Priority; label: string; description: string; preference: number }[] = [
  { key: "directa", label: "Mas directa", description: "Recorta distancia", preference: 0.2 },
  { key: "equilibrada", label: "Equilibrada", description: "Balancea distancia y sombra", preference: 0.5 },
  { key: "protegida", label: "Mas protegida", description: "Prioriza la sombra", preference: 0.8 },
];

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { step: 1 as Step, label: "Origen y destino" },
    { step: 2 as Step, label: "Hora y ruta" },
  ];

  return (
    <div className="mb-6 flex items-center gap-3" aria-label="Progreso del formulario">
      {steps.map((item, index) => {
        const isActive = current === item.step;
        const isDone = current > item.step;
        return (
          <div key={item.step} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive
                    ? "bg-[var(--ds-black)] text-white"
                    : isDone
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-500)]"
                }`}
              >
                {isDone ? "✓" : item.step}
              </div>
              <span
                className={`text-sm ${
                  isActive || isDone ? "text-[var(--ds-black)]" : "text-[var(--ds-gray-500)]"
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < steps.length - 1 ? <div className="h-px w-8 bg-[var(--ds-gray-200)]" /> : null}
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
  value,
  unit,
  label,
  tone = "neutral",
}: {
  value: string;
  unit: string;
  label: string;
  tone?: "neutral" | "positive";
}) {
  const tones =
    tone === "positive"
      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
      : "border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] text-[var(--ds-black)]";

  return (
    <div className={`rounded-2xl border p-4 text-center ${tones}`}>
      <div className="text-3xl font-bold tabular-nums">
        {value}
        <span className="ml-1 text-base font-medium">{unit}</span>
      </div>
      <p className="mt-1 text-sm leading-tight">{label}</p>
    </div>
  );
}

function mapErrorMessage(detail: string | null): string {
  if (!detail) {
    return "No se ha podido calcular ahora mismo. Intentalo de nuevo en unos segundos.";
  }

  const normalized = detail.toLowerCase();
  if (normalized.includes("geocodificar")) {
    return "No hemos encontrado esa direccion. Prueba con una calle y numero o usa uno de los escenarios de demo.";
  }
  if (normalized.includes("fuera de madrid")) {
    return "La direccion debe estar en Madrid. Prueba con una direccion mas concreta dentro del corredor disponible.";
  }
  if (normalized.includes("area de routing activa") || normalized.includes("corredor")) {
    return "La ruta sale fuera del corredor disponible. Usa uno de los escenarios de demo o direcciones dentro de la zona activa.";
  }
  return "No se ha podido calcular ahora mismo. Intentalo de nuevo en unos segundos.";
}

function kmLabel(meters: number): string {
  return (meters / 1000).toFixed(1);
}

export function RoutingSection({ onRouteCalculated }: RoutingSectionProps) {
  const [step, setStep] = useState<Step>(1);
  const [scenarioId, setScenarioId] = useState<ScenarioId>("carabanchel");
  const [origin, setOrigin] = useState(SCENARIOS.carabanchel.origin);
  const [destination, setDestination] = useState(SCENARIOS.carabanchel.destination);
  const [hour, setHour] = useState(14);
  const [priority, setPriority] = useState<Priority>("equilibrada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteApiResult | null>(null);

  const scenario = SCENARIOS[scenarioId];
  const priorityOption = PRIORITY_OPTIONS.find((option) => option.key === priority) ?? PRIORITY_OPTIONS[1];
  const metrics = routeResult?.metrics;
  const shortestLength = metrics?.shortest.length ?? scenario.shortestLength;
  const comfortLength = metrics?.comfort.length ?? scenario.comfortLength;
  const sunSavedMin = metrics?.human.sun_time_saved_min ?? scenario.sunSavedMin;
  const extraEffortMin = metrics?.human.extra_effort_min ?? scenario.extraEffortMin;
  const canProceed = origin.trim().length > 3 && destination.trim().length > 3;

  const summary = useMemo(
    () =>
      `En el escenario actual: ruta rapida ~${kmLabel(shortestLength)} km · ruta protegida ~${kmLabel(
        comfortLength,
      )} km · ${Math.round(sunSavedMin)} min menos al sol · ${Math.round(extraEffortMin)} min de rodeo`,
    [comfortLength, extraEffortMin, shortestLength, sunSavedMin],
  );

  const selectScenario = (nextScenarioId: ScenarioId) => {
    const nextScenario = SCENARIOS[nextScenarioId];
    setScenarioId(nextScenarioId);
    setOrigin(nextScenario.origin);
    setDestination(nextScenario.destination);
    setRouteResult(null);
    setError(null);
  };

  const goToStep2 = () => {
    if (!canProceed) {
      setError("Completa origen y destino para continuar.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const calculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          hour,
          preference: priorityOption.preference,
        }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(mapErrorMessage(body?.detail ?? null));
      }

      setRouteResult(body);
      onRouteCalculated?.(body);
    } catch (err) {
      setRouteResult(null);
      setError(err instanceof Error ? err.message : mapErrorMessage(null));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadGPX = () => {
    if (!routeResult?.comfort_coords) {
      setError("Primero calcula una ruta para descargar el GPX.");
      return;
    }

    const gpxPoints = routeResult.comfort_coords
      .map((coord) => `    <trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`)
      .join("\n");
    const gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Madrid Refugio">
  <trk>
    <name>Ruta climatica Madrid Refugio</name>
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

  const handleShareRoute = async () => {
    if (!metrics) {
      setError("Primero calcula una ruta para compartir el resultado.");
      return;
    }

    const text = `Madrid Refugio\n${origin} -> ${destination}\n${Math.round(
      sunSavedMin,
    )} min menos al sol · ${Math.round(extraEffortMin)} min de rodeo`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ruta mas fresca - Madrid Refugio",
          text,
          url: window.location.href,
        });
      } catch {
        return;
      }
      return;
    }

    await navigator.clipboard.writeText(text);
    setError("Resumen copiado al portapapeles.");
  };

  return (
    <div className="mb-24">
      <div className="mb-8 border-b border-[var(--ds-gray-100)] pb-6">
        <h2 className="sub-heading-large text-[var(--ds-black)]">Navegador de rutas climaticas</h2>
        <p className="mt-2 text-[var(--ds-gray-600)]">
          Planifica tu trayecto con pasos claros, botones grandes y una comparativa centrada en tiempo menos al sol.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-1.5 text-xs text-[#92400e]">
          <span>⚡</span>
          <span>
            <strong>Demo:</strong> corredor activo en Tetuan, Chamberi, Fuencarral, Moncloa-Aravaca, Centro,
            Arganzuela, Retiro, Salamanca, Carabanchel, Usera, Latina, Puente de Vallecas y Villaverde.
          </span>
        </div>
      </div>

      <div className="grid items-start gap-8 md:grid-cols-5">
        <div className="sticky top-24 h-[520px] md:col-span-2">
          <MapComponent
            mergedData={null}
            refugios={null}
            fuentes={null}
            onBarrioSelect={() => {}}
            routeResult={routeResult}
            showLegend={false}
          />
        </div>

        <div className="flex flex-col md:col-span-3">
          <StepIndicator current={step} />

          <Card level={2} className="border border-[var(--ds-gray-100)] p-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="card-title text-[var(--ds-black)]">Paso 1. Origen y destino</h3>
                  <p className="mt-2 text-sm text-[var(--ds-gray-600)]">
                    Puedes escribir tus direcciones o empezar con uno de los escenarios de demostracion.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ds-gray-600)]">
                    Escenario de demostracion
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(Object.entries(SCENARIOS) as [ScenarioId, (typeof SCENARIOS)[ScenarioId]][]).map(
                      ([id, item]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectScenario(id)}
                          className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                            scenarioId === id
                              ? "border-[var(--ds-black)] bg-[var(--ds-black)] text-white"
                              : "border-[var(--ds-gray-100)] bg-white text-[var(--ds-black)] hover:border-[var(--ds-gray-300)]"
                          }`}
                        >
                          <span className="block text-xs uppercase tracking-wide opacity-70">{item.tag}</span>
                          <span className="mt-1 block text-base font-semibold">{item.label}</span>
                        </button>
                      ),
                    )}
                  </div>
                  <p className="mt-3 text-sm text-[var(--ds-gray-500)]">{scenario.context}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--ds-gray-600)]">
                      <span>Desde donde sales</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!navigator.geolocation) return;
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setOrigin(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                            setRouteResult(null);
                            setError(null);
                          });
                        }}
                        className="text-xs text-[#0a72ef] hover:underline"
                      >
                        Ubicame
                      </button>
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setRouteResult(null);
                        setError(null);
                      }}
                      className="min-h-14 w-full rounded-xl border border-[var(--ds-gray-100)] px-4 text-base text-[var(--ds-black)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ds-focus-color)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--ds-gray-600)]">A donde vas</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setRouteResult(null);
                        setError(null);
                      }}
                      className="min-h-14 w-full rounded-xl border border-[var(--ds-gray-100)] px-4 text-base text-[var(--ds-black)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ds-focus-color)]"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : null}

                <Button variant="primary" className="min-h-14 w-full text-base" onClick={goToStep2}>
                  Continuar al paso 2
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="card-title text-[var(--ds-black)]">Paso 2. Hora y tipo de ruta</h3>
                  <p className="mt-2 text-sm text-[var(--ds-gray-600)]">
                    Elige una hora facil de entender y la prioridad de la ruta. Despues calcula la opcion mas protegida.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ds-gray-600)]">Hora del trayecto</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {HOUR_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setHour(option.value)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                          hour === option.value
                            ? "border-[#16a34a] bg-[#f0fdf4] text-[#166534]"
                            : "border-[var(--ds-gray-100)] bg-white text-[var(--ds-black)]"
                        }`}
                      >
                        <span className="block text-lg font-semibold">{option.label}</span>
                        <span className="block text-sm opacity-75">{option.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ds-gray-600)]">Tipo de ruta</label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PRIORITY_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setPriority(option.key)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                          priority === option.key
                            ? "border-[var(--ds-black)] bg-[var(--ds-black)] text-white"
                            : "border-[var(--ds-gray-100)] bg-white text-[var(--ds-black)]"
                        }`}
                      >
                        <span className="block text-base font-semibold">{option.label}</span>
                        <span className="mt-1 block text-sm opacity-75">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] p-4 text-sm text-[var(--ds-gray-600)]">
                  <p className="font-medium text-[var(--ds-black)]">Resumen del escenario</p>
                  <p className="mt-1">{summary}</p>
                </div>

                {error ? (
                  <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" className="min-h-14 sm:w-40" onClick={() => setStep(1)}>
                    Volver
                  </Button>
                  <Button
                    variant="primary"
                    className="min-h-14 flex-1 text-base"
                    onClick={calculate}
                    disabled={loading}
                  >
                    {loading ? "Calculando..." : "Calcular la ruta mas fresca"}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <MetricCard
              value={`${Math.round(sunSavedMin)}`}
              unit="min"
              label="menos al sol directo"
              tone="positive"
            />
            <MetricCard value={`${Math.round(extraEffortMin)}`} unit="min" label="de rodeo adicional" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <MetricCard value={kmLabel(shortestLength)} unit="km" label="ruta rapida" />
            <MetricCard value={kmLabel(comfortLength)} unit="km" label="ruta mas protegida" tone="positive" />
          </div>

          {metrics ? (
            <div className="mt-6">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-lg font-semibold text-[var(--ds-black)]">Detalle comparativo</h4>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleShareRoute}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDownloadGPX}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Exportar GPX
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[var(--ds-gray-100)]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Comparativa</th>
                      <th className="px-4 py-3 text-center font-medium">Ruta rapida</th>
                      <th className="px-4 py-3 text-center font-medium text-[#16a34a]">Ruta protegida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-black)]">
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Distancia total</td>
                      <td className="px-4 py-3 text-center font-mono">{metrics.shortest.length.toFixed(0)} m</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#16a34a]">
                        {metrics.comfort.length.toFixed(0)} m
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Sombra acumulada</td>
                      <td className="px-4 py-3 text-center font-mono">
                        {metrics.shortest.total_shade.toFixed(0)} m
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#16a34a]">
                        {metrics.comfort.total_shade.toFixed(0)} m
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Fuentes cercanas</td>
                      <td className="px-4 py-3 text-center font-mono">{metrics.shortest.fuentes}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#16a34a]">
                        {metrics.comfort.fuentes}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Refugios cercanos</td>
                      <td className="px-4 py-3 text-center font-mono">{metrics.shortest.refugios}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#16a34a]">
                        {metrics.comfort.refugios}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[var(--ds-gray-100)] bg-white p-5 text-sm text-[var(--ds-gray-600)]">
              <div className="flex items-start gap-3">
                <Navigation className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--ds-gray-500)]" />
                <div>
                  <p className="font-medium text-[var(--ds-black)]">Todavia no has calculado una ruta</p>
                  <p className="mt-1">
                    Completa los dos pasos y te mostraremos una comparativa sencilla: cuanto tiempo evitas al sol,
                    cuanto rodeo anades y que recursos de apoyo quedan cerca.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
