"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

export interface SearchBarState {
  origin: string;
  destination: string;
  hour: number;
  preference: number;
  useMyLocation: boolean;
}

interface SearchBarProps {
  onSearch: (state: SearchBarState) => void;
  initialState?: Partial<SearchBarState>;
  loading?: boolean;
}

const HOUR_OPTIONS = [10, 14, 18] as const;

const HOUR_LABELS: Record<number, string> = {
  10: "Mañana",
  14: "Más calor",
  18: "Tarde",
};

const PREFERENCE_OPTIONS = [
  { value: 0.0, label: "Directa", detail: "Llega antes" },
  { value: 0.5, label: "Equilibrada", detail: "Buen balance" },
  { value: 1.0, label: "Más sombra", detail: "Más fresco" },
] as const;

function getPreferenceLabel(val: number): string {
  const option = PREFERENCE_OPTIONS.find(({ value }) => value === val);
  return option?.label || "Equilibrada";
}

function normalizeHour(val: number): number {
  return HOUR_OPTIONS.reduce((closest, option) =>
    Math.abs(option - val) < Math.abs(closest - val) ? option : closest
  , HOUR_OPTIONS[0]);
}

function normalizePreference(val: number): number {
  return PREFERENCE_OPTIONS.reduce<number>((closest, option) =>
    Math.abs(option.value - val) < Math.abs(closest - val) ? option.value : closest
  , PREFERENCE_OPTIONS[1].value);
}

export function SearchBar({ onSearch, initialState, loading }: SearchBarProps) {
  const [destination, setDestination] = useState(initialState?.destination || "");
  const [origin, setOrigin] = useState(initialState?.origin || "");
  const [hour, setHour] = useState(() => normalizeHour(initialState?.hour ?? new Date().getHours()));
  const [preference, setPreference] = useState(() => normalizePreference(initialState?.preference ?? 0.5));
  const [useMyLocation, setUseMyLocation] = useState(initialState?.useMyLocation ?? true);
  const [geolocationStatus, setGeolocationStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originRef = useRef<HTMLInputElement>(null);

  const isLocationReady = useMyLocation && geolocationStatus === "granted" && Boolean(origin);
  const canSearch = destination.trim() && (useMyLocation ? isLocationReady : origin.trim());

  useEffect(() => {
    if (useMyLocation && geolocationStatus === "idle") {
      requestGeolocation();
    }
  }, []);

  useEffect(() => {
    if (initialState?.destination !== undefined) setDestination(initialState.destination);
    if (initialState?.origin !== undefined) setOrigin(initialState.origin);
    if (initialState?.hour !== undefined) setHour(normalizeHour(initialState.hour));
    if (initialState?.preference !== undefined) setPreference(normalizePreference(initialState.preference));
    if (initialState?.useMyLocation !== undefined) setUseMyLocation(initialState.useMyLocation);
  }, [
    initialState?.destination,
    initialState?.origin,
    initialState?.hour,
    initialState?.preference,
    initialState?.useMyLocation,
  ]);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeolocationStatus("error");
      setGeolocationError("Tu navegador no soporta geolocalización");
      setUseMyLocation(false);
      return;
    }

    setGeolocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        setGeolocationStatus("granted");
        setGeolocationError(null);
      },
      (error) => {
        setGeolocationStatus("denied");
        setUseMyLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeolocationError("Ubicación denegada. Escribe tu origen manualmente.");
        } else {
          setGeolocationError("No se pudo obtener tu ubicación. Escribe tu origen manualmente.");
        }
        window.setTimeout(() => originRef.current?.focus(), 0);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      destinationRef.current?.focus();
      return;
    }

    if (useMyLocation && !isLocationReady) {
      requestGeolocation();
      return;
    }

    if (!useMyLocation && !origin.trim()) {
      originRef.current?.focus();
      return;
    }

    onSearch({
      origin: useMyLocation ? origin : origin.trim(),
      destination: destination.trim(),
      hour,
      preference,
      useMyLocation: useMyLocation && geolocationStatus === "granted",
    });
  };

  const handleToggleMyLocation = () => {
    if (!useMyLocation) {
      setUseMyLocation(true);
      requestGeolocation();
    } else {
      setUseMyLocation(false);
      setOrigin("");
      setGeolocationError(null);
      setGeolocationStatus("idle");
      window.setTimeout(() => originRef.current?.focus(), 0);
    }
  };

  const locationTitle = useMyLocation
    ? geolocationStatus === "granted"
      ? "Tu ubicación actual"
      : geolocationStatus === "requesting"
        ? "Obteniendo ubicación"
        : "Activar ubicación"
    : "Origen manual";

  const locationDetail = useMyLocation
    ? geolocationStatus === "granted"
      ? origin
    : geolocationStatus === "requesting"
        ? "Estamos buscando tu posición para calcular la salida."
        : ""
    : "Calle, lugar o coordenadas en Madrid";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex flex-col items-center pt-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="my-2 h-12 w-px bg-[var(--ds-gray-200)]" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ds-gray-100)] text-[var(--ds-black)]">
              <Navigation className="h-4 w-4" />
            </span>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-[var(--ds-black)]">Origen</label>
                <button
                  type="button"
                  onClick={handleToggleMyLocation}
                  className="shrink-0 text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-800"
                >
                  {useMyLocation ? "Escribir origen" : "Usar mi ubicación"}
                </button>
              </div>

              {useMyLocation ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isLocationReady) requestGeolocation();
                  }}
                  className="w-full rounded-2xl border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] px-4 py-3 text-left transition-colors hover:border-[var(--ds-gray-300)]"
                >
                  <div className="text-sm font-medium text-[var(--ds-black)]">{locationTitle}</div>
                  {locationDetail && <div className="mt-1 text-xs text-[var(--ds-gray-500)]">{locationDetail}</div>}
                </button>
              ) : (
                <>
                  <input
                    ref={originRef}
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Calle, lugar o coordenadas en Madrid"
                    className="w-full rounded-2xl border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] px-4 py-3 text-sm text-[var(--ds-black)] placeholder:text-[var(--ds-gray-400)] focus:border-transparent focus:ring-2 focus:ring-[var(--ds-focus-color)]"
                  />
                  <p className="mt-1.5 text-xs text-[var(--ds-gray-500)]">
                    Usa una calle, un lugar o unas coordenadas.
                  </p>
                </>
              )}

              {geolocationError && !useMyLocation && (
                <p className="mt-1.5 text-xs text-red-500">{geolocationError}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--ds-black)]">Destino</label>
              <input
                ref={destinationRef}
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="¿A dónde quieres ir?"
                className="w-full rounded-2xl border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] px-4 py-3 text-base font-medium text-[var(--ds-black)] placeholder:text-[var(--ds-gray-400)] focus:border-transparent focus:ring-2 focus:ring-[var(--ds-focus-color)]"
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-[var(--ds-black)]">Hora de salida</label>
            <span className="text-xs font-semibold text-[var(--ds-gray-500)]">{hour}:00</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {HOUR_OPTIONS.map((option) => {
              const selected = option === hour;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHour(option)}
                  className={`rounded-2xl border px-3 py-2 text-left transition-all ${selected ? "border-[var(--ds-black)] bg-[var(--ds-black)] text-white shadow-sm" : "border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] text-[var(--ds-black)] hover:border-[var(--ds-gray-300)]"}`}
                >
                  <div className="text-sm font-semibold">{option}:00</div>
                  <div className={`mt-0.5 text-[11px] ${selected ? "text-white/75" : "text-[var(--ds-gray-500)]"}`}>
                    {HOUR_LABELS[option]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-[var(--ds-black)]">Tipo de ruta</label>
            <span className="text-xs font-semibold text-[var(--ds-gray-500)]">{getPreferenceLabel(preference)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PREFERENCE_OPTIONS.map((option) => {
              const selected = option.value === preference;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreference(option.value)}
                  className={`rounded-2xl border px-3 py-2 text-left transition-all ${selected ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] text-[var(--ds-black)] hover:border-[var(--ds-gray-300)]"}`}
                >
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className={`mt-0.5 text-[11px] ${selected ? "text-white/75" : "text-[var(--ds-gray-500)]"}`}>
                    {option.detail}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !canSearch}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#16a34a] px-6 text-base font-semibold text-white transition-all hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Calculando..." : "Buscar ruta con sombra"}
      </button>
    </form>
  );
}
