"use client";

import Link from "next/link";
import { ArrowLeft, ThermometerSun } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const datasets = [
  {
    name: "Modelo digital 3D de edificios",
    source: "Datos Abiertos Madrid / Geoportal",
    use: "Base geometrica para proyectar sombras de edificacion y construir la matriz calle-sombra.",
  },
  {
    name: "Arbolado en parques y zonas verdes de Madrid (detalle)",
    source: "Datos Abiertos Madrid",
    use: "Sombra biologica integrada en el peso de las aristas del grafo.",
  },
  {
    name: "Padron municipal",
    source: "Datos Abiertos Madrid",
    use: "Priorizacion territorial de mayores de 65 anos y publico beneficiario.",
  },
  {
    name: "Calidad del aire. Datos horarios desde 2001",
    source: "Datos Abiertos Madrid",
    use: "Indicador territorial de exposicion cronica por NO2.",
  },
  {
    name: "Fuentes de agua para beber",
    source: "Datos Abiertos Madrid",
    use: "Puntos de apoyo hidrico cercanos a las rutas.",
  },
  {
    name: "Bibliotecas de Madrid",
    source: "Datos Abiertos Madrid",
    use: "Refugios climaticos sustitutos.",
  },
  {
    name: "Deportes. Centros Deportivos Municipales (Polideportivos)",
    source: "Datos Abiertos Madrid",
    use: "Refugios climaticos sustitutos.",
  },
  {
    name: "Barrios municipales de Madrid",
    source: "Datos Abiertos Madrid",
    use: "Delimitacion territorial y agregacion de indicadores por barrio.",
  },
  {
    name: "Distritos municipales de Madrid",
    source: "Datos Abiertos Madrid",
    use: "Contexto administrativo y navegacion territorial.",
  },
];

export default function MetodologiaPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-[rgba(255,255,255,0.8)] px-6 py-4 shadow-[var(--shadow-border)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ThermometerSun className="h-6 w-6 text-[var(--ds-black)]" />
          <span className="font-sans font-semibold tracking-tight text-[var(--ds-black)]">Madrid Refugio</span>
        </div>
        <Link href="/">
          <Button variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al mapa
          </Button>
        </Link>
      </nav>

      <div className="mx-auto max-w-[800px] px-6 py-16 sm:py-24">
        <h1 className="display-hero mb-8 text-[var(--ds-black)]">Memoria tecnica</h1>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">1. Introduccion y propuesta de valor</h2>
          <p className="mb-4 text-[var(--ds-gray-600)]">
            <strong>Madrid Refugio</strong> calcula rutas de confort termico para reducir la exposicion al sol directo durante episodios de calor. La interfaz es publica y sencilla, pero el uso principal del sistema es municipal: detectar donde faltan refugios climaticos, sombra e inversion primero.
          </p>
          <p className="text-[var(--ds-gray-600)]">
            El proyecto se orienta especialmente a los mas de <strong>430.000 mayores de 65 anos</strong> que viven en Madrid. Frente a los mapas estaticos de isla de calor, aqui se comparan rutas reales y se mide cuanto sol directo se evita a cambio de un rodeo pequeno.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">2. Innovacion tecnologica: motor de sombra dinamica proyectada</h2>
          <p className="mb-6 text-[var(--ds-gray-600)]">
            El sistema calcula sombra proyectada por edificacion y la combina con arbolado viario en el peso de cada tramo del grafo peatonal.
          </p>
          <div className="space-y-4">
            <Card level={1} className="border-l-4 border-l-[#0a72ef] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Modelo de alturas de edificacion</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Procesamiento de <strong>662.173 poligonos</strong> con altura real para proyectar sombra sobre la red peatonal.
              </p>
            </Card>
            <Card level={1} className="border-l-4 border-l-[#de1d8d] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Proyeccion geometrica solar</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Uso de <code className="rounded bg-[var(--ds-gray-50)] px-1 py-0.5 text-xs">pvlib</code> y{" "}
                <code className="rounded bg-[var(--ds-gray-50)] px-1 py-0.5 text-xs">pybdshadow</code> para calcular azimut y elevacion solar sobre Madrid en 13 franjas horarias.
              </p>
            </Card>
            <Card level={1} className="border-l-4 border-l-[#ff5b4f] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Matriz calle-sombra</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Generacion offline de una matriz de <strong>520.128 aristas x 13 franjas horarias</strong> para ajustar pesos en microsegundos segun la hora elegida.
              </p>
            </Card>
            <Card level={1} className="border-l-4 border-l-[#16a34a] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Confort termico sobre grafo</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Cada arista usa un <code className="rounded bg-[var(--ds-gray-50)] px-1 py-0.5 text-xs">comfort_weight</code> que suma sombra de edificacion y arbolado con tope, priorizando calles mas protegidas sin perder conectividad peatonal.
              </p>
            </Card>
          </div>
          <div className="mt-8 space-y-4 text-[var(--ds-gray-600)]">
            <p>
              El calculo de rutas es <strong>determinista</strong> y no depende de datos externos. La hora seleccionada por el usuario activa una franja precomputada y el backend resuelve la ruta con Dijkstra sobre el grafo ponderado.
            </p>
            <p>
              El widget meteorologico consulta <strong>AEMET OpenData</strong> solo para mostrar contexto termico actual en Madrid, con cache de 15 minutos. No altera la geometria solar ni el resultado del routing.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">3. Reutilizacion de datos abiertos</h2>
          <p className="mb-6 text-[var(--ds-gray-600)]">
            La base del proyecto son datos abiertos municipales reutilizados de forma operativa, no solo descriptiva.
          </p>
          <div className="overflow-hidden rounded-lg border border-[var(--ds-gray-100)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--ds-gray-100)] bg-[var(--ds-gray-50)] text-[var(--ds-gray-500)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Conjunto de datos</th>
                  <th className="px-4 py-3 font-medium">Fuente</th>
                  <th className="px-4 py-3 font-medium">Uso en Madrid Refugio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ds-gray-100)] text-[var(--ds-black)]">
                {datasets.map((dataset) => (
                  <tr key={dataset.name}>
                    <td className="px-4 py-3 font-medium">{dataset.name}</td>
                    <td className="px-4 py-3 text-[var(--ds-gray-600)]">{dataset.source}</td>
                    <td className="px-4 py-3 text-[var(--ds-gray-600)]">{dataset.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[var(--ds-gray-600)]">
            Los conjuntos estructurales provienen de <strong>datos.madrid.es</strong>. AEMET OpenData se utiliza solo como fuente oficial de contexto meteorologico en tiempo real.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">4. Impacto social y acceso equitativo a rutas con sombra</h2>
          <div className="space-y-4 text-[var(--ds-gray-600)]">
            <p>
              El analisis territorial senala barrios con una combinacion especialmente critica de edad, calor y deficit de cobertura. <strong>Villaverde y Aluche</strong> destacan como zonas prioritarias para la intervencion municipal.
            </p>
            <p>
              La utilidad publica del sistema es directa: <strong>64,1 % de los barrios</strong> no tienen un refugio climatico operativo a menos de 300 metros caminables. Madrid Refugio ayuda a decidir donde conviene desplegar sombra, equipamientos y refugios primero.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">5. Escalabilidad y arquitectura</h2>
          <div className="space-y-4 text-[var(--ds-gray-600)]">
            <p>
              La arquitectura modular separa frontend, backend y motor algoritmico. Esa estructura permite replicar el sistema en otros municipios con datasets equivalentes.
            </p>
            <p>
              La version operativa actual ya cubre los <em>21 distritos de Madrid</em>. El siguiente salto tecnico es migrar el routing a <strong>PostgreSQL + PostGIS con pgRouting</strong> para manejar millones de aristas con el mismo esquema de precomputacion en Parquet y reducir tiempos de carga en produccion.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">6. Conclusion</h2>
          <p className="text-[var(--ds-gray-600)]">
            Madrid Refugio convierte datos abiertos en una herramienta operativa de salud publica. Ya permite comparar rutas, medir minutos menos al sol y priorizar inversion climatica donde el deficit es medible.
          </p>
        </section>

        <div className="border-t border-[var(--ds-gray-100)] pt-8 text-center">
          <Link href="/">
            <Button variant="primary" className="h-12 px-8 text-base">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al mapa
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
