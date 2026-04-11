# Madrid Refugio: Motor de confort térmico urbano 4D

## 1. Introducción y propuesta de valor

**Madrid Refugio** es un motor de simulación climática urbana diseñado para proteger a la población más vulnerable de la capital frente a la temperatura superficial elevada y los episodios de calor extremo.

Su uso directo está pensado para cuidadores, familiares y personal municipal que planifican desplazamientos o priorizan intervenciones en apoyo de personas mayores. El beneficiario final es la población mayor de 65 años más expuesta al calor.

A diferencia de los mapas estáticos de temperatura superficial, Madrid Refugio calcula rutas de confort térmico en tiempo real sobre 520.128 aristas y 13 franjas horarias.

## 2. Innovación tecnológica: motor de sombra dinámica proyectada

Madrid Refugio calcula **sombra dinámica proyectada por edificación** y la combina con arbolado viario en el peso de cada tramo:

- **Modelo de alturas de edificación:** Procesamiento de 662.173 polígonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyección geométrica solar:** Integración de la biblioteca `pvlib` y `pybdshadow` para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar en episodios de ola de calor en Madrid).
- **Matriz de intersección calle-sombra:** Generación offline de una matriz de 520.128 aristas × 13 franjas horarias (08:00 a 20:00). El algoritmo ajusta el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.
- **Optimización de confort térmico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que suma sombra de edificación y arbolado con tope, permitiendo desvíos inteligentes hacia calles con mayor confort térmico.

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

## 4. Estructura del proyecto

- `/data`: Datasets originales y procesados (incluyendo `shadow_matrix.parquet`).
- `/frontend`: Aplicación Next.js (React) con UI de alto rendimiento.
- `api.py`: Backend FastAPI con motor de routing dinámico.
- `06a-06d_*.py`: Pipeline de procesamiento LiDAR y generación de sombras.

## 5. Datos precomputados

Los archivos grandes no están en el repositorio y se publican como artefactos de release.

| Archivo | Descripción | Fuente |
|---|---|---|
| `madrid_shadow_graph.graphml` | Grafo de calles con sombra de edificación y arbolado integrada | [Release v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4) |
| `shadow_matrix.parquet` | Matriz de sombra precomputada por hora para edificación | [Release v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4) |

Colócalos en `data/processed/` antes de lanzar `uvicorn`.

## 6. Instalación y uso

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

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.
