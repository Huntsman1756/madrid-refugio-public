# GO / NO-GO DAY 1 — Madrid Refugio

Fecha de validacion: 2026-04-05

## Dataset inventory

| Dataset | Encontrado | Filas | Tiene geometria | CRS | Calidad |
|---|---|---|---|---|---|
| Arbolado viario | si | 661192 | si | EPSG:25830 | coords 100.0% ; viario inferido por NUM_PARQUE null ; viario 661,192 / parques 131,855 |
| Arbolado parques | si | 131855 | si | EPSG:25830 | coords 100.0% ; viario inferido por NUM_PARQUE null ; viario 661,192 / parques 131,855 |
| Zonas verdes superficies | si | 23 | no | - | ok; dataset distrital sin geometria |
| Refugios climaticos | no (sustituto si) | 261 | si | EPSG:4326 | Sin dataset propio; sustitucion operativa con bibliotecas + centros culturales + polideportivos |
| Fuentes de agua | si | 2270 | si | EPSG:25830 | ok |
| Calidad del aire | si | 24 | si | EPSG:25830 | 24 estaciones; 12 CSV mensuales 2024 |
| Padron por edad | si | 240902 | no | - | COD_BARRIO null 0.0% |
| Itinerarios accesibles | no | 0 | no | - | No aparece un dataset exacto. El conjunto mas cercano encontrado es 'Accesibilidad y movilidad en aceras y calzadas. Ano 2024', pero describe actuaciones y no una red de itinerarios peatonales. |

## Criteria

| Criterio | Umbral GO | Resultado | Decision |
|---|---|---|---|
| Arbolado viario rows y coords | > 100k filas, >= 80% coords | 661,192 filas; 100.0% coords | GO |
| Refugios con coords | >= 15 (o sustituto) | 261 con coords (sustituto) | GO |
| Padron con edad por barrio | si | si | GO |
| Estaciones calidad aire con coords | >= 10 | 24 | GO |
| Datasets con geometria compatible | >= 4 | 6 | GO |
| Mapa de cobertura generado | si | si | GO |

## URLs reales usadas (rellenar en Step 0)
- Arbolado viario: https://datos.madrid.es/dataset/300761-0-arbolado-especies/resource/300761-0-arbolado-especies-xlsx/download/300761-0-arbolado-especies-xlsx.xlsx
- Refugios climaticos: NO ENCONTRADO EN PORTAL; sustitucion usada:
  - Bibliotecas: https://datos.madrid.es/dataset/201747-0-bibliobuses-bibliotecas/resource/201747-5-bibliobuses-bibliotecas-geo/download/201747-5-bibliobuses-bibliotecas-geo.geo
  - Centros culturales: https://datos.madrid.es/dataset/200304-0-centros-culturales/resource/200304-2-centros-culturales-geo/download/200304-2-centros-culturales-geo.geo
  - Polideportivos: https://datos.madrid.es/dataset/200186-0-polideportivos/resource/200186-2-polideportivos-geo/download/200186-2-polideportivos-geo.geo
- Padron edad: https://datos.madrid.es/dataset/209163-0-padron-municipal-historico/resource/209163-27-padron-municipal-historico-csv/download/209163-27-padron-municipal-historico-csv.csv
- Calidad del aire: https://datos.madrid.es/dataset/201200-0-calidad-aire-horario/resource/201200-0-calidad-aire-horario-zip/download/201200-0-calidad-aire-horario-zip.zip
- Estaciones calidad del aire: https://datos.madrid.es/dataset/212629-0-estaciones-control-aire/resource/212629-0-estaciones-control-aire-csv/download/212629-0-estaciones-control-aire-csv.csv
- Barrios: https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Barrios/Barrios.zip

## Top 3 barrios con peor cobertura
- Aluche: coverage_ratio=0.0523, pop_65plus=19121, refugios_proximos=0
- Pueblo Nuevo: coverage_ratio=0.0695, pop_65plus=14389, refugios_proximos=0
- Peñagrande: coverage_ratio=0.0774, pop_65plus=12915, refugios_proximos=0

## Dato clave para la memoria
Madrid: 31 refugios climaticos = 1 por cada 110.100 habitantes (Greenpeace 2025)
Barcelona: 1 por cada 4.200 habitantes

## DECISION: GO REFUGIO

Notas:
- No se ha encontrado dataset propio de refugios climaticos en el portal. El analisis operativo usa bibliotecas + centros culturales + polideportivos como sustituto documentado.
- El criterio no negociable de arbolado viario se ha evaluado sobre el dataset oficial 2025 de arbolado detallado, separando viario mediante NUM_PARQUE nulo.
- El dataset oficial de arbolado no incluye diametro de copa. Para el prototipo de routing de sombra se usara una estimacion conservadora uniforme de 6 m por arbol.
