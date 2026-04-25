"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

import { AddressAutocompleteField } from "./AddressAutocompleteField";
import { getSearchOptions as getSearchSuggestions } from "@/lib/search-source";
import type { SearchOption } from "@/lib/madrid-search";

export interface ResolvedLocation {
  label: string;
  kind?: string | null;
  lat: number;
  lon: number;
}

export interface SearchBarState {
  origin: ResolvedLocation;
  destination: ResolvedLocation;
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
const AUTOCOMPLETE_DEBOUNCE_MS = 180;

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

function toSearchOption(location?: ResolvedLocation): SearchOption | null {
  if (!location) {
    return null;
  }

  return {
    id: `${location.label}-${location.lat}-${location.lon}-${location.kind ?? "place"}`,
    label: location.label,
    kind: (location.kind as SearchOption["kind"] | undefined) ?? "place",
    lat: location.lat,
    lon: location.lon,
  };
}

function toResolvedLocation(option: SearchOption): ResolvedLocation {
  return {
    label: option.label,
    kind: option.kind,
    lat: option.lat,
    lon: option.lon,
  };
}

function getLocationDetail(location: ResolvedLocation | null): string {
  if (!location) {
    return "";
  }

  return `${location.lat.toFixed(6)}, ${location.lon.toFixed(6)}`;
}

function isSearchSourceError(error: unknown): error is { message: string } {
  return typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "SearchSourceError" &&
    "message" in error &&
    typeof error.message === "string";
}

export function SearchBar({ onSearch, initialState, loading }: SearchBarProps) {
  const [destination, setDestination] = useState(initialState?.destination?.label || "");
  const [selectedDestination, setSelectedDestination] = useState<SearchOption | null>(() => toSearchOption(initialState?.destination));
  const [destinationOptions, setDestinationOptions] = useState<SearchOption[]>([]);
  const [origin, setOrigin] = useState(initialState?.useMyLocation ? "" : initialState?.origin?.label || "");
  const [selectedOrigin, setSelectedOrigin] = useState<SearchOption | null>(() => initialState?.useMyLocation ? null : toSearchOption(initialState?.origin));
  const [originOptions, setOriginOptions] = useState<SearchOption[]>([]);
  const [debouncedDestination, setDebouncedDestination] = useState(destination);
  const [debouncedOrigin, setDebouncedOrigin] = useState(origin);
  const [hour, setHour] = useState(() => normalizeHour(initialState?.hour ?? new Date().getHours()));
  const [preference, setPreference] = useState(() => normalizePreference(initialState?.preference ?? 0.5));
  const [useMyLocation, setUseMyLocation] = useState(initialState?.useMyLocation ?? false);
  const [geolocationStatus, setGeolocationStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [hasRequestedGeolocation, setHasRequestedGeolocation] = useState(Boolean(initialState?.useMyLocation && initialState?.origin));
  const [searchSourceError, setSearchSourceError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<ResolvedLocation | null>(() => initialState?.useMyLocation ? initialState.origin ?? null : null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originRef = useRef<HTMLInputElement>(null);

  const isLocationReady = useMyLocation && geolocationStatus === "granted" && Boolean(currentLocation);
  const canSearch = Boolean(selectedDestination) && (useMyLocation ? isLocationReady : Boolean(selectedOrigin));
  useEffect(() => {
    if (useMyLocation && hasRequestedGeolocation && geolocationStatus === "idle") {
      requestGeolocation();
    }
  }, [geolocationStatus, hasRequestedGeolocation, useMyLocation]);

  useEffect(() => {
    if (initialState?.destination !== undefined) {
      setDestination(initialState.destination?.label || "");
      setSelectedDestination(toSearchOption(initialState.destination));
    }

    if (initialState?.origin !== undefined) {
      if (initialState?.useMyLocation) {
        setCurrentLocation(initialState.origin ?? null);
        setOrigin("");
        setSelectedOrigin(null);
      } else {
        setOrigin(initialState.origin?.label || "");
        setSelectedOrigin(toSearchOption(initialState.origin));
      }
    }

    if (initialState?.hour !== undefined) setHour(normalizeHour(initialState.hour));
    if (initialState?.preference !== undefined) setPreference(normalizePreference(initialState.preference));
    if (initialState?.useMyLocation !== undefined) {
      setUseMyLocation(initialState.useMyLocation);
    }
  }, [
    initialState?.destination,
    initialState?.origin,
    initialState?.hour,
    initialState?.preference,
    initialState?.useMyLocation,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedDestination(destination);
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [destination]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedOrigin(origin);
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [origin]);

  useEffect(() => {
    if (
      selectedDestination?.label === destination ||
      !destination.trim() ||
      debouncedDestination.trim() !== destination.trim()
    ) {
      setDestinationOptions([]);
      return;
    }

    let cancelled = false;

    getSearchSuggestions(debouncedDestination)
      .then((options) => {
        if (!cancelled) {
          setSearchSourceError(null);
          setDestinationOptions(options);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDestinationOptions([]);
          setSearchSourceError(
            isSearchSourceError(error)
              ? error.message
              : "No se pudieron cargar las sugerencias ahora mismo.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedDestination, destination, selectedDestination]);

  useEffect(() => {
    if (
      useMyLocation ||
      selectedOrigin?.label === origin ||
      !origin.trim() ||
      debouncedOrigin.trim() !== origin.trim()
    ) {
      setOriginOptions([]);
      return;
    }

    let cancelled = false;

    getSearchSuggestions(debouncedOrigin)
      .then((options) => {
        if (!cancelled) {
          setSearchSourceError(null);
          setOriginOptions(options);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setOriginOptions([]);
          setSearchSourceError(
            isSearchSourceError(error)
              ? error.message
              : "No se pudieron cargar las sugerencias ahora mismo.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedOrigin, origin, selectedOrigin, useMyLocation]);

  const requestGeolocation = () => {
    setHasRequestedGeolocation(true);

    if (!navigator.geolocation) {
      setGeolocationStatus("error");
      setGeolocationError("Tu navegador no soporta geolocalización");
      setUseMyLocation(false);
      return;
    }

    setGeolocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          label: "Tu ubicación actual",
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        });
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
    if (!selectedDestination) {
      destinationRef.current?.focus();
      return;
    }

    if (useMyLocation && !isLocationReady) {
      requestGeolocation();
      return;
    }

    if (!useMyLocation && !selectedOrigin) {
      originRef.current?.focus();
      return;
    }

    onSearch({
      origin: useMyLocation ? currentLocation! : toResolvedLocation(selectedOrigin!),
      destination: toResolvedLocation(selectedDestination),
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
      setSelectedOrigin(null);
      setCurrentLocation(null);
      setGeolocationError(null);
      setGeolocationStatus("idle");
      setHasRequestedGeolocation(false);
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
      ? getLocationDetail(currentLocation)
    : geolocationStatus === "requesting"
        ? "Estamos buscando tu posición para calcular la salida."
        : ""
    : "Calle, lugar o coordenadas en Madrid";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-[32px] border border-black/8 bg-white px-4 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.10)] sm:px-5 sm:py-5">
        <div className="mb-4 flex flex-col gap-2 border-b border-[var(--ds-gray-100)] pb-4 text-left sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ds-gray-500)]">Planifica tu recorrido</p>
            <p className="mt-1 text-sm text-[var(--ds-gray-600)]">Madrid solo: dos puntos reales, una hora concreta y el equilibrio que prefieras.</p>
          </div>
          <p className="text-xs font-medium text-[var(--ds-gray-500)]">Sin búsqueda libre fuera de Madrid</p>
        </div>

        <div className="rounded-[28px] border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)]/70 p-2.5 sm:p-3">
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(220px,0.8fr)_minmax(220px,0.8fr)_auto]">
            <div className="rounded-[22px] bg-white px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  Origen
                </label>
                <button
                  type="button"
                  onClick={handleToggleMyLocation}
                  className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2"
                >
                  {useMyLocation ? "Escribir" : "Mi ubicación"}
                </button>
              </div>

              {useMyLocation ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isLocationReady) requestGeolocation();
                  }}
                  className="w-full rounded-2xl bg-[var(--ds-gray-50)] px-3 py-3 text-left transition-colors hover:bg-[var(--ds-gray-100)]"
                >
                  <div className="text-sm font-medium text-[var(--ds-black)]">{locationTitle}</div>
                  {locationDetail && <div className="mt-1 text-xs text-[var(--ds-gray-500)]">{locationDetail}</div>}
                </button>
              ) : (
                <AddressAutocompleteField
                  ref={originRef}
                  label="Origen"
                  hideLabelVisually
                  name="origin"
                  options={originOptions}
                  value={origin}
                  selectedOption={selectedOrigin}
                  onValueChange={setOrigin}
                  onSelectedOptionChange={setSelectedOrigin}
                  onSelect={setSelectedOrigin}
                  placeholder="Calle, lugar o coordenadas"
                />
              )}

              {geolocationError && !useMyLocation && (
                <p className="mt-1.5 text-xs text-red-500">{geolocationError}</p>
              )}
            </div>

            <div className="rounded-[22px] bg-white px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">
                <Navigation className="h-3.5 w-3.5 text-[var(--ds-black)]" />
                Destino
              </div>

              <AddressAutocompleteField
                ref={destinationRef}
                label="Destino"
                hideLabelVisually
                name="destination"
                options={destinationOptions}
                value={destination}
                selectedOption={selectedDestination}
                onValueChange={setDestination}
                onSelectedOptionChange={setSelectedDestination}
                onSelect={setSelectedDestination}
                placeholder="¿A dónde quieres ir?"
              />

              {searchSourceError && (
                <p role="alert" className="mt-1.5 text-xs text-red-500">
                  {searchSourceError}
                </p>
              )}
            </div>

            <div className="rounded-[22px] bg-white px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">Hora</label>
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
                      className={`min-h-16 rounded-2xl border px-2.5 py-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 ${selected ? "border-[var(--ds-black)] bg-[var(--ds-black)] text-white shadow-sm" : "border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] text-[var(--ds-black)] hover:border-[var(--ds-gray-300)]"}`}
                    >
                      <div className="text-sm font-semibold">{option}:00</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[22px] bg-white px-3 py-3 shadow-[var(--shadow-border)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ds-gray-500)]">Ruta</label>
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
                      className={`min-h-16 rounded-2xl border px-2.5 py-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 ${selected ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] text-[var(--ds-black)] hover:border-[var(--ds-gray-300)]"}`}
                    >
                      <div className="text-sm font-semibold">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canSearch}
              className="flex min-h-[148px] items-center justify-center rounded-[24px] bg-[#16a34a] px-6 text-base font-semibold text-white transition-all hover:bg-[#15803d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 xl:min-h-0"
            >
              {loading ? "Calculando..." : "Buscar ruta con sombra"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
