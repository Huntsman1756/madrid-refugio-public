# Madrid Refugio: motor de confort térmico urbano 4D

## 1. Introducción y propuesta de valor

**Madrid Refugio** es un motor de simulación climática urbana diseñado para proteger a la población más vulnerable de la capital frente al fenómeno de la isla de calor y los episodios de calor extremo.

A diferencia de soluciones estáticas que simplemente muestran "islas de calor" históricas, nuestra plataforma ofrece una **operatividad real** mediante el cálculo de rutas de confort térmico en tiempo real.

## 2. Innovación tecnológica: motor de sombra dinámica proyectada

La principal ventaja competitiva de Madrid Refugio reside en su capacidad de cálculo de **Sombra Dinámica Proyectada por Edificación**. Mientras que otras propuestas se limitan a mapas de calor estáticos o históricos, nosotros hemos implementado:

- **Modelo de Alturas de Edificación:** Procesamiento de 662.173 polígonos del Geoportal de Madrid con atributos de altura real (Z).
- **Proyección Geométrica Solar:** Integración de la biblioteca `pvlib` y `pybdshadow` para el cálculo dinámico de la posición solar (azimut y elevación) basada en coordenadas geográficas y fecha de referencia (15 de julio, fecha representativa de máxima incidencia solar en episodios de ola de calor en Madrid).
- **Matriz de Intersección Calle-Sombra:** Generación offline de una matriz de 320.844 aristas × 13 franjas horarias (08:00 a 20:00), que permite al algoritmo de routing ajustar el peso de cada tramo en microsegundos según la hora seleccionada por el usuario.
- **Optimización de Confort Térmico:** El grafo urbano utiliza un peso combinado (`comfort_weight`) que penaliza la insolación directa, permitiendo desvíos inteligentes hacia calles en sombra que multiplican la protección frente al estrés térmico.

## 3. Reutilización de datos abiertos

Hemos integrado 7 datasets críticos del ecosistema de datos de Madrid:
1. **Modelo de Alturas de Edificación (2024):** Geoportal del Ayuntamiento de Madrid. 662.173 polígonos con atributo Z (altura real). Base para la simulación de sombras.
2. **Inventario de Arbolado Viario:** 661.192 ejemplares geolocalizados para sombra biológica.
3. **Padrón Municipal (Enero 2026):** Población por barrio segregada por edad (>65 años).
4. **Calidad del Aire Horaria:** Series históricas de NO2 interpoladas mediante IDW (Inverse Distance Weighting).
5. **Fuentes de Agua Potable:** Red de hidrantes públicos integrada en el algoritmo de proximidad.
6. **Equipamientos Municipales:** Bibliotecas y centros deportivos mapeados como "refugios sustitutos".
7. **Límites de Barrios y Distritos:** Geometría administrativa oficial.

## 4. Estructura del proyecto

- `/data`: Datasets originales y procesados (incluyendo `shadow_matrix.parquet`).
- `/frontend`: Aplicación Next.js (React) con UI de alto rendimiento.
- `api.py`: Backend FastAPI con motor de routing dinámico.
- `06a-06d_*.py`: Pipeline de procesamiento LiDAR y generación de sombras.

## 5. Datos precomputados

Los archivos grandes no están en el repositorio (gestionados vía Git LFS).

| Archivo | Descripción | Fuente |
|---|---|---|
| `madrid_shadow_graph.graphml.gz` | Grafo de calles con pesos de sombra para el despliegue operativo actual | [Release v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4) |
| `shadow_matrix.parquet` | Matriz de sombra precomputada por hora para el despliegue operativo actual | [Release v1.4](https://github.com/Huntsman1756/madrid-refugio/releases/tag/v1.4) |

Colócalos en `data/processed/` antes de lanzar `uvicorn`.

## 6. Instalación y uso

### Backend (Python 3.12+)
```bash
copy .env.example .env
pip install -r requirements.txt
python api.py
```

### Regenerar el índice de búsqueda de Madrid

El autocompletado de origen y destino usa el índice canónico `data/processed/madrid_search_index.json`, con metadatos de tamaño en `data/processed/madrid_search_index.meta.json`.

En producción, el despliegue prepara esos artefactos antes de arrancar el backend ejecutando `python prepare_search_data.py`. Ese script descarga el CSV oficial del callejero solo si no existe todavía en `DATA_DIR` y genera el índice antes de levantar `uvicorn`.

En producción debes preparar antes del deploy estos artefactos en `data/processed/`:

- `213605-4-callejero-oficial-madrid-csv.csv`
- `madrid_search_index.json`
- `madrid_search_index.meta.json`

Si usas Railway con volumen persistente, deja esos ficheros en `DATA_DIR` para que sobrevivan entre despliegues y el prestart no tenga que regenerarlos en cada arranque.

Si despliegas sin ellos, `/api/suggest` responderá `503 Service Unavailable` hasta que el CSV oficial y/o el índice precomputado estén presentes.

La demo del frontend lo sirve desde `/data/madrid_search_index.json`, por lo que tras regenerarlo conviene sincronizar la copia publicada en `frontend/public/data/madrid_search_index.json`.

Comando base para regenerarlo:

```bash
python build_madrid_search_index.py
```

Si además quieres mezclar un CSV municipal con direcciones normalizadas, ejecuta:

```bash
python build_madrid_search_index.py --csv "ruta/al/fichero_municipal.csv"
```

Fuentes del índice:

- `data/reference/madrid_search_curated.json`: entradas curadas versionadas para demos y destinos/orígenes prioritarios de Madrid.
- `data/processed/213605-4-callejero-oficial-madrid-csv.csv`: copia local preparada previamente del Callejero oficial usada por el backend cuando necesita reconstruir el índice.
- `--csv`: fuente municipal opcional en CSV con columnas como `label` o `direccion`, coordenadas `lat`/`lon` o `LATITUD`/`LONGITUD`, y opcionalmente `district` o `distrito`.

El builder prioriza las entradas curadas cuando hay colisiones y vuelve a escribir ambos artefactos generados en `data/processed/`. La fuente curada ya no vive en `data/processed/`, para que un checkout limpio conserve esas entradas aunque se limpie la carpeta de artefactos generados.

Variables de entorno esperadas:

- `GITHUB_TOKEN`: opcional, solo si quieres usar peticiones autenticadas a GitHub.

### Despliegue en Railway

El backend de produccion en Railway necesita estas condiciones para arrancar de forma estable:

- Volumen montado en `/mnt/data`
- `DATA_DIR=/mnt/data/processed`
- Recursos del servicio suficientes para cargar el grafo completo en memoria

El arranque en Railway usa ahora:

```bash
python prepare_search_data.py && uvicorn api:app --host 0.0.0.0 --port $PORT
```

Eso mueve la descarga/generación del CSV e índice al prestart del despliegue, no al runtime de `/api/suggest`.

El motor pesado de routing ya no se carga completo durante `startup`. El backend publica `/health` nada más arrancar y difiere la carga del grafo, refugios, fuentes y matriz de sombra hasta la primera petición real a `/api/route`. Esto reduce el pico de memoria del deploy y evita bucles de reinicio cuando el servicio se ajusta a `3 GB RAM`.

Configuracion operativa validada en produccion:

- `DATA_DIR=/mnt/data/processed`
- volumen persistente con `madrid_shadow_graph.graphml` y `shadow_matrix.parquet`
- limite del servicio en Railway de al menos `3 GB RAM`; subirlo si el runtime vuelve a entrar en OOM bajo carga real

El archivo `railway.json` de la raiz deja fijados en codigo el `startCommand`, `healthcheckPath` y `healthcheckTimeout`.

El flujo manual soportado para Railway no debe usar `railway up` desde la raiz del repo. Este proyecto puede tener artefactos locales grandes en `data/processed/` y el upload completo puede fallar con `413 Payload Too Large` aunque produccion ya lea esos ficheros desde el volumen persistente.

El comando oficial de deploy manual es:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy_railway.ps1
```

Ese script regenera `.railway-deploy/` como snapshot minimo del backend y ejecuta `railway up ".railway-deploy" --path-as-root`. `.railway-deploy/` es un artefacto generado e ignorado por git, no una fuente de verdad.

Prerequisitos del flujo manual:

- Railway CLI instalado y autenticado
- proyecto, entorno y servicio enlazados con `railway link`
- volumen persistente montado en `/mnt/data`
- `DATA_DIR=/mnt/data/processed`

Si el servicio vuelve a responder `502` durante el arranque, lo primero que hay que revisar es:

1. que el volumen sigue montado en `/mnt/data`
2. que `DATA_DIR` apunta a `/mnt/data/processed`
3. que el override de recursos del servicio no haya bajado de `8 GB`
4. que `GET /health` llegue a `200` antes de dar por valido el deploy

## Nota sobre acceso y derechos

Este repositorio se facilita como soporte de evaluación, documentación y revisión del proyecto durante la convocatoria 2026 de los Premios a la Reutilización de Datos Abiertos del Ayuntamiento de Madrid.

Salvo que se indique expresamente lo contrario en un subdirectorio o dependencia de terceros, no se concede permiso general de reutilización, modificación o redistribución del código de este repositorio. Consulta el archivo `LICENSE` de la raíz para el detalle legal aplicable.

### Frontend (Node.js 20+)
```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.
