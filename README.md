# Madrid Refugio: Motor de confort termico urbano 4D

## 1. Introduccion y propuesta de valor

**Madrid Refugio** es un motor de simulacion climatica urbana disenado para proteger a la poblacion mas vulnerable de la capital frente al fenomeno de la isla de calor y los episodios de calor extremo.

Su uso directo esta pensado para cuidadores, familiares y personal municipal que planifican desplazamientos o priorizan intervenciones en apoyo de personas mayores. El beneficiario final es la poblacion mayor de 65 anos mas expuesta al calor.

A diferencia de los mapas estaticos de isla de calor, Madrid Refugio calcula rutas de confort termico en tiempo real sobre 520.128 aristas y 13 franjas horarias.

## 2. Innovacion tecnologica: motor de sombra dinamica proyectada

Madrid Refugio calcula **sombra dinamica proyectada por edificacion** y la combina con arbolado viario en el peso de cada tramo:

- **Modelo de alturas de edificacion:** Procesamiento de 662.173 poligonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyeccion geometrica solar:** Integracion de la biblioteca `pvlib` y `pybdshadow` para el calculo dinamico de la posicion solar (azimut y elevacion) basada en coordenadas geograficas y fecha de referencia (15 de julio, fecha representativa de maxima incidencia solar en episodios de ola de calor en Madrid).
- **Matriz de interseccion calle-sombra:** Generacion offline de una matriz de 520.128 aristas x 13 franjas horarias (08:00 a 20:00). El algoritmo ajusta el peso de cada tramo en microsegundos segun la hora seleccionada por el usuario.
- **Optimizacion de confort termico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que suma sombra de edificacion y arbolado con tope, permitiendo desvios inteligentes hacia calles con mayor confort termico.

## 3. Reutilizacion de datos abiertos

Hemos integrado conjuntos de datos del ecosistema de datos de Madrid con sus titulos oficiales en el portal:
1. **Modelo digital 3D de edificios:** Geoportal del Ayuntamiento de Madrid. 662.173 poligonos con atributo Z (altura real). Base para la simulacion de sombras.
2. **Arbolado en parques y zonas verdes de Madrid (detalle):** 661.192 ejemplares geolocalizados reutilizados como sombra biologica.
3. **Padron municipal:** Poblacion por barrio, distrito y seccion censal agregada por sexo y edad. Base para identificar mayores de 65 anos.
4. **Calidad del aire. Datos horarios desde 2001:** Series historicas de NO2 para analisis territorial.
5. **Fuentes de agua para beber:** Puntos de apoyo hidrico integrados en el algoritmo de proximidad.
6. **Bibliotecas de Madrid:** Equipamientos reutilizados como refugios climaticos sustitutos.
7. **Deportes. Centros Deportivos Municipales (Polideportivos):** Equipamientos reutilizados como refugios climaticos sustitutos.
8. **Barrios municipales de Madrid:** Geometria oficial para agregacion territorial.
9. **Distritos municipales de Madrid:** Geometria administrativa oficial de los 21 distritos.

## 4. Estructura del proyecto

- `/data`: Datasets originales y procesados (incluyendo `shadow_matrix.parquet`).
- `/frontend`: Aplicacion Next.js (React) con UI de alto rendimiento.
- `api.py`: Backend FastAPI con motor de routing dinamico.
- `06a-06d_*.py`: Pipeline de procesamiento LiDAR y generacion de sombras.

## 5. Datos precomputados

Los archivos grandes no estan en el repositorio y se publican como artefactos de release.

| Archivo | Descripcion | Fuente |
|---|---|---|
| `madrid_shadow_graph.graphml` | Grafo de calles con sombra de edificacion y arbolado integrada | [Release v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4) |
| `shadow_matrix.parquet` | Matriz de sombra precomputada por hora para edificacion | [Release v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4) |

Colocalos en `data/processed/` antes de lanzar `uvicorn`.

## 6. Instalacion y uso

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

Abra [http://localhost:3000](http://localhost:3000) para ver la aplicacion.
