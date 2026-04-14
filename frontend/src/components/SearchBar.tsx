"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Clock, Settings, X, ChevronDown, ChevronUp } from "lucide-react";

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

const PREFERENCE_LABELS: Record<string, string> = {
  "0.0": "Mínima distancia",
  "0.1": "Muy directa",
  "0.2": "Bastante directa",
  "0.3": "Más directa",
  "0.4": "Directa con algo de sombra",
  "0.5": "Equilibrada",
  "0.6": "Equilibrada con sombra",
  "0.7": "Más sombra",
  "0.8": "Bastante sombra",
  "0.9": "Mucha sombra",
  "1.0": "Máxima sombra",
};

function getPreferenceLabel(val: number): string {
  const key = val.toFixed(1);
  return PREFERENCE_LABELS[key] || "Equilibrada";
}

export function SearchBar({ onSearch, initialState, loading }: SearchBarProps) {
  const [destination, setDestination] = useState(initialState?.destination || "");
  const [origin, setOrigin] = useState(initialState?.origin || "");
  const [hour, setHour] = useState(initialState?.hour ?? new Date().getHours());
  const [preference, setPreference] = useState(initialState?.preference ?? 0.5);
  const [useMyLocation, setUseMyLocation] = useState(initialState?.useMyLocation ?? true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [geolocationStatus, setGeolocationStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originRef = useRef<HTMLInputElement>(null);

  // Clamp hour to valid range
  const clampedHour = Math.max(8, Math.min(20, hour));

  // Geolocation on mount
  useEffect(() => {
    if (useMyLocation && geolocationStatus === "idle") {
      requestGeolocation();
    }
  }, []);

  useEffect(() => {
    if (initialState?.destination !== undefined) setDestination(initialState.destination);
    if (initialState?.origin !== undefined) setOrigin(initialState.origin);
    if (initialState?.hour !== undefined) setHour(initialState.hour);
    if (initialState?.preference !== undefined) setPreference(initialState.preference);
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
        // Store coordinates for later API use
        setOrigin(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        setGeolocationStatus("granted");
        setGeolocationError(null);
      },
      (error) => {
        setGeolocationStatus("denied");
        setUseMyLocation(false);
        setShowAdvanced(true);
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
    onSearch({
      origin: useMyLocation && origin ? origin : (origin || "Puerta del Sol, Madrid"),
      destination: destination.trim(),
      hour: clampedHour,
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
      setGeolocationStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main search bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Destination input — primary focus */}
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ds-gray-400)]">
            <Navigation className="w-4 h-4" />
          </div>
          <input
            ref={destinationRef}
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="¿A dónde quieres ir?"
            className="w-full pl-9 pr-4 py-3.5 sm:py-4 bg-white border border-[var(--ds-gray-200)] rounded-xl focus:ring-2 focus:ring-[var(--ds-focus-color)] focus:border-transparent text-[var(--ds-black)] text-base font-medium placeholder:text-[var(--ds-gray-400)] shadow-sm"
            autoFocus
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={loading || !destination.trim()}
          className="h-12 sm:h-[52px] px-8 bg-[var(--ds-black)] text-white font-semibold rounded-xl hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[var(--shadow-ring-light)] active:scale-[0.98] whitespace-nowrap"
        >
          {loading ? "Calculando..." : "Buscar ruta con sombra"}
        </button>
      </div>

      {/* Origin summary line — below search */}
      <div className="mt-2 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={handleToggleMyLocation}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors"
        >
          <MapPin className={`w-3 h-3 ${geolocationStatus === "granted" ? "text-green-500" : geolocationStatus === "denied" ? "text-red-400" : "text-[var(--ds-gray-400)]"}`} />
          {useMyLocation && geolocationStatus === "granted" ? (
            <span className="text-green-700">Tu ubicación actual</span>
          ) : useMyLocation && geolocationStatus === "requesting" ? (
            <span className="text-[var(--ds-gray-400)]">Obteniendo ubicación...</span>
          ) : geolocationStatus === "denied" || geolocationStatus === "error" ? (
            <span className="text-red-500">{geolocationError}</span>
          ) : (
            <span>Usar mi ubicación</span>
          )}
        </button>

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--ds-gray-500)] hover:text-[var(--ds-black)] transition-colors"
        >
          <Settings className="w-3 h-3" />
          {showAdvanced ? "Ocultar opciones" : "Opciones"}
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Collapsed advanced options */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)] rounded-xl space-y-4 animate-fade-in">
          {/* Origin input (when not using geolocation or to override) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--ds-gray-600)] mb-1.5 uppercase tracking-wide">
              Origen
            </label>
            <input
              ref={originRef}
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Tu ubicación actual o escribe una dirección"
              className="w-full px-3 py-2.5 bg-white border border-[var(--ds-gray-200)] rounded-lg focus:ring-2 focus:ring-[var(--ds-focus-color)] text-[var(--ds-black)] text-sm"
            />
            <div className="mt-1.5 rounded-lg border border-[var(--ds-gray-200)] bg-white px-3 py-2 text-[11px] text-[var(--ds-gray-600)] leading-relaxed">
              Puedes escribir una calle, un lugar conocido o unas coordenadas como <code>40.4168, -3.7038</code>.
            </div>
          </div>

          <div className="rounded-lg border border-[var(--ds-gray-200)] bg-white px-3 py-2 text-[11px] text-[var(--ds-gray-600)] leading-relaxed">
            Si usas tu ubicacion actual, solo necesitas indicar el destino. Si no, completa origen y destino para calcular la ruta.
          </div>

          {/* Hour selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[var(--ds-gray-600)] uppercase tracking-wide">
                Hora de salida
              </label>
              <span className="text-xs font-mono font-bold text-[var(--ds-black)]">{clampedHour}:00</span>
            </div>
            <input
              type="range"
              min="8"
              max="20"
              value={clampedHour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--ds-gray-200)] rounded-lg appearance-none cursor-pointer accent-[var(--ds-black)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2"
            />
            <div className="flex justify-between text-[10px] text-[var(--ds-gray-400)] mt-1">
              <span>8:00</span>
              <span>14:00</span>
              <span>20:00</span>
            </div>
          </div>

          {/* Preference selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[var(--ds-gray-600)] uppercase tracking-wide">
                Tipo de ruta
              </label>
              <span className="text-xs font-bold text-[var(--ds-black)]">{getPreferenceLabel(preference)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preference}
              onChange={(e) => setPreference(parseFloat(e.target.value))}
              className="w-full h-2 bg-[var(--ds-gray-200)] rounded-lg appearance-none cursor-pointer accent-[#16a34a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-focus-color)] focus-visible:ring-offset-2"
            />
            <div className="flex justify-between text-[10px] text-[var(--ds-gray-400)] mt-1">
              <span>🚶 Mínima distancia</span>
              <span>🌿 Máxima sombra</span>
            </div>
            <div className="mt-1.5 rounded-lg border border-[var(--ds-gray-200)] bg-white px-3 py-2 text-[11px] text-[var(--ds-gray-600)] leading-relaxed">
              Elige si prefieres llegar antes o caminar por un recorrido con mas sombra y recursos cercanos.
            </div>
          </div>
        </div>
      )}

      {/* Hidden summary for when user searches without expanding */}
      {!showAdvanced && (
        <div className="mt-2 flex gap-3 text-[11px] text-[var(--ds-gray-400)] px-1">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {clampedHour}:00
          </span>
          <span>·</span>
          <span>{getPreferenceLabel(preference)}</span>
        </div>
      )}
    </form>
  );
}
