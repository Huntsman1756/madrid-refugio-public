# Memoria del proyecto

**Madrid Refugio: rutas de confort térmico urbano basadas en datos abiertos**

**Autor:** Daniel Romero Gil

**URL del repositorio:** <https://github.com/Huntsman1756/madrid-refugio-public>

## 1. Resumen ejecutivo

Madrid Refugio es una herramienta de simulación climática urbana que calcula rutas peatonales de confort térmico en el momento de la consulta, combinando datos abiertos del Ayuntamiento de Madrid con un grafo de calles de OpenStreetMap. El proyecto responde a un problema público acreditado: el 64,1% de los barrios de Madrid no dispone de un refugio climático operativo en un radio de 300 metros, mientras que la cobertura actual de refugios oficiales resulta claramente insuficiente en comparación con otras grandes ciudades españolas.

Ante esa brecha de infraestructura, Madrid Refugio propone una solución operativa e inmediata: ayudar a que cada desplazamiento a pie sea más seguro durante episodios de calor extremo, maximizando la sombra disponible, la proximidad a fuentes de agua y el acceso a equipamientos climatizados que pueden funcionar como refugios sustitutos.

## 2. Problema y oportunidad publica

Las olas de calor son ya uno de los principales riesgos climáticos para la salud urbana. En Madrid, las temperaturas extremas afectan de forma desproporcionada a las personas mayores de 65 anos, especialmente en barrios con menor cobertura de arbolado, mayor distancia a equipamientos de resguardo y peor acceso a recursos de alivio inmediato.

El analisis territorial realizado sobre 131 barrios pone de manifiesto tres conclusiones relevantes. En primer lugar, 84 barrios, el 64,1% del total, no cuentan con un refugio climático operativo a menos de 300 metros. En segundo lugar, Aluche concentra la mayor vulnerabilidad absoluta en volumen de población mayor expuesta, con 19.121 personas mayores de 65 anos sin refugio próximo. En tercer lugar, Villaverde Alto - Casco Historico de Villaverde obtiene la máxima prioridad relativa de intervención en el modelo territorial.

Durante el desarrollo se detecto, ademas, una carencia relevante del ecosistema de datos: no existe en el portal municipal un dataset específico y reutilizable de refugios climáticos oficiales. El proyecto documenta esa ausencia y la compensa de forma trazable mediante una capa operativa de equipamientos municipales climatizados.

## 3. Objetivo del proyecto

**Objetivo ciudadano.** Ofrecer una herramienta gratuita y accesible desde cualquier navegador que permita calcular rutas peatonales optimizadas para el confort térmico entre dos puntos de Madrid, teniendo en cuenta sombra urbana, proximidad a fuentes de agua potable y acceso a refugios sustitutos climatizados.

**Objetivo de politica publica.** Generar una base territorial de evidencia que ayude a priorizar la ampliación de la red de refugios climáticos, la plantación de arbolado viario y otras medidas de adaptación en los barrios con mayor vulnerabilidad.

## 4. Publico beneficiario

- Ciudadania en general, especialmente personas mayores de 65 anos que necesitan desplazarse a pie en episodios de calor extremo.
- Servicios sociales, sanitarios y de emergencia municipal, para orientar recursos y actuaciones preventivas durante alertas térmicas.
- Gestores públicos y técnicos municipales responsables de planificación urbana, adaptación climática y salud ambiental.

## 5. Conjuntos de datos utilizados

| Conjunto de datos | Fuente | Formato | Uso en el proyecto |
| --- | --- | --- | --- |
| Modelo de alturas de edificación (2024) | Geoportal del Ayuntamiento de Madrid | Capa geoespacial / GeoJSON procesado | Base para el calculo de sombra proyectada por edificios |
| Arbolado viario detallado | datos.madrid.es | XLSX | Sombra biológica, peso de tramo y analisis territorial |
| Zonas verdes por distrito | datos.madrid.es | CSV | Contexto territorial complementario |
| Bibliotecas municipales | datos.madrid.es | GEO | Refugios sustitutos operativos |
| Centros culturales | datos.madrid.es | GEO | Refugios sustitutos operativos |
| Polideportivos municipales | datos.madrid.es | GEO | Refugios sustitutos operativos |
| Fuentes de agua potable | datos.madrid.es | CSV | Puntos de alivio en ruta y analisis de proximidad |
| Calidad del aire historica 2024 | datos.madrid.es | ZIP CSV | Series horarias de NO2 para el indice de confort |
| Estaciones de calidad del aire | datos.madrid.es | CSV | Coordenadas para interpolación espacial |
| Padron municipal por edad | datos.madrid.es | CSV | Población mayor de 65 anos por barrio |
| Limites administrativos de barrios | Geoportal del Ayuntamiento de Madrid | ZIP Shapefile | Unidad territorial oficial de analisis |
| Red peatonal urbana | OpenStreetMap | Grafo OSM | Base de routing peatonal |

**Nota sobre datos no disponibles.** No existe en el portal municipal un dataset específico de refugios climáticos oficiales reutilizable en formato operativo. Por ello, el proyecto trabaja con una sustitución defensiva basada en 261 equipamientos con coordenadas verificadas, manteniendo trazabilidad completa de la decisión.

**Fuente comparativa externa.** El informe de Greenpeace de 2025 se utiliza como referencia de contexto y benchmarking sobre cobertura de refugios climáticos, no como dataset operativo del motor de calculo.

## 6. Innovacion que representa

La principal innovación del proyecto es la incorporación de un modelo de sombra urbana por hora del dia aplicado al calculo de rutas peatonales. Frente a visores estáticos o mapas agregados de calor, Madrid Refugio estima el confort térmico tramo a tramo y compara una ruta directa con una alternativa más protegida.

Esa estimación combina dos tipos de sombra. Por un lado, la sombra proyectada por edificios a partir del modelo de alturas de edificación y de la posición solar calculada con `pvlib` y `pybdshadow`. Por otro, la sombra biológica derivada del inventario municipal de arbolado viario, integrado sobre la red peatonal para modificar el peso de cada tramo.

La segunda innovación es el indice territorial multicriterio por barrio, que combina cobertura de arbolado, proximidad a fuentes, cobertura de refugios sustitutos, calidad del aire y peso de la población vulnerable. El resultado no solo ayuda a caminar con menor exposición al calor, sino que genera evidencia útil para priorizar inversión publica.

En el ejemplo operativo validado en el proyecto, una ruta de confort térmico incrementa la distancia un 4,3% respecto al trayecto mas corto, a cambio de multiplicar por 5,4 la sombra acumulada.

## 7. Tecnologia utilizada

**Procesamiento geoespacial.** Python con GeoPandas, Shapely, PyProj, Pandas y utilidades de análisis espacial sobre ETRS89 / UTM zona 30N (EPSG:25830). Para el modelo de sombra proyectada se utilizan `pvlib` y `pybdshadow`.

**Modelo de routing.** OSMnx para construir el grafo peatonal desde OpenStreetMap y NetworkX para el calculo de rutas ponderadas por confort térmico.

**Aplicación web.** Frontend en Next.js con React. API en Python con FastAPI. Visualización cartográfica con Leaflet y React-Leaflet. Despliegue web en Vercel y Railway.

**Arquitectura de calculo.** El sistema combina precomputación offline de capas pesadas, como la matriz de sombra por franja horaria, con cálculo interactivo en el momento de la consulta. Este enfoque permite tiempos de respuesta operativos sin renunciar a detalle geoespacial.

**Trazabilidad.** El proyecto conserva documentación técnica, scripts de generación y referencia directa a las fuentes originales utilizadas durante el procesamiento y la evaluación.

## 8. Impacto esperado

Madrid Refugio tiene un impacto potencial directo en salud urbana, adaptación climática y planificación territorial. En el plano ciudadano, facilita desplazamientos más seguros y mejor informados en periodos de calor extremo, especialmente para población vulnerable. En el plano institucional, sistematiza evidencias sobre barrios con mayor déficit de cobertura y ofrece un soporte objetivo para decidir dónde intervenir primero.

El proyecto también contribuye a mejorar el propio ecosistema de datos abiertos, al visibilizar la ausencia de un dataset municipal de refugios climáticos y demostrar por qué ese recurso es relevante para la accion pública.

Su arquitectura y su metodología son, ademas, replicables en otros municipios que dispongan de datos abiertos comparables sobre red viaria, arbolado, edificios y equipamientos.

## 9. Conclusion

Madrid Refugio transforma datos abiertos en protección climática concreta. Es una herramienta operativa, desplegada y funcional, que permite calcular hoy rutas peatonales más confortables en Madrid y, al mismo tiempo, producir evidencia territorial para orientar decisiones públicas de adaptación al calor.

La combinación de reutilización de datos, modelización geoespacial y utilidad ciudadana convierte el proyecto en un ejemplo sólido de innovación aplicada al interés general.

**URL pública de la herramienta:** <https://madridrefugio.es/>
