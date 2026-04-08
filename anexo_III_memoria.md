# Anexo III: Memoria Técnica - Madrid Refugio

## 1. Introducción y Propuesta de Valor

**Madrid Refugio** no es solo un mapa; es un **motor de simulación climática urbana** diseñado para proteger a la población más vulnerable de la capital —los más de 430.000 ciudadanos mayores de 65 años— frente al fenómeno de la isla de calor y los episodios de calor extremo.

A diferencia de soluciones estáticas que simplemente muestran "islas de calor" históricas, nuestra plataforma ofrece una **operatividad real** mediante el cálculo de rutas de confort térmico en tiempo real. Aunque la interfaz es accesible para cualquier ciudadano, Madrid Refugio está diseñado primordialmente como una **herramienta de apoyo a la decisión para gestores municipales y servicios sociales**, permitiendo identificar dónde es más urgente desplegar nueva infraestructura de protección climática basándose en el comportamiento real de la sombra y la densidad demográfica.
## 2. Innovación Tecnológica: Motor de Sombra Dinámica Proyectada

La principal ventaja competitiva de Madrid Refugio reside en su capacidad de cálculo de **Sombra Dinámica Proyectada por Edificación**. Mientras que otras propuestas se limitan a mapas de calor estáticos o históricos, nosotros hemos implementado:

- **Modelo de Alturas de Edificación:** Procesamiento de 490.077 polígonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyección Geométrica Solar:** Integración de la biblioteca `pvlib` y `pybdshadow` para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar en episodios de ola de calor en Madrid).
- **Matriz de Intersección Calle-Sombra:** Generación offline de una matriz de 80.794 aristas × 13 franjas horarias (08:00 a 20:00), que permite al algoritmo de routing ajustar el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.
- **Optimización de Confort Térmico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que penaliza la insolación directa, permitiendo desvíos inteligentes hacia calles en sombra que multiplican la protección frente al estrés térmico.

## 3. Reutilización de Datos Abiertos

Hemos integrado 7 datasets críticos del ecosistema de datos de Madrid:
1. **Modelo de Alturas de Edificación (2024):** Geoportal del Ayuntamiento de Madrid. 490.077 polígonos con atributo Z (altura real). Base para la simulación de sombras.
2. **Inventario de Arbolado Viario:** 661.192 ejemplares geolocalizados para sombra biológica.
3. **Padrón Municipal (Enero 2026):** Población por barrio segregada por edad (>65 años).
4. **Calidad del Aire Horaria:** Series históricas de NO2 interpoladas mediante IDW (Inverse Distance Weighting).
5. **Fuentes de Agua Potable:** Red de hidrantes públicos integrada en el algoritmo de proximidad.
6. **Equipamientos Municipales:** Bibliotecas y centros deportivos mapeados como "refugios sustitutos".
7. **Límites de Barrios y Distritos:** Geometría administrativa oficial.

## 4. Impacto Social y Justicia Térmica

El análisis territorial ha revelado realidades críticas: **Villaverde y Aluche** emergen como zonas de máxima prioridad por su combinación de población envejecida y déficit de infraestructura de refugio. Madrid Refugio proporciona a los planificadores urbanos una hoja de ruta basada en datos para la creación de la red oficial de refugios climáticos.

## 5. Escalabilidad y Arquitectura

Madrid Refugio nace con vocación de producto estable y exportable. La arquitectura modular (Frontend, Backend y Motor Algorítmico) está diseñada para ser replicable por otros consistorios que deseen implementar sistemas similares de protección climática.
Además, la arquitectura algorítmica expuesta en este demostrador está diseñada para escalar: el salto a *Madrid Completo* abandona los grafos en memoria (NetworkX) en favor de nodos espaciales en base de datos (**PostgreSQL + PostGIS con `pgRouting`**), permitiendo cálculos de millones de aristas con sombra dinámica en apenas milisegundos gracias al pre-cálculo masivo en formato Parquet.

## 6. Conclusión

Madrid Refugio representa la excelencia en la reutilización de datos abiertos: transforma filas de bases de datos en una herramienta de salud pública proactiva, visualmente impecable y técnicamente avanzada. **No es una prueba de concepto, es infraestructura lista para amortiguar el impacto del cambio climático en los ciudadanos que levantaron esta ciudad.**
