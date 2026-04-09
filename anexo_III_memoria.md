# Anexo III: Memoria Técnica - Madrid Refugio

## 1. Introducción y Propuesta de Valor

**Madrid Refugio** es un motor de simulación climática urbana diseñado para proteger a la población más vulnerable de la capital frente a la isla de calor y los episodios de calor extremo. El sistema se orienta sobre todo a los más de 430.000 mayores de 65 años que viven en Madrid.

A diferencia de las soluciones que se limitan a mostrar "islas de calor" históricas, Madrid Refugio calcula rutas de confort térmico en tiempo real. La interfaz es pública, pero el uso central del sistema es municipal: señalar dónde conviene desplegar refugios, sombra e inversión primero, con datos de población, exposición y cobertura real.
## 2. Innovación Tecnológica: Motor de Sombra Dinámica Proyectada

Madrid Refugio calcula **sombra dinámica proyectada por edificación** y la combina con arbolado viario en el peso de cada tramo:

- **Modelo de alturas de edificación:** Procesamiento de 662.173 polígonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyección geométrica solar:** Integración de las bibliotecas `pvlib` y `pybdshadow` para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar).
- **Matriz de intersección calle-sombra:** Generación offline de una matriz de 320.844 aristas × 13 franjas horarias (08:00 a 20:00). El algoritmo ajusta el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.
- **Optimización de confort térmico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que suma sombra de edificación y arbolado con tope, permitiendo desvíos inteligentes hacia calles con mayor confort térmico.

### Simulación temporal de sombras

La posición del sol se calcula mediante geometría esférica estándar (azimut y elevación solar) en función de la hora del día y las coordenadas de Madrid (40,4° N). El cálculo de rutas es completamente determinista y no depende de datos externos. El widget meteorológico consulta AEMET OpenData en tiempo real para mostrar contexto térmico actual, con caché de 15 minutos.

Los pesos de sombra se precomputan para 13 franjas horarias (08:00 a 20:00) y se almacenan en la matriz Parquet. En tiempo de ejecución, el backend inyecta los pesos correspondientes a la franja seleccionada por el usuario antes de ejecutar el algoritmo de Dijkstra.

## 3. Reutilización de datos abiertos

Hemos integrado 7 datasets críticos del ecosistema de datos de Madrid:
1. **Modelo de alturas de edificación (2024):** Geoportal del Ayuntamiento de Madrid. 662.173 polígonos con atributo Z (altura real). Base para la simulación de sombras.
2. **Inventario de Arbolado Viario:** 661.192 ejemplares geolocalizados para sombra biológica.
3. **Padrón Municipal (Enero 2026):** Población por barrio segregada por edad (>65 años).
4. **Meteorología y Calidad del Aire:** Widget de contexto con AEMET OpenData en tiempo real (temperatura y estado del cielo) y series históricas de NO2 para análisis territorial.
5. **Fuentes de Agua Potable:** Red de hidrantes públicos integrada en el algoritmo de proximidad.
6. **Equipamientos Municipales:** Bibliotecas y centros deportivos mapeados como "refugios sustitutos".
7. **Límites de Barrios y Distritos:** Geometría administrativa oficial.

### Datos de NO₂

Los valores de contaminación por dióxido de nitrógeno provienen del dataset histórico de la Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (datos.madrid.es). Se utilizan medias anuales por estación, suficientes para identificar patrones estructurales de exposición crónica en los barrios. La integración de lecturas en tiempo real es una extensión prevista del sistema.

## 4. Impacto social y justicia térmica

El análisis territorial ha revelado realidades críticas: **Villaverde y Aluche** emergen como zonas de máxima prioridad por su combinación de población envejecida y déficit de infraestructura de refugio. Madrid Refugio proporciona a los planificadores urbanos una hoja de ruta basada en datos para la creación de la red oficial de refugios climáticos.

## 5. Escalabilidad y arquitectura

La arquitectura modular (frontend, backend y motor algorítmico) permite replicar el sistema en otros consistorios con datasets equivalentes.
Para escalar a *Madrid completo*, el siguiente paso es sustituir los grafos en memoria (NetworkX) por nodos espaciales en base de datos (**PostgreSQL + PostGIS con `pgRouting`**), manteniendo el pre-cálculo masivo en Parquet.

## 6. Conclusión

Madrid Refugio convierte datos abiertos en una herramienta operativa de salud pública. El resultado ya permite priorizar barrios, comparar rutas y medir cuánto sol directo se evita a cambio de un rodeo pequeño.
