"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Download, LoaderCircle, Navigation, Share2 } from "lucide-react";

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
type SuggestionField = "origin" | "destination" | null;

type RouteApiResult = {
  comfort_coords: number[][];
  shortest_coords?: number[][];
  origin_latlon?: [number, number];
  destination_latlon?: [number, number];
  origin?: string;
  destination?: string;
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

type PhotonFeature = {
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
  };
};

type Suggestion = {
  label: string;
  value: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const PHOTON_LIMIT = 8;
const MIN_QUERY_LENGTH = 3;
const SUGGESTION_BLUR_DELAY_MS = 150;

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
    label: "Plaza Elíptica → Gómez Ulla",
    tag: "Demo base",
    origin: "Plaza Elíptica, Madrid",
    destination: "Hospital Central de la Defensa Gómez Ulla, Madrid",
    shortestLength: 4276.4,
    comfortLength: 4676.9,
    sunSavedMin: 15.3,
    extraEffortMin: 4.8,
    context: "Caso de uso sanitario realista: 10 min menos al sol a cambio de 1 min de rodeo.",
  },
  villaverde: {
    label: "Villaverde Alto → Ciudad de los Ángeles",
    tag: "Zona crítica",
    origin: "Villaverde Alto, Madrid",
    destination: "Ciudad de los Ángeles, Madrid",
    shortestLength: 3070,
    comfortLength: 3190,
    sunSavedMin: 3.4,
    extraEffortMin: 1.4,
    context:
      "En zonas con déficit de arbolado e infraestructura verde, el sistema optimiza lo disponible pero evidencia la necesidad de más inversión.",
  },
};

const HOUR_OPTIONS = [
  { value: 10, label: "10:00", note: "Mañana" },
  { value: 14, label: "14:00", note: "Más calor" },
  { value: 18, label: "18:00", note: "Tarde" },
];

const PRIORITY_OPTIONS: { key: Priority; label: string; description: string; preference: number }[] = [
  { key: "directa", label: "Más directa", description: "Recorta distancia", preference: 0.2 },
  { key: "equilibrada", label: "Equilibrada", description: "Balancea distancia y sombra", preference: 0.5 },
  { key: "protegida", label: "Más protegida", description: "Prioriza la sombra", preference: 0.8 },
];

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function looksLikeCoordinates(value: string): boolean {
  return /^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/.test(value);
}

function buildSuggestionLabel(feature: PhotonFeature): string | null {
  const props = feature.properties ?? {};
  const name = props.name?.trim();
  const streetLine = [props.street?.trim(), props.housenumber?.trim()].filter(Boolean).join(" ");
  const primary = name || streetLine;
  const locality = props.district?.trim() || props.city?.trim() || props.county?.trim() || props.state?.trim();

  if (!primary) {
    return null;
  }

  return locality ? `${primary}, ${locality}` : primary;
}

async function fetchPhotonSuggestions(query: string, signal: AbortSignal): Promise<Suggestion[]> {
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${PHOTON_LIMIT}&lang=en`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Photon error ${response.status}`);
  }

  const data = await response.json();
  const features = Array.isArray(data?.features) ? (data.features as PhotonFeature[]) : [];

  return features
    .filter((feature) => {
      const city = normalizeText(feature.properties?.city);
      const county = normalizeText(feature.properties?.county);
      return city === "madrid" || county.includes("madrid");
    })
    .map((feature) => {
      const label = buildSuggestionLabel(feature);
      return label ? { label, value: label } : null;
    })
    .filter((item): item is Suggestion => !!item)
    .filter((item, index, array) => array.findIndex((candidate) => candidate.value === item.value) === index)
    .slice(0, PHOTON_LIMIT);
}

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
      ? "border-[#86efac] bg-[#dcfce7] text-[#14532d]"
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
    return "No se ha podido calcular ahora mismo. Inténtalo de nuevo en unos segundos.";
  }

  const normalized = detail.toLowerCase();
  if (normalized.includes("geocodificar")) {
    return "No hemos encontrado esa dirección. Prueba con una calle y número o usa uno de los escenarios de demo.";
  }
  if (normalized.includes("fuera de madrid")) {
    return "La dirección debe estar en Madrid. Prueba con una dirección más concreta dentro del municipio.";
  }
  if (normalized.includes("area de routing activa") || normalized.includes("corredor")) {
    return "No hemos podido conectar ese punto con la red peatonal. Prueba con una dirección más concreta dentro de Madrid.";
  }
  return "No se ha podido calcular ahora mismo. Inténtalo de nuevo en unos segundos.";
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
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteApiResult | null>(null);
  const [activeField, setActiveField] = useState<SuggestionField>(null);
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Suggestion[]>([]);
  const [originSuggestionsLoading, setOriginSuggestionsLoading] = useState(false);
  const [destinationSuggestionsLoading, setDestinationSuggestionsLoading] = useState(false);

  const blurTimeoutRef = useRef<number | null>(null);
  const originAbortRef = useRef<AbortController | null>(null);
  const destinationAbortRef = useRef<AbortController | null>(null);

  const scenario = SCENARIOS[scenarioId];
  const priorityOption = PRIORITY_OPTIONS.find((option) => option.key === priority) ?? PRIORITY_OPTIONS[1];
  const metrics = routeResult?.metrics;
  const shortestLength = metrics?.shortest.length ?? scenario.shortestLength;
  const comfortLength = metrics?.comfort.length ?? scenario.comfortLength;
  const sunSavedMin = metrics?.human.sun_time_saved_min ?? scenario.sunSavedMin;
  const extraEffortMin = metrics?.human.extra_effort_min ?? scenario.extraEffortMin;
  const canProceed = origin.trim().length > 3 && destination.trim().length > 3;
  const visibleRouteResult = error ? null : routeResult;

  const summary = useMemo(
    () =>
      `En el escenario actual: ruta rápida ~${kmLabel(shortestLength)} km · ruta protegida ~${kmLabel(
        comfortLength,
      )} km · ${Math.round(sunSavedMin)} min menos al sol · ${Math.round(extraEffortMin)} min de rodeo`,
    [comfortLength, extraEffortMin, shortestLength, sunSavedMin],
  );

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
      originAbortRef.current?.abort();
      destinationAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const query = origin.trim();
    if (query.length < MIN_QUERY_LENGTH || looksLikeCoordinates(query)) {
      originAbortRef.current?.abort();
      setOriginSuggestions([]);
      setOriginSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    originAbortRef.current?.abort();
    originAbortRef.current = controller;
    setOriginSuggestionsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const suggestions = await fetchPhotonSuggestions(query, controller.signal);
        setOriginSuggestions(suggestions);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setOriginSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setOriginSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [origin]);

  useEffect(() => {
    const query = destination.trim();
    if (query.length < MIN_QUERY_LENGTH || looksLikeCoordinates(query)) {
      destinationAbortRef.current?.abort();
      setDestinationSuggestions([]);
      setDestinationSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    destinationAbortRef.current?.abort();
    destinationAbortRef.current = controller;
    setDestinationSuggestionsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const suggestions = await fetchPhotonSuggestions(query, controller.signal);
        setDestinationSuggestions(suggestions);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setDestinationSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDestinationSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [destination]);

  const resetFeedback = () => {
    setRouteResult(null);
    setError(null);
  };

  const clearSuggestions = (field?: SuggestionField) => {
    if (!field || field === "origin") {
      setOriginSuggestions([]);
    }
    if (!field || field === "destination") {
      setDestinationSuggestions([]);
    }
  };

  const selectScenario = (nextScenarioId: ScenarioId) => {
    const nextScenario = SCENARIOS[nextScenarioId];
    setScenarioId(nextScenarioId);
    setOrigin(nextScenario.origin);
    setDestination(nextScenario.destination);
    clearSuggestions();
    resetFeedback();
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
    setRouteResult(null);
    setError(null);
    clearSuggestions();

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
    <name>Ruta climática Madrid Refugio</name>
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
          title: "Ruta más fresca - Madrid Refugio",
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

  const applySuggestion = (field: Exclude<SuggestionField, null>, suggestion: Suggestion) => {
    if (field === "origin") {
      setOrigin(suggestion.value);
      setOriginSuggestions([]);
    } else {
      setDestination(suggestion.value);
      setDestinationSuggestions([]);
    }
    setActiveField(null);
    resetFeedback();
  };

  const scheduleBlurClose = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = window.setTimeout(() => setActiveField(null), SUGGESTION_BLUR_DELAY_MS);
  };

  const cancelBlurClose = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const renderSuggestions = (field: Exclude<SuggestionField, null>, suggestions: Suggestion[], isLoading: boolean) => {
    const isVisible = activeField === field && (isLoading || suggestions.length > 0);
    if (!isVisible) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-xl border border-[var(--ds-gray-100)] bg-white shadow-lg">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--ds-gray-500)]">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Buscando direcciones...
          </div>
        ) : (
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li key={`${field}-${suggestion.value}`}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    cancelBlurClose();
                    applySuggestion(field, suggestion);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--ds-black)] transition-colors hover:bg-[var(--ds-gray-50)]"
                >
                  {suggestion.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="mb-24">
      <div className="mb-8 border-b border-[var(--ds-gray-100)] pb-6">
        <h2 className="sub-heading-large text-[var(--ds-black)]">Navegador de rutas climáticas</h2>
        <p className="mt-2 text-[var(--ds-gray-600)]">
          Planifica tu trayecto con pasos claros, botones grandes y una comparativa centrada en tiempo menos al sol.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#fde68a] bg-[#fffbeb] px-3 py-1.5 text-xs text-[#92400e]">
          <span>⚡</span>
          <span>
            <strong>Cobertura actual:</strong> operativa en los 21 distritos de Madrid.
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
            routeResult={visibleRouteResult}
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
                    Puedes escribir tus direcciones o empezar con uno de los escenarios de demostración.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--ds-gray-600)]">
                    Escenario de demostración
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
                  <div className="relative">
                    <label className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--ds-gray-600)]">
                      <span>Desde dónde sales</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!navigator.geolocation) {
                            setError("Tu navegador no permite usar la ubicación actual.");
                            return;
                          }

                          setLocating(true);
                          resetFeedback();
                          clearSuggestions("origin");

                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setOrigin(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                              setActiveField(null);
                              setLocating(false);
                            },
                            () => {
                              setError("No hemos podido obtener tu ubicación actual. Revisa los permisos del navegador.");
                              setLocating(false);
                            },
                          );
                        }}
                        disabled={locating}
                        className="inline-flex items-center gap-1 text-xs text-[#0a72ef] hover:underline disabled:cursor-wait disabled:no-underline disabled:opacity-70"
                      >
                        {locating ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
                        {locating ? "Ubicando..." : "Ubícame"}
                      </button>
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onFocus={() => setActiveField("origin")}
                      onBlur={scheduleBlurClose}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setActiveField("origin");
                        resetFeedback();
                      }}
                      className="min-h-14 w-full rounded-xl border border-[var(--ds-gray-100)] px-4 text-base text-[var(--ds-black)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ds-focus-color)]"
                      autoComplete="off"
                    />
                    {renderSuggestions("origin", originSuggestions, originSuggestionsLoading)}
                  </div>
                  <div className="relative">
                    <label className="mb-2 block text-sm font-medium text-[var(--ds-gray-600)]">A dónde vas</label>
                    <input
                      type="text"
                      value={destination}
                      onFocus={() => setActiveField("destination")}
                      onBlur={scheduleBlurClose}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setActiveField("destination");
                        resetFeedback();
                      }}
                      className="min-h-14 w-full rounded-xl border border-[var(--ds-gray-100)] px-4 text-base text-[var(--ds-black)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ds-focus-color)]"
                      autoComplete="off"
                    />
                    {renderSuggestions("destination", destinationSuggestions, destinationSuggestionsLoading)}
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
                    Elige una hora fácil de entender y la prioridad de la ruta. Después calcula la opción más protegida.
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
                    {loading ? "Calculando..." : "Calcular la ruta más fresca"}
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
            <MetricCard value={kmLabel(shortestLength)} unit="km" label="ruta rápida" />
            <MetricCard value={kmLabel(comfortLength)} unit="km" label="ruta más protegida" tone="positive" />
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
                      <th className="px-4 py-3 text-center font-medium">Ruta rápida</th>
                      <th className="px-4 py-3 text-center font-medium text-[#166534]">Ruta protegida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-black)]">
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Distancia total</td>
                      <td className="px-4 py-3 text-center font-mono">{metrics.shortest.length.toFixed(0)} m</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#166534]">
                        {metrics.comfort.length.toFixed(0)} m
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Sombra acumulada</td>
                      <td className="px-4 py-3 text-center font-mono">
                        {metrics.shortest.total_shade.toFixed(0)} m
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#166534]">
                        {metrics.comfort.total_shade.toFixed(0)} m
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Fuentes cercanas</td>
                      <td className="px-4 py-3 text-center font-mono">{metrics.shortest.fuentes}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#166534]">
                        {metrics.comfort.fuentes}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-[var(--ds-gray-600)]">Refugios cercanos</td>
                      <td className="px-4 py-3 text-center font-mono">{metrics.shortest.refugios}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-[#166534]">
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
                  <p className="font-medium text-[var(--ds-black)]">Todavía no has calculado una ruta</p>
                  <p className="mt-1">
                    Completa los dos pasos y te mostraremos una comparativa sencilla: cuánto tiempo evitas al sol,
                    cuánto rodeo añades y qué recursos de apoyo quedan cerca.
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
