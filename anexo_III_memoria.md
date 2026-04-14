# Anexo III: memoria técnica - Madrid Refugio

## 1. Introducción y propuesta de valor

### URLs públicas del proyecto

- **Aplicación pública:** [https://madrid-refugio.vercel.app/](https://madrid-refugio.vercel.app/)
- **Repositorio público:** [https://github.com/Huntsman1756/madrid-refugio](https://github.com/Huntsman1756/madrid-refugio)
- **Artefactos de datos y release estable:** [https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4)

**Madrid Refugio** es un motor de simulación climática urbana diseñado para proteger a la población más vulnerable de la capital frente a la temperatura superficial elevada y los episodios de calor extremo. El beneficiario principal son los más de 430.000 mayores de 65 años que viven en Madrid.

El uso directo de la herramienta está pensado para cuidadores, familiares, servicios sociales y planificadores urbanos que calculan rutas o priorizan intervenciones en apoyo de personas mayores. La interfaz es pública, pero el valor central del sistema es ayudar a decidir dónde conviene desplegar refugios, sombra e inversión primero, con datos de población, exposición y cobertura real.

## 2. Innovación tecnológica: motor de sombra dinámica proyectada

Madrid Refugio calcula **sombra dinámica proyectada por edificación** y la combina con arbolado viario en el peso de cada tramo:

- **Modelo de alturas de edificación:** Procesamiento de 662.173 polígonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyección geométrica solar:** Integración de las bibliotecas `pvlib` y `pybdshadow` para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar).
- **Matriz de intersección calle-sombra:** Generación offline de una matriz de 520.128 aristas × 13 franjas horarias (08:00 a 20:00). El algoritmo ajusta el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.
- **Optimización de confort térmico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que suma sombra de edificación y arbolado con tope, permitiendo desvíos inteligentes hacia calles con mayor confort térmico.

### Simulación temporal de sombras

La posición del sol se calcula mediante geometría esférica estándar (azimut y elevación solar) en función de la hora del día y las coordenadas de Madrid (40,4 grados norte). El cálculo de rutas es completamente determinista y no depende de datos externos. El widget meteorológico consulta AEMET OpenData en tiempo real para mostrar contexto térmico actual, con caché de 15 minutos.

Los pesos de sombra se precomputan para 13 franjas horarias (08:00 a 20:00) y se almacenan en la matriz Parquet. En tiempo de ejecución, el backend inyecta los pesos correspondientes a la franja seleccionada por el usuario antes de ejecutar el algoritmo de Dijkstra.

La métrica de sombra es geométrica, no fisiológica: mide sombra acumulada a lo largo del recorrido, pero no incorpora pendiente, distancia total caminada ni condición física individual. Es una limitación conocida del modelo actual y una línea clara de mejora para futuras versiones orientadas a esfuerzo peatonal y vulnerabilidad personalizada.

## 3. Reutilización de datos abiertos

Hemos integrado conjuntos de datos del ecosistema de datos de Madrid con sus títulos oficiales en el portal:
1. **Modelo digital 3D de edificios:** Geoportal del Ayuntamiento de Madrid. 662.173 polígonos con atributo Z (altura real). Base para la simulación de sombras.
2. **Arbolado en parques y zonas verdes de Madrid (detalle):** 661.192 ejemplares geolocalizados reutilizados como sombra biológica. El dataset incluye arbolado viario y arbolado en zonas verdes municipales.
3. **Padrón municipal:** Población por barrio, distrito y sección censal agregada por sexo y edad. Base para identificar mayores de 65 años.
4. **Calidad del aire. Datos horarios desde 2001:** Series históricas de NO2 para análisis territorial.
5. **Fuentes de agua para beber:** Puntos de apoyo hídrico integrados en el algoritmo de proximidad.
6. **Bibliotecas de Madrid:** Equipamientos reutilizados como refugios climáticos sustitutos.
7. **Deportes. Centros Deportivos Municipales (Polideportivos):** Equipamientos reutilizados como refugios climáticos sustitutos.
8. **Barrios municipales de Madrid:** Geometría oficial para agregación territorial.
9. **Distritos municipales de Madrid:** Geometría administrativa oficial de los 21 distritos.

### Relación de conjuntos de datos utilizados

| Conjunto de datos | Portal / fuente | Uso en Madrid Refugio |
|---|---|---|
| **Modelo digital 3D de edificios** | Portal de Datos Abiertos del Ayuntamiento de Madrid / Geoportal | Base geométrica para proyectar sombras de edificación y construir la matriz calle-sombra |
| **Arbolado en parques y zonas verdes de Madrid (detalle)** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Integración de sombra biológica en el peso de las aristas del grafo. Se reutiliza su detalle de arbolado viario y zonas verdes |
| **Padrón municipal** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Identificación del público beneficiario y priorización territorial de mayores de 65 años |
| **Calidad del aire. Datos horarios desde 2001** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Cálculo del indicador territorial de exposición crónica por NO2 |
| **Fuentes de agua para beber** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Localización de puntos de apoyo hídrico en las rutas |
| **Bibliotecas de Madrid** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Identificación de refugios climáticos sustitutos |
| **Deportes. Centros Deportivos Municipales (Polideportivos)** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Identificación de refugios climáticos sustitutos |
| **Barrios municipales de Madrid** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Delimitación territorial del análisis y agregación de indicadores por barrio |
| **Distritos municipales de Madrid** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Contexto administrativo del mapa y navegación territorial |

Todos los conjuntos estructurales provienen de `datos.madrid.es`. AEMET OpenData se utiliza únicamente como fuente oficial de contexto meteorológico en tiempo real para el widget informativo.

### Datos de NO2

Los valores de contaminación por dióxido de nitrógeno provienen del dataset histórico de la Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (datos.madrid.es). Se utilizan medias anuales por estación, suficientes para identificar patrones estructurales de exposición crónica en los barrios. La integración de lecturas en tiempo real es una extensión prevista del sistema.

## 4. Impacto social y justicia térmica

El análisis territorial ha revelado realidades críticas: **Villaverde y Aluche** emergen como zonas de máxima prioridad por su combinación de población envejecida y déficit de infraestructura de refugio. Madrid Refugio proporciona a los planificadores urbanos una hoja de ruta basada en datos para la creación de la red oficial de refugios climáticos.

### Utilidad pública para Madrid

Madrid Refugio responde a una necesidad municipal concreta:

- **Más de 430.000 mayores de 65 años** viven en Madrid y son el grupo más expuesto a la mortalidad asociada al calor extremo.
- **64,1 % de los barrios** no cuentan con un refugio climático operativo a menos de 300 metros caminables.
- El motor calcula rutas sobre **520.128 aristas** y combina **662.173 polígonos LiDAR** con **661.192 árboles** para estimar confort térmico calle a calle en el despliegue operativo actual.
- El resultado no es solo informativo: permite priorizar inversión en sombra, equipamientos y refugios donde el déficit es medible y territorialmente comparable.

## 5. Escalabilidad y arquitectura

Madrid Refugio nace con vocación de producto estable y exportable. La arquitectura modular (Frontend, Backend y Motor Algorítmico) está diseñada para ser replicable por otros consistorios que deseen implementar sistemas similares de protección climática.

Además, la arquitectura algorítmica expuesta en este demostrador está diseñada para escalar: el salto a una cobertura metropolitana completa abandona los grafos en memoria (NetworkX) en favor de nodos espaciales en base de datos (**PostgreSQL + PostGIS con `pgRouting`**), permitiendo cálculos de millones de aristas con sombra dinámica en apenas milisegundos gracias al pre-cálculo masivo en formato Parquet.

## 6. Conclusión

Madrid Refugio convierte datos abiertos en una herramienta operativa de salud pública. El resultado ya permite priorizar barrios, comparar rutas y medir cuánto sol directo se evita a cambio de un rodeo pequeño.
