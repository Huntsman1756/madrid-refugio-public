# Anexo III: memoria tÃ©cnica - Madrid Refugio

## 1. IntroducciÃ³n y propuesta de valor

**Madrid Refugio** no es solo un mapa; es un **motor de simulaciÃ³n climÃ¡tica urbana** diseÃ±ado para proteger a la poblaciÃ³n mÃ¡s vulnerable de la capital â€”los mÃ¡s de 430.000 ciudadanos mayores de 65 aÃ±osâ€” frente al fenÃ³meno de la isla de calor y los episodios de calor extremo.

A diferencia de soluciones estÃ¡ticas que simplemente muestran "islas de calor" histÃ³ricas, nuestra plataforma ofrece una **operatividad real** mediante el cÃ¡lculo de rutas de confort tÃ©rmico en tiempo real. Aunque la interfaz es accesible para cualquier ciudadano, Madrid Refugio estÃ¡ diseÃ±ado primordialmente como una **herramienta de apoyo a la decisiÃ³n para gestores municipales y servicios sociales**, permitiendo identificar dÃ³nde es mÃ¡s urgente desplegar nueva infraestructura de protecciÃ³n climÃ¡tica basÃ¡ndose en el comportamiento real de la sombra y la densidad demogrÃ¡fica.
## 2. InnovaciÃ³n tecnolÃ³gica: motor de sombra dinÃ¡mica proyectada

La principal ventaja competitiva de Madrid Refugio reside en su capacidad de cÃ¡lculo de **Sombra DinÃ¡mica Proyectada por EdificaciÃ³n**. Mientras que otras propuestas se limitan a mapas de calor estÃ¡ticos o histÃ³ricos, nosotros hemos implementado:

- **Modelo de Alturas de EdificaciÃ³n:** Procesamiento de 662.173 polÃ­gonos del Geoportal de Madrid con atributos de altura real (Z).
- **ProyecciÃ³n GeomÃ©trica Solar:** IntegraciÃ³n de las bibliotecas `pvlib` y `pybdshadow` para el cÃ¡lculo dinÃ¡mico de la posiciÃ³n solar (azimut y elevaciÃ³n) basada en coordenadas geogrÃ¡ficas y fecha de referencia (15 de julio, fecha representativa de mÃ¡xima incidencia solar).
- **Matriz de IntersecciÃ³n Calle-Sombra:** GeneraciÃ³n offline de una matriz de 320.844 aristas Ã— 13 franjas horarias (08:00 a 20:00), que permite al algoritmo de routing ajustar el peso de cada tramo en microsegundos segÃºn la hora seleccionada por el usuario.
- **OptimizaciÃ³n de Confort TÃ©rmico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que penaliza la insolaciÃ³n directa, permitiendo desvÃ­os inteligentes hacia calles en sombra que multiplican la protecciÃ³n frente al estrÃ©s tÃ©rmico.

### SimulaciÃ³n temporal de sombras

La posiciÃ³n del sol se calcula mediante geometrÃ­a esfÃ©rica estÃ¡ndar (azimut y elevaciÃ³n solar) en funciÃ³n de la hora del dÃ­a y las coordenadas de Madrid (40,4Â° N). No se consultan APIs meteorolÃ³gicas externas: el sistema es completamente determinista y reproducible, lo que garantiza su funcionamiento offline y sin coste operativo.

Los pesos de sombra se precomputan para 13 franjas horarias (08:00 a 20:00) y se almacenan en la matriz Parquet. En tiempo de ejecuciÃ³n, el backend inyecta los pesos correspondientes a la franja seleccionada por el usuario antes de ejecutar el algoritmo de Dijkstra.

## 3. ReutilizaciÃ³n de datos abiertos

Hemos integrado 7 datasets crÃ­ticos del ecosistema de datos de Madrid:
1. **Modelo de Alturas de EdificaciÃ³n (2024):** Geoportal del Ayuntamiento de Madrid. 662.173 polÃ­gonos con atributo Z (altura real). Base para la simulaciÃ³n de sombras.
2. **Inventario de Arbolado Viario:** 661.192 ejemplares geolocalizados para sombra biolÃ³gica.
3. **PadrÃ³n Municipal (Enero 2026):** PoblaciÃ³n por barrio segregada por edad (>65 aÃ±os).
4. **Calidad del Aire Horaria:** Series histÃ³ricas de NO2 interpoladas mediante IDW (Inverse Distance Weighting).
5. **Fuentes de Agua Potable:** Red de hidrantes pÃºblicos integrada en el algoritmo de proximidad.
6. **Equipamientos Municipales:** Bibliotecas y centros deportivos mapeados como "refugios sustitutos".
7. **LÃ­mites de Barrios y Distritos:** GeometrÃ­a administrativa oficial.

### Datos de NOâ‚‚

Los valores de contaminaciÃ³n por diÃ³xido de nitrÃ³geno provienen del dataset histÃ³rico de la Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (datos.madrid.es). Se utilizan medias anuales por estaciÃ³n, suficientes para identificar patrones estructurales de exposiciÃ³n crÃ³nica en los barrios. La integraciÃ³n de lecturas en tiempo real es una extensiÃ³n prevista del sistema.

## 4. Impacto social y justicia tÃ©rmica

El anÃ¡lisis territorial ha revelado realidades crÃ­ticas: **Villaverde y Aluche** emergen como zonas de mÃ¡xima prioridad por su combinaciÃ³n de poblaciÃ³n envejecida y dÃ©ficit de infraestructura de refugio. Madrid Refugio proporciona a los planificadores urbanos una hoja de ruta basada en datos para la creaciÃ³n de la red oficial de refugios climÃ¡ticos.

## 5. Escalabilidad y arquitectura

Madrid Refugio nace con vocaciÃ³n de producto estable y exportable. La arquitectura modular (Frontend, Backend y Motor AlgorÃ­tmico) estÃ¡ diseÃ±ada para ser replicable por otros consistorios que deseen implementar sistemas similares de protecciÃ³n climÃ¡tica.
AdemÃ¡s, la arquitectura algorÃ­tmica expuesta en este demostrador estÃ¡ diseÃ±ada para escalar: el salto a una cobertura metropolitana completa abandona los grafos en memoria (NetworkX) en favor de nodos espaciales en base de datos (**PostgreSQL + PostGIS con `pgRouting`**), permitiendo cÃ¡lculos de millones de aristas con sombra dinÃ¡mica en apenas milisegundos gracias al pre-cÃ¡lculo masivo en formato Parquet.

## 6. ConclusiÃ³n

Madrid Refugio representa la excelencia en la reutilizaciÃ³n de datos abiertos: transforma filas de bases de datos en una herramienta de salud pÃºblica proactiva, visualmente impecable y tÃ©cnicamente avanzada. **Es un demostrador funcional con infraestructura real, preparado para amortiguar el impacto del cambio climÃ¡tico en los ciudadanos que levantaron esta ciudad.**

