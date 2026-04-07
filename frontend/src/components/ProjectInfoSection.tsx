import { Card } from "@/components/ui/Card";
import { Database, FileText, BarChart3, TreePine, MapIcon, Activity } from "lucide-react";

export default function ProjectInfoSection() {
  return (
    <div className="mb-24">
      <div className="mb-12 border-b border-[var(--ds-gray-100)] pb-6">
        <h2 className="sub-heading-large text-[var(--ds-black)]">3. Memoria del Proyecto y Datos Abiertos</h2>
        <p className="text-[var(--ds-gray-600)] mt-2">Transparencia metodológica y fuentes de datos del concurso.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-1 space-y-6">
          <h3 className="text-xl font-semibold text-[var(--ds-black)] tracking-tight">Propuesta de Valor</h3>
          <p className="text-[var(--ds-gray-600)] leading-relaxed">
            Madrid Refugio ayuda a decidir la ruta más fresca y segura en episodios de calor y mala calidad del aire. Usando 10 datasets del portal de datos abiertos del Ayuntamiento de Madrid, más OpenStreetMap y el informe Greenpeace 2025, calcula rutas peatonales que maximizan la sombra del arbolado viario y la proximidad a fuentes y refugios sustitutos.
          </p>
          <p className="text-[var(--ds-gray-600)] leading-relaxed">
            El resultado es doble: una herramienta ciudadana para caminar con menor disconfort y un mapa de intervención para orientar nuevas políticas de refugio climático.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Card level={2} className="p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#fef2f2] flex items-center justify-center text-[#ff5b4f] shrink-0">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-semibold text-[var(--ds-black)] mb-1">Déficit de Refugios</span>
                <span className="block text-sm text-[var(--ds-gray-600)]">84 barrios (64.1%) no tienen ningún refugio a menos de 300m. 62 barrios a menos de 400m.</span>
              </div>
            </Card>
            
            <Card level={2} className="p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#ebf5ff] flex items-center justify-center text-[#0a72ef] shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-semibold text-[var(--ds-black)] mb-1">Vulnerabilidad Crítica</span>
                <span className="block text-sm text-[var(--ds-gray-600)]">Aluche tiene 19.121 mayores de 65 años y 0 refugios. Villaverde Alto es el más vulnerable por escala.</span>
              </div>
            </Card>

            <Card level={2} className="p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#fdf2f8] flex items-center justify-center text-[#de1d8d] shrink-0">
                <TreePine className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-semibold text-[var(--ds-black)] mb-1">Volumen de Datos</span>
                <span className="block text-sm text-[var(--ds-gray-600)]">131 barrios, 661.192 árboles viarios geolocalizados, 2.270 fuentes y 24 estaciones de calidad del aire.</span>
              </div>
            </Card>

            <Card level={2} className="p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--ds-gray-100)] flex items-center justify-center text-[var(--ds-gray-600)] shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-semibold text-[var(--ds-black)] mb-1">Contexto Global</span>
                <span className="block text-sm text-[var(--ds-gray-600)]">Madrid ofrece 1 refugio oficial por cada 110.100 hab. Barcelona ofrece 1 por cada 4.200 (Greenpeace).</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-[var(--shadow-card-subtle)] border border-[var(--ds-gray-100)] overflow-hidden bg-white">
        <div className="p-5 border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--ds-gray-500)]" />
          <h3 className="font-semibold text-[var(--ds-black)]">Inventario de Datasets Abiertos Utilizados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--ds-gray-100)] text-[var(--ds-gray-500)]">
              <tr>
                <th className="px-5 py-3 font-medium">Dataset</th>
                <th className="px-5 py-3 font-medium">Formato</th>
                <th className="px-5 py-3 font-medium">Uso en el proyecto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-gray-700)]">
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Arbolado viario / detalle de arbolado</td>
                <td className="px-5 py-3"><span className="mono-label">XLSX</span></td>
                <td className="px-5 py-3">Base del shade routing y densidad arbórea por barrio</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Bibliotecas, C. Culturales y Polideportivos</td>
                <td className="px-5 py-3"><span className="mono-label">GeoJSON</span></td>
                <td className="px-5 py-3">Sustituto operativo de refugios climáticos ante falta de red oficial</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Fuentes de agua potable</td>
                <td className="px-5 py-3"><span className="mono-label">CSV</span></td>
                <td className="px-5 py-3">Puntos de agua en rutas peatonales y mapa territorial</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Calidad del aire histórico 2024 / Estaciones</td>
                <td className="px-5 py-3"><span className="mono-label">ZIP CSV</span></td>
                <td className="px-5 py-3">Series horarias y cálculo de NO2 medio interpolado (IDW)</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Padrón municipal por edad</td>
                <td className="px-5 py-3"><span className="mono-label">CSV</span></td>
                <td className="px-5 py-3">Población &gt;65 años (grupo de riesgo) por barrio</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Límites de barrios</td>
                <td className="px-5 py-3"><span className="mono-label">Shapefile</span></td>
                <td className="px-5 py-3">Unidad territorial de análisis, superando la escala de Distrito</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">Alturas de Edificios (LiDAR / Geoportal)</td>
                <td className="px-5 py-3"><span className="mono-label">SHP</span></td>
                <td className="px-5 py-3">Simulación física 4D de sombras proyectadas según posición solar</td>
              </tr>
              <tr>
                <td className="px-5 py-3 font-medium text-[var(--ds-black)]">OpenStreetMap</td>
                <td className="px-5 py-3"><span className="mono-label">OSM XML</span></td>
                <td className="px-5 py-3">Grafo de red viaria peatonal para routing de confort térmico</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}