# Anexo III: Memoria tecnica - Madrid Refugio

## 1. Introduccion y propuesta de valor

### URLs publicas del proyecto

- **Aplicacion publica:** [https://madrid-refugio.vercel.app/](https://madrid-refugio.vercel.app/)
- **Repositorio publico:** [https://github.com/Huntsman1756/madrid-refugio](https://github.com/Huntsman1756/madrid-refugio)
- **Artefactos de datos y release estable:** [https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4)

**Madrid Refugio** es un motor de simulacion climatica urbana disenado para proteger a la poblacion mas vulnerable de la capital frente a la isla de calor y los episodios de calor extremo. El beneficiario principal son los mas de 430.000 mayores de 65 anos que viven en Madrid.

El uso directo de la herramienta esta pensado para cuidadores, familiares, servicios sociales y planificadores urbanos que calculan rutas o priorizan intervenciones en apoyo de personas mayores. La interfaz es publica, pero el valor central del sistema es ayudar a decidir donde conviene desplegar refugios, sombra e inversion primero, con datos de poblacion, exposicion y cobertura real.

## 2. Innovacion tecnologica: motor de sombra dinamica proyectada

Madrid Refugio calcula **sombra dinamica proyectada por edificacion** y la combina con arbolado viario en el peso de cada tramo:

- **Modelo de alturas de edificacion:** Procesamiento de 662.173 poligonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyeccion geometrica solar:** Integracion de las bibliotecas `pvlib` y `pybdshadow` para el calculo dinamico de la posicion solar (azimut y elevacion) basada en coordenadas geograficas y fecha de referencia (15 de julio, fecha representativa de maxima incidencia solar).
- **Matriz de interseccion calle-sombra:** Generacion offline de una matriz de 520.128 aristas x 13 franjas horarias (08:00 a 20:00). El algoritmo ajusta el peso de cada tramo en microsegundos segun la hora seleccionada por el usuario.
- **Optimizacion de confort termico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que suma sombra de edificacion y arbolado con tope, permitiendo desvios inteligentes hacia calles con mayor confort termico.

### Simulacion temporal de sombras

La posicion del sol se calcula mediante geometria esferica estandar (azimut y elevacion solar) en funcion de la hora del dia y las coordenadas de Madrid (40,4 grados norte). El calculo de rutas es completamente determinista y no depende de datos externos. El widget meteorologico consulta AEMET OpenData en tiempo real para mostrar contexto termico actual, con cache de 15 minutos.

Los pesos de sombra se precomputan para 13 franjas horarias (08:00 a 20:00) y se almacenan en la matriz Parquet. En tiempo de ejecucion, el backend inyecta los pesos correspondientes a la franja seleccionada por el usuario antes de ejecutar el algoritmo de Dijkstra.

La metrica de sombra es geometrica, no fisiologica: mide sombra acumulada a lo largo del recorrido, pero no incorpora pendiente, distancia total caminada ni condicion fisica individual. Es una limitacion conocida del modelo actual y una linea clara de mejora para futuras versiones orientadas a esfuerzo peatonal y vulnerabilidad personalizada.

## 3. Reutilizacion de datos abiertos

Hemos integrado conjuntos de datos del ecosistema de datos de Madrid con sus titulos oficiales en el portal:
1. **Modelo digital 3D de edificios:** Geoportal del Ayuntamiento de Madrid. 662.173 poligonos con atributo Z (altura real). Base para la simulacion de sombras.
2. **Arbolado en parques y zonas verdes de Madrid (detalle):** 661.192 ejemplares geolocalizados reutilizados como sombra biologica. El dataset incluye arbolado viario y arbolado en zonas verdes municipales.
3. **Padron municipal:** Poblacion por barrio, distrito y seccion censal agregada por sexo y edad. Base para identificar mayores de 65 anos.
4. **Calidad del aire. Datos horarios desde 2001:** Series historicas de NO2 para analisis territorial.
5. **Fuentes de agua para beber:** Puntos de apoyo hidrico integrados en el algoritmo de proximidad.
6. **Bibliotecas de Madrid:** Equipamientos reutilizados como refugios climaticos sustitutos.
7. **Deportes. Centros Deportivos Municipales (Polideportivos):** Equipamientos reutilizados como refugios climaticos sustitutos.
8. **Barrios municipales de Madrid:** Geometria oficial para agregacion territorial.
9. **Distritos municipales de Madrid:** Geometria administrativa oficial de los 21 distritos.

### Relacion de conjuntos de datos utilizados

| Conjunto de datos | Portal / fuente | Uso en Madrid Refugio |
|---|---|---|
| **Modelo digital 3D de edificios** | Portal de Datos Abiertos del Ayuntamiento de Madrid / Geoportal | Base geometrica para proyectar sombras de edificacion y construir la matriz calle-sombra |
| **Arbolado en parques y zonas verdes de Madrid (detalle)** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Integracion de sombra biologica en el peso de las aristas del grafo. Se reutiliza su detalle de arbolado viario y zonas verdes |
| **Padron municipal** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Identificacion del publico beneficiario y priorizacion territorial de mayores de 65 anos |
| **Calidad del aire. Datos horarios desde 2001** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Calculo del indicador territorial de exposicion cronica por NO2 |
| **Fuentes de agua para beber** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Localizacion de puntos de apoyo hidrico en las rutas |
| **Bibliotecas de Madrid** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Identificacion de refugios climaticos sustitutos |
| **Deportes. Centros Deportivos Municipales (Polideportivos)** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Identificacion de refugios climaticos sustitutos |
| **Barrios municipales de Madrid** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Delimitacion territorial del analisis y agregacion de indicadores por barrio |
| **Distritos municipales de Madrid** | Portal de Datos Abiertos del Ayuntamiento de Madrid | Contexto administrativo del mapa y navegacion territorial |

Todos los conjuntos estructurales provienen de `datos.madrid.es`. AEMET OpenData se utiliza unicamente como fuente oficial de contexto meteorologico en tiempo real para el widget informativo.

### Datos de NO2

Los valores de contaminacion por dioxido de nitrogeno provienen del dataset historico de la Red de Vigilancia de la Calidad del Aire del Ayuntamiento de Madrid (datos.madrid.es). Se utilizan medias anuales por estacion, suficientes para identificar patrones estructurales de exposicion cronica en los barrios. La integracion de lecturas en tiempo real es una extension prevista del sistema.

## 4. Impacto social y justicia termica

El analisis territorial ha revelado realidades criticas: **Villaverde y Aluche** emergen como zonas de maxima prioridad por su combinacion de poblacion envejecida y deficit de infraestructura de refugio. Madrid Refugio proporciona a los planificadores urbanos una hoja de ruta basada en datos para la creacion de la red oficial de refugios climaticos.

### Utilidad publica para Madrid

Madrid Refugio responde a una necesidad municipal concreta:

- **Mas de 430.000 mayores de 65 anos** viven en Madrid y son el grupo mas expuesto a la mortalidad asociada al calor extremo.
- **64,1 % de los barrios** no cuentan con un refugio climatico operativo a menos de 300 metros caminables.
- El motor calcula rutas sobre **520.128 aristas** y combina **662.173 poligonos LiDAR** con **661.192 arboles** para estimar confort termico calle a calle en los **21 distritos de Madrid**.
- El resultado no es solo informativo: permite priorizar inversion en sombra, equipamientos y refugios donde el deficit es medible y territorialmente comparable.

## 5. Escalabilidad y arquitectura

La arquitectura modular (frontend, backend y motor algoritmico) permite replicar el sistema en otros consistorios con datasets equivalentes.
El siguiente salto tecnico, ya validada la cobertura de *Madrid completo*, es sustituir los grafos en memoria (NetworkX) por nodos espaciales en base de datos (**PostgreSQL + PostGIS con `pgRouting`**) para reducir tiempos de carga y preparar escenarios metropolitanos de mayor escala.

## 6. Conclusion

Madrid Refugio convierte datos abiertos en una herramienta operativa de salud publica. El resultado ya permite priorizar barrios, comparar rutas y medir cuanto sol directo se evita a cambio de un rodeo pequeno.
