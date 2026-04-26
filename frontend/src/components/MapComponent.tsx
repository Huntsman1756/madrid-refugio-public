"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { ClimateRouteBadge, ClimateShelterIcon, OrganicTree, WaterFountainIcon } from './branding/HomeVisuals';

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
  showAreaLegend?: boolean;
  showHeatmap?: boolean;
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

function HeatLayerController({ enabled, points }: { enabled: boolean; points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || points.length === 0) {
      return;
    }

    const heatLayer = (L as any).heatLayer(points, {
      radius: 22,
      blur: 18,
      maxZoom: 16,
      gradient: {
        0.2: '#fdebd0',
        0.45: 'var(--climate-terracotta)',
        0.7: '#e67e22',
        1: '#c0392b',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [enabled, map, points]);

  return null;
}

function createClusterIcon(count: number, background: string, label: string) {
  return L.divIcon({
    html: `<div aria-label="${label}: ${count}" style="width: 36px; height: 36px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: ${background}; color: #fff; border: 2px solid rgba(255,255,255,0.92); box-shadow: 0 12px 24px rgba(15,23,42,0.24); font-size: 12px; font-weight: 700;">${count}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function RouteResourceClusterController({
  fountainPoints,
  shelterPoints,
}: {
  fountainPoints: [number, number][];
  shelterPoints: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    let active = true;
    const layers: L.Layer[] = [];

    async function mountClusters() {
      if (fountainPoints.length === 0 && shelterPoints.length === 0) {
        return;
      }

      await import('leaflet.markercluster');

      if (!active) {
        return;
      }

      if (fountainPoints.length > 0) {
        const fountainClusterGroup = (L as any).markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          maxClusterRadius: 42,
          iconCreateFunction: (cluster: any) => createClusterIcon(cluster.getChildCount(), '#1a6fa8', 'Fuentes agrupadas'),
        });

        fountainPoints.forEach((point: [number, number]) => {
          fountainClusterGroup.addLayer(L.marker(point, { icon: fountainIcon }).bindPopup('Fuente de agua potable'));
        });

        map.addLayer(fountainClusterGroup);
        layers.push(fountainClusterGroup);
      }

      if (shelterPoints.length > 0) {
        const shelterClusterGroup = (L as any).markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          maxClusterRadius: 42,
          iconCreateFunction: (cluster: any) => createClusterIcon(cluster.getChildCount(), '#c0392b', 'Refugios agrupados'),
        });

        shelterPoints.forEach((point: [number, number]) => {
          shelterClusterGroup.addLayer(L.marker(point, { icon: shelterIcon }).bindPopup('Refugio climático'));
        });

        map.addLayer(shelterClusterGroup);
        layers.push(shelterClusterGroup);
      }
    }

    mountClusters();

    return () => {
      active = false;
      layers.forEach((layer) => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    };
  }, [fountainPoints, map, shelterPoints]);

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
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function createResourceIcon(svg: string, background: string, border: string) {
  return L.divIcon({
    html: `<div style="width: 28px; height: 28px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: ${background}; color: white; border: 2px solid ${border}; box-shadow: 0 10px 20px rgba(15,23,42,0.22);">${svg}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const fountainIcon = createResourceIcon(
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s-5 6.3-5 10a5 5 0 0 0 10 0c0-3.7-5-10-5-10Z"/><path d="M9.5 15.5c.8 1 1.6 1.5 2.5 1.5 1 0 1.8-.5 2.5-1.5"/></svg>',
  '#1a6fa8',
  'rgba(255,255,255,0.92)'
);
const shelterIcon = createResourceIcon(
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 9-7 9 7"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-5h6v5"/></svg>',
  '#c0392b',
  'rgba(255,255,255,0.92)'
);
function renderSvgToString(markup: string) {
  return markup.replace(/\n\s*/g, '');
}

const brandedTreeIcon = createResourceIcon(
  renderSvgToString('<svg width="16" height="20" viewBox="0 0 28 36" fill="none" aria-hidden="true"><ellipse cx="14" cy="31.5" rx="8.5" ry="3.5" fill="#00000020"/><path d="M14 18.5v10.5" stroke="#8b5e3c" stroke-width="4" stroke-linecap="round"/><path d="M14.7 4.4c3.6 0 6.5 1.4 8.3 3.9 3.1.3 5.3 2.8 5.3 5.9 0 3.3-2.5 5.8-5.7 6.1-.7 3.3-3.7 5.6-7.5 5.6-4.4 0-7.5-1.6-9.8-4.6C2.6 20.6.6 18.2.6 14.8c0-3.5 2.6-6.2 6.1-6.4C8.6 5.9 11.3 4.4 14.7 4.4Z" fill="var(--climate-green)"/><path d="M11.1 6.7c2.7 0 4.8 1 6.2 2.8 2.3.2 3.8 2 3.8 4.2 0 2.5-1.8 4.1-4.1 4.3-.6 2.3-2.8 3.8-5.4 3.8-3 0-5.2-1.1-6.8-3.2-1.8-.5-3.1-2.2-3.1-4.5 0-2.4 1.8-4.3 4.2-4.4 1.2-1.9 3-3 5.2-3Z" fill="var(--climate-green)"/></svg>'),
  '#f3fbf5',
  'rgba(255,255,255,0.92)'
);

function resourcePointStyle(fillColor: string, radius: number) {
  return {
    radius,
    fillColor,
    color: '#fffdfa',
    weight: 1.5,
    opacity: 1,
    fillOpacity: 0.92,
  };
}

const MapComponent = forwardRef<MapHandle, MapComponentProps>(function MapComponent(
  { mergedData, refugios, fuentes, onBarrioSelect, routeResult, flyTarget, viewMode = 'vulnerability', showAreaLegend = true, showHeatmap = false },
  ref
) {
  const mapRef = useRef<L.Map | null>(null);
  const routeShadeMarkers: [number, number][] = routeResult?.comfort_coords?.filter((_: [number, number], index: number, coords: [number, number][]) => {
    if (coords.length <= 10) {
      return true;
    }

    const markerCount = 6;
    const firstIndex = Math.floor(coords.length * 0.12);
    const lastIndex = Math.ceil(coords.length * 0.88);
    const usableLength = Math.max(1, lastIndex - firstIndex);
    const step = Math.max(1, Math.floor(usableLength / markerCount));

    return index >= firstIndex && index <= lastIndex && (index - firstIndex) % step === 0;
  }).slice(0, 6) ?? [];
  const heatmapPoints: [number, number, number][] = routeResult?.comfort_coords?.map((point: [number, number], index: number) => {
    const progress = routeResult.comfort_coords.length <= 1 ? 1 : index / (routeResult.comfort_coords.length - 1);
    const weight = 0.35 + (1 - progress) * 0.55;
    return [point[0], point[1], Number(weight.toFixed(2))];
  }) ?? [];

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
          `Estado: ${refugios === 0 ? 'CRÍTICO' : refugios === 1 ? 'Insuficiente' : 'Cubierto'}<br>` +
          `<em>Mapa territorial agregado</em>`
        : `<strong>${feature.properties.NOMBRE}</strong><br>` +
          `Índice territorial: ${feature.properties.priority_score_norm?.toFixed(3) ?? 'N/A'}<br>` +
          `Mayores 65+: ${feature.properties.pop_65plus ?? 'N/A'}<br>` +
          `<em>No representa sombra instantánea</em>`;
      
      layer.bindTooltip(tooltipContent, { 
        className: 'carto-tooltip',
        direction: 'top',
        offset: [0, -10],
        opacity: 1
      });
    }
  };

  return (
    <div className="relative z-0 h-full w-full overflow-hidden rounded-lg border border-[var(--ds-gray-200)] bg-[var(--ds-gray-50)] shadow-sm">
      {/* NO key prop — never unmount the map, controllers handle view changes */}
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* View controllers */}
        <FlyController target={flyTarget} />
        <RouteViewController routeResult={routeResult} />
        <FitDataController data={mergedData} isActive={!routeResult && !flyTarget} />
        <HeatLayerController enabled={Boolean(routeResult && showHeatmap)} points={heatmapPoints} />
        <RouteResourceClusterController
          fountainPoints={routeResult?.metrics?.comfort?.fuentes_pts ?? []}
          shelterPoints={routeResult?.metrics?.comfort?.refugios_pts ?? []}
        />

        {/* ── Route mode ── */}
        {routeResult && (
          <>
            {/* Shortest route — grey dashed, renders first (below) */}
            <Polyline
              positions={routeResult.shortest_coords}
              color="var(--ds-gray-400)"
              weight={4}
              opacity={0.6}
              dashArray="8 12"
            />
            {/* Comfort (Eco-Refugio) route — green solid, renders on top */}
            <Polyline
              positions={routeResult.comfort_coords}
              color="var(--climate-green)"
              weight={7}
              opacity={0.9}
            />
            {/* Inner line for Green route to give it a "path" feel */}
            <Polyline
              positions={routeResult.comfort_coords}
              color="var(--ds-white)"
              weight={2}
              opacity={0.8}
            />
            <Marker position={routeResult.origin_latlon} icon={originIcon}>
              <Popup>📍 Origen: {routeResult.origin || 'Inicio'}</Popup>
            </Marker>
            <Marker position={routeResult.destination_latlon} icon={destIcon}>
              <Popup>🏁 Destino: {routeResult.destination || 'Fin'}</Popup>
            </Marker>

            {routeShadeMarkers.map((pos: [number, number], idx: number) => (
              <Marker key={`tree-${idx}`} position={pos} icon={brandedTreeIcon}>
                <Popup>Zona arbolada o tramo de sombra acumulada</Popup>
              </Marker>
            ))}
          </>
        )}

        {/* ── Vulnerability choropleth (only when no route active) ── */}
        {!routeResult && mergedData && (
          <GeoJSON key="barrios" data={mergedData} style={style} onEachFeature={onEachFeature} />
        )}

      </MapContainer>

      {/* Map legend for vulnerability/shelter deficit */}
      {!routeResult && mergedData && showAreaLegend && (
        <div className="absolute bottom-3 left-3 z-[1000] max-w-[190px] space-y-2 rounded-lg border border-[rgba(91,84,74,0.08)] bg-[rgba(255,253,250,0.92)] px-3 py-3 text-xs shadow-[0_14px_28px_rgba(31,26,23,0.10)] backdrop-blur-sm">
          <p className="font-bold text-[var(--ds-black)] mb-1">
            {viewMode === 'shelter_deficit' ? 'Acceso a refugios' : 'Vulnerabilidad climática'}
          </p>
          <p className="text-[10px] leading-relaxed text-[var(--ds-gray-500)]">
            {viewMode === 'shelter_deficit' ? 'Mapa por barrio de acceso a refugios.' : 'Mapa por barrio, no sombra en tiempo real.'}
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
        <div className="absolute bottom-3 left-3 z-[1000] space-y-2 rounded-lg border border-[rgba(91,84,74,0.08)] bg-[rgba(255,253,250,0.92)] px-3 py-3 text-xs shadow-[0_14px_28px_rgba(31,26,23,0.10)] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <ClimateRouteBadge className="h-5 w-9" />
            <span className="text-[var(--ds-black)] font-semibold">Ruta con alivio climático</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-0.5 bg-[#9ca3af] border-t border-dashed border-[#9ca3af]" />
            <span className="text-[var(--ds-gray-500)]">Ruta estándar</span>
          </div>
          <div className="border-t border-[rgba(91,84,74,0.08)] pt-2 text-[10px] text-[var(--ds-gray-500)]">
            <div className="mb-1 flex items-center gap-2"><WaterFountainIcon className="h-4 w-4" /> {routeResult.metrics?.comfort?.fuentes ?? 0} fuentes cerca</div>
            <div className="mb-1 flex items-center gap-2"><ClimateShelterIcon className="h-4 w-4" /> {routeResult.metrics?.comfort?.refugios ?? 0} refugios cerca</div>
            <div className="flex items-center gap-2"><OrganicTree testId="route-legend-tree" className="h-5 w-4" /> sombra y arbolado en ruta</div>
            {showHeatmap ? <div className="mt-2 rounded bg-[rgba(230,126,34,0.12)] px-2 py-1 text-[#c0392b]">Capa térmica superpuesta</div> : null}
          </div>
        </div>
      )}
    </div>
  );
});

export default MapComponent;
