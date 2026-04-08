"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon paths (Next.js asset issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapHandle {
  flyToBarrio: (lat: number, lon: number) => void;
}

interface MapComponentProps {
  mergedData: any;
  refugios: any;
  fuentes: any;
  onBarrioSelect: (barrioName: string) => void;
  routeResult?: any;
  flyTarget?: { lat: number; lon: number } | null;
  viewMode?: 'vulnerability' | 'shelter_deficit';
}

// ── Inner controllers (must live inside MapContainer) ──────────────────────

/** Flies to a barrio centroid when flyTarget changes */
function FlyController({ target }: { target: { lat: number; lon: number } | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], 15, { duration: 1.2 });
  }, [target, map]);
  return null;
}

/** Fits map to the bounding box of the route when routeResult changes */
function RouteViewController({ routeResult }: { routeResult: any }) {
  const map = useMap();
  useEffect(() => {
    if (!routeResult?.comfort_coords?.length) return;
    const allCoords: [number, number][] = [
      ...routeResult.comfort_coords,
      ...routeResult.shortest_coords,
    ];
    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [routeResult, map]);
  return null;
}

/** Fits map to the entire dataset (Madrid bounds) on mount if no route is active */
function FitDataController({ data, isActive }: { data: any, isActive: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (isActive && data?.features?.length > 0) {
      try {
        const geoJsonLayer = L.geoJSON(data);
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20], maxZoom: 14 });
      } catch (e) {
        // Fallback to center if fitBounds fails
        map.setView([40.4168, -3.7038], 12);
      }
    }
  }, [data, isActive, map]);
  return null;
}

// ──────────────────────────────────────────────────────────────────────────

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Custom markers for fountains and shelters
const fountainIcon = L.divIcon({
  html: `<div style="background-color: #0ea5e9; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">💧</div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const shelterIcon = L.divIcon({
  html: `<div style="background-color: #f97316; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">🏠</div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const MapComponent = forwardRef<MapHandle, MapComponentProps>(function MapComponent(
  { mergedData, refugios, fuentes, onBarrioSelect, routeResult, flyTarget, viewMode = 'vulnerability' },
  ref
) {
  const mapRef = useRef<L.Map | null>(null);

  useImperativeHandle(ref, () => ({
    flyToBarrio(lat: number, lon: number) {
      mapRef.current?.flyTo([lat, lon], 15, { duration: 1.2 });
    },
  }));

  const getPriorityColor = (d: number) =>
    d > 0.8 ? '#a50026' : d > 0.6 ? '#f46d43' : d > 0.4 ? '#fee08b' : '#1a9850';

  const getShelterDeficitColor = (count: number) =>
    count === 0 ? '#7f1d1d' : count === 1 ? '#ef4444' : count === 2 ? '#fb923c' : '#22c55e';

  const style = (feature: any) => {
    if (viewMode === 'shelter_deficit') {
      return {
        fillColor: getShelterDeficitColor(feature.properties.refugios_400m || 0),
        weight: 1, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7,
      };
    }
    return {
      fillColor: getPriorityColor(feature.properties.priority_score_norm || 0),
      weight: 1, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3, color: '#555', dashArray: '', fillOpacity: 0.9 });
        e.target.bringToFront();
      },
      mouseout: (e: any) => e.target.setStyle(style(feature)),
      click: () => onBarrioSelect(feature.properties.NOMBRE),
    });
    if (feature.properties) {
      const refugios = feature.properties.refugios_400m ?? 0;
      const tooltipContent = viewMode === 'shelter_deficit'
        ? `<strong>${feature.properties.NOMBRE}</strong><br>` +
          `Refugios a 400m: ${refugios}<br>` +
          `Estado: ${refugios === 0 ? 'CRÍTICO' : refugios === 1 ? 'Insuficiente' : 'Cubierto'}`
        : `<strong>${feature.properties.NOMBRE}</strong><br>` +
          `Índice: ${feature.properties.priority_score_norm?.toFixed(3) ?? 'N/A'}<br>` +
          `Mayores 65+: ${feature.properties.pop_65plus ?? 'N/A'}`;
      
      layer.bindTooltip(tooltipContent);
    }
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-[var(--ds-gray-100)] relative z-0">
      {/* NO key prop — never unmount the map, controllers handle view changes */}
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* View controllers */}
        <FlyController target={flyTarget} />
        <RouteViewController routeResult={routeResult} />
        <FitDataController data={mergedData} isActive={!routeResult && !flyTarget} />

        {/* ── Route mode ── */}
        {routeResult && (
          <>
            {/* Shortest route — grey dashed, renders first (below) */}
            <Polyline
              positions={routeResult.shortest_coords}
              color="#9ca3af"
              weight={4}
              opacity={0.6}
              dashArray="8 12"
            />
            {/* Comfort (Eco-Refugio) route — emerald solid, renders on top */}
            <Polyline
              positions={routeResult.comfort_coords}
              color="#10b981"
              weight={7}
              opacity={0.9}
            />
            {/* Inner line for Emerald route to give it a "path" feel */}
            <Polyline
              positions={routeResult.comfort_coords}
              color="#ecfdf5"
              weight={2}
              opacity={0.8}
            />
            <Marker position={routeResult.origin_latlon} icon={originIcon}>
              <Popup>📍 Origen: {routeResult.origin || 'Inicio'}</Popup>
            </Marker>
            <Marker position={routeResult.destination_latlon} icon={destIcon}>
              <Popup>🏁 Destino: {routeResult.destination || 'Fin'}</Popup>
            </Marker>

            {/* Nearby resources markers */}
            {routeResult.metrics?.comfort?.fuentes_pts?.map((pos: [number, number], idx: number) => (
              <Marker key={`fountain-${idx}`} position={pos} icon={fountainIcon}>
                <Popup>💧 Fuente de agua potable</Popup>
              </Marker>
            ))}
            {routeResult.metrics?.comfort?.refugios_pts?.map((pos: [number, number], idx: number) => (
              <Marker key={`shelter-${idx}`} position={pos} icon={shelterIcon}>
                <Popup>🏠 Refugio climático</Popup>
              </Marker>
            ))}
          </>
        )}

        {/* ── Vulnerability choropleth (only when no route active) ── */}
        {!routeResult && mergedData && (
          <GeoJSON key="barrios" data={mergedData} style={style} onEachFeature={onEachFeature} />
        )}

        {/* Refugios overlay */}
        {!routeResult && refugios?.features && (
          <GeoJSON
            key="refugios"
            data={refugios}
            pointToLayer={(_, latlng) =>
              L.circleMarker(latlng, {
                radius: 4, fillColor: '#0a72ef', color: '#fff',
                weight: 1, opacity: 1, fillOpacity: 0.85,
              })
            }
            onEachFeature={(feature, layer) =>
              layer.bindPopup(feature.properties?.title || feature.properties?.nombre || 'Refugio')
            }
          />
        )}
      </MapContainer>

      {/* Map legend for vulnerability/shelter deficit */}
      {!routeResult && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-[var(--ds-gray-100)] rounded-lg px-3 py-2 text-xs space-y-2 z-[1000] shadow-sm max-w-[180px]">
          <p className="font-bold text-[var(--ds-black)] mb-1">
            {viewMode === 'shelter_deficit' ? 'Déficit de Refugios' : 'Vulnerabilidad'}
          </p>
          <div className="space-y-1">
            {viewMode === 'shelter_deficit' ? (
              <>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#7f1d1d'}} /><span>0 refugios (Crítico)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#ef4444'}} /><span>1 refugio (Bajo)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#fb923c'}} /><span>2 refugios (Medio)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#22c55e'}} /><span>3+ refugios (Cubierto)</span></div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#a50026'}} /><span>Máxima prioridad</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#f46d43'}} /><span>Prioridad alta</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#fee08b'}} /><span>Prioridad media</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{backgroundColor: '#1a9850'}} /><span>Baja prioridad</span></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Map legend for routes */}
      {routeResult && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-[var(--ds-gray-100)] rounded-lg px-3 py-2 text-xs space-y-1 z-[1000] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-1.5 bg-[#10b981] rounded-full" />
            <span className="text-[var(--ds-black)] font-semibold">Ruta Eco-Refugio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-0.5 bg-[#9ca3af] border-t border-dashed border-[#9ca3af]" />
            <span className="text-[var(--ds-gray-500)]">Ruta Estándar</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default MapComponent;
