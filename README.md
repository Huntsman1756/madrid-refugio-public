# Madrid Refugio: Motor de Confort Térmico Urbano 4D

## 1. Introducción y Propuesta de Valor

**Madrid Refugio** es un motor de simulación climática urbana diseñado para proteger a la población más vulnerable de la capital frente al fenómeno de la isla de calor y los episodios de calor extremo.

A diferencia de soluciones estáticas que simplemente muestran "islas de calor" históricas, nuestra plataforma ofrece una **operatividad real** mediante el cálculo de rutas de confort térmico en tiempo real.

## 2. Innovación Tecnológica: Motor de Sombra Dinámica Proyectada

La principal ventaja competitiva de Madrid Refugio reside en su capacidad de cálculo de **Sombra Dinámica Proyectada por Edificación**. Mientras que otras propuestas se limitan a mapas de calor estáticos o históricos, nosotros hemos implementado:

- **Modelo de Alturas de Edificación:** Procesamiento de 490.077 polígonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyección Geométrica Solar:** Integración de la biblioteca `pvlib` y `pybdshadow` para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar en episodios de ola de calor en Madrid).
- **Matriz de Intersección Calle-Sombra:** Generación offline de una matriz de 131.620 aristas × 13 franjas horarias (08:00 a 20:00), que permite al algoritmo de routing ajustar el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.
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

## 4. Estructura del Proyecto

- `/data`: Datasets originales y procesados (incluyendo `shadow_matrix.parquet`).
- `/frontend`: Aplicación Next.js (React) con UI de alto rendimiento.
- `api.py`: Backend FastAPI con motor de routing dinámico.
- `06a-06d_*.py`: Pipeline de procesamiento LiDAR y generación de sombras.

## 5. Datos precomputados

Los archivos grandes no están en el repositorio (gestionados vía Git LFS).

| Archivo | Descripción | Fuente |
|---|---|---|
| `madrid_shadow_graph.graphml` | Grafo de calles con pesos de sombra (Tetuán, Chamberí, Fuencarral y Moncloa-Aravaca) | [Release v1.1](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.1) |
| `shadow_matrix.parquet` | Matriz de sombra precomputada por hora | [Release v1.1](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.1) |

Colócalos en `data/processed/` antes de lanzar `uvicorn`.

[![DOI](https://zenodo.org/badge/DOI/10.XXXX/zenodo.XXXXXXX.svg)](https://doi.org/10.XXXX/zenodo.XXXXXXX)

## 6. Instalación y Uso

### Backend (Python 3.12+)
```bash
pip install -r requirements.txt
python api.py
```

### Frontend (Node.js 20+)
```bash
cd frontend
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver la aplicación.
