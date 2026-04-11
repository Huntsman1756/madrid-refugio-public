"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Thermometer } from "lucide-react";

interface WeatherData {
  municipio: string;
  temperatura: number | string;
  estado_cielo: string;
  timestamp: string;
  fuente: string;
  error?: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/weather");
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hasWeather = !!weather && !weather.error;
  const temperature = hasWeather ? Number(weather.temperatura) : null;
  const isHeatWarning = temperature !== null && temperature >= 35;
  const isWarm = temperature !== null && temperature >= 30;

  const toneClasses = isHeatWarning
    ? "border-orange-200 bg-orange-50 text-orange-800"
    : isWarm
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-white text-slate-700";

  const leadText =
    loading && !weather
      ? "Consultando AEMET..."
      : isHeatWarning
        ? "Alerta por calor extremo"
        : isWarm
          ? "Calor intenso"
        : `${weather?.municipio ?? "Madrid"} ahora:`;

  const statusText =
    loading && !weather
      ? ""
      : hasWeather
        ? `${temperature} °C, ${weather.estado_cielo}`
        : "Contexto AEMET no disponible";

  const metaText = hasWeather ? `AEMET ${weather.timestamp}` : null;

  return (
    <div
      className={`inline-flex min-h-[36px] items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium shadow-sm transition-all fade-in-up active sm:text-sm ${toneClasses}`}
    >
      {loading && !weather ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : hasWeather ? (
        <Thermometer className={`h-4 w-4 ${isHeatWarning ? "text-orange-500" : isWarm ? "text-amber-500" : "text-slate-500"}`} />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      {(isHeatWarning || isWarm) && (
        <span className={`flex h-2 w-2 rounded-full ${isHeatWarning ? "bg-red-500" : "bg-orange-400"}`} />
      )}
      <span className="font-semibold">{leadText}</span>
      {statusText && <span className="font-normal">{statusText}</span>}
      {metaText && <span className="text-[11px] font-normal opacity-60 sm:text-xs">· {metaText}</span>}
    </div>
  );
}
