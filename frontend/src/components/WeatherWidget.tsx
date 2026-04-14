"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Thermometer, AlertCircle, RefreshCw } from "lucide-react";

interface WeatherData {
  municipio: string;
  temperatura: number;
  estado_cielo: string;
  timestamp: string;
  fuente: string;
  error?: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchWeather = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch("/api/weather");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.error) throw new Error(data?.error || "Sin datos de AEMET");
      setWeather(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh cada 15 min
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !weather) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)] text-[var(--ds-gray-500)] text-xs animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Consultando AEMET...
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--ds-gray-50)] border border-[var(--ds-gray-100)] text-[var(--ds-gray-500)] text-xs">
        <RefreshCw className={`w-3 h-3 ${failed ? "" : "animate-spin"}`} />
        {failed ? "AEMET no disponible" : "Consultando AEMET..."}
      </div>
    );
  }

  const isHot = weather.temperatura >= 30;

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-sm transition-all fade-in-up active
      ${isHot ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
      <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm">
        <Thermometer className={`w-4 h-4 ${isHot ? 'text-orange-500' : 'text-blue-500'}`} />
        <span>{weather.temperatura}°C</span>
      </div>
      <div className="h-3 w-px bg-current opacity-20"></div>
      <div className="flex items-center gap-1.5 text-xs font-medium">
        <Sun className="w-3.5 h-3.5 opacity-70" />
        <span className="hidden sm:inline capitalize">{weather.estado_cielo}</span>
        <span className="opacity-60 text-[10px] ml-1">{weather.timestamp}</span>
      </div>
      {isHot && (
        <>
          <div className="h-3 w-px bg-current opacity-20"></div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
            <AlertCircle className="w-3 h-3" />
            <span className="hidden xs:inline">Riesgo Térmico</span>
          </div>
        </>
      )}
    </div>
  );
}
