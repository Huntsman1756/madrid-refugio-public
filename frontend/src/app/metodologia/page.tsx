"use client";

import Link from "next/link";
import { ArrowLeft, ThermometerSun } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const datasets = [
  {
    name: "Modelo digital 3D de edificios",
    source: "Datos Abiertos Madrid / Geoportal",
    use: "Base geométrica para proyectar sombras de edificación y construir la matriz calle-sombra.",
  },
  {
    name: "Arbolado en parques y zonas verdes de Madrid (detalle)",
    source: "Datos Abiertos Madrid",
    use: "Sombra biológica integrada en el peso de las aristas del grafo a partir del detalle de arbolado viario y zonas verdes.",
  },
  {
    name: "Padrón municipal",
    source: "Datos Abiertos Madrid",
    use: "Priorización territorial de mayores de 65 años y público beneficiario.",
  },
  {
    name: "Calidad del aire. Datos horarios desde 2001",
    source: "Datos Abiertos Madrid",
    use: "Indicador territorial de exposición crónica por NO2.",
  },
  {
    name: "Fuentes de agua para beber",
    source: "Datos Abiertos Madrid",
    use: "Puntos de apoyo hídrico cercanos a las rutas.",
  },
  {
    name: "Bibliotecas de Madrid",
    source: "Datos Abiertos Madrid",
    use: "Refugios climáticos sustitutos.",
  },
  {
    name: "Deportes. Centros Deportivos Municipales (Polideportivos)",
    source: "Datos Abiertos Madrid",
    use: "Refugios climáticos sustitutos.",
  },
  {
    name: "Barrios municipales de Madrid",
    source: "Datos Abiertos Madrid",
    use: "Delimitación territorial y agregación de indicadores por barrio.",
  },
  {
    name: "Distritos municipales de Madrid",
    source: "Datos Abiertos Madrid",
    use: "Contexto administrativo y navegación territorial.",
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
        <h1 className="display-hero mb-8 text-[var(--ds-black)]">Memoria técnica</h1>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">1. Introducción y propuesta de valor</h2>
          <p className="mb-4 text-[var(--ds-gray-600)]">
            <strong>Madrid Refugio</strong> calcula rutas de confort térmico para reducir la exposición al sol directo durante episodios de calor. Funciona en dos pasos desde cualquier navegador, pero el uso principal del sistema es municipal: detectar dónde faltan refugios climáticos, sombra e inversión primero.
          </p>
          <p className="text-[var(--ds-gray-600)]">
            El proyecto se orienta especialmente a los más de <strong>430.000 mayores de 65 años</strong> que viven en Madrid. Frente a los mapas estáticos de temperatura superficial, aquí se comparan rutas reales y se mide cuánto sol directo se evita a cambio de un rodeo pequeño.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">2. Innovación tecnológica: motor de sombra dinámica proyectada</h2>
          <p className="mb-6 text-[var(--ds-gray-600)]">
            El sistema calcula sombra proyectada por edificación y la combina con arbolado viario en el peso de cada tramo del grafo peatonal.
          </p>
          <div className="space-y-4">
            <Card level={1} className="border-l-4 border-l-[#0a72ef] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Modelo de alturas de edificación</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Procesamiento de <strong>662.173 polígonos</strong> con altura real para proyectar sombra sobre la red peatonal.
              </p>
            </Card>
            <Card level={1} className="border-l-4 border-l-[#de1d8d] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Proyección geométrica solar</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Uso de <code className="rounded bg-[var(--ds-gray-50)] px-1 py-0.5 text-xs">pvlib</code> y{" "}
                <code className="rounded bg-[var(--ds-gray-50)] px-1 py-0.5 text-xs">pybdshadow</code> para calcular azimut y elevación solar sobre Madrid en 13 franjas horarias.
              </p>
            </Card>
            <Card level={1} className="border-l-4 border-l-[#ff5b4f] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Matriz calle-sombra</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Generación offline de una matriz de <strong>520.128 aristas × 13 franjas horarias</strong> para ajustar pesos en microsegundos según la hora elegida.
              </p>
            </Card>
            <Card level={1} className="border-l-4 border-l-[#16a34a] p-5">
              <h3 className="mb-1 text-sm font-semibold text-[var(--ds-black)]">Confort térmico sobre grafo</h3>
              <p className="text-sm text-[var(--ds-gray-600)]">
                Cada arista usa un <code className="rounded bg-[var(--ds-gray-50)] px-1 py-0.5 text-xs">comfort_weight</code> que suma sombra de edificación y arbolado con tope, priorizando calles más protegidas sin perder conectividad peatonal.
              </p>
            </Card>
          </div>
          <div className="mt-8 space-y-4 text-[var(--ds-gray-600)]">
            <p>
              El cálculo de rutas es <strong>determinista</strong> y no depende de datos externos. La hora seleccionada por el usuario activa una franja precomputada y el backend resuelve la ruta con Dijkstra sobre el grafo ponderado.
            </p>
            <p>
              El widget meteorológico consulta <strong>AEMET OpenData</strong> solo para mostrar contexto térmico actual en Madrid, con caché de 15 minutos. No altera la geometría solar ni el resultado del routing.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">3. Reutilización de datos abiertos</h2>
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
            Los conjuntos estructurales provienen de <strong>datos.madrid.es</strong>. AEMET OpenData se utiliza solo como fuente oficial de contexto meteorológico en tiempo real.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">4. Impacto social y acceso equitativo a rutas con sombra</h2>
          <div className="space-y-4 text-[var(--ds-gray-600)]">
            <p>
              El análisis territorial señala barrios con una combinación especialmente crítica de edad, calor y déficit de cobertura. <strong>Villaverde y Aluche</strong> destacan como zonas prioritarias para la intervención municipal.
            </p>
            <p>
              La utilidad pública del sistema es directa: <strong>64,1 % de los barrios</strong> no tienen un refugio climático operativo a menos de 300 metros caminables. Madrid Refugio ayuda a decidir dónde conviene desplegar sombra, equipamientos y refugios primero.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">5. Escalabilidad y arquitectura</h2>
          <div className="space-y-4 text-[var(--ds-gray-600)]">
            <p>
              La versión operativa actual ya cubre los <em>21 distritos de Madrid</em>. El sistema está diseñado para escalar a <strong>PostgreSQL + PostGIS con pgRouting</strong> sin cambios en el esquema de precomputación en Parquet, manteniendo la misma lógica de pesos y franjas horarias en escenarios de mayor escala.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="sub-heading-large mb-4 text-[var(--ds-black)]">6. Conclusión</h2>
          <p className="text-[var(--ds-gray-600)]">
            Madrid Refugio convierte datos abiertos en una herramienta operativa de salud pública. Ya permite comparar rutas, medir minutos menos al sol y priorizar inversión climática donde el déficit es medible.
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
