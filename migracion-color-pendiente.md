# Migración de Color - Completada

## Estado final
- ✅ `globals.css`: variables `--climate-green`, `--climate-terracotta`, `--climate-cyan` + aliases `--brand-*`
- ✅ `Icons.tsx`: 13 iconos line-art con paleta nueva
- ✅ Migración de iconos lucide -> custom en 4 archivos
- ✅ Migración de colores hex -> variables CSS (completa en todos los archivos)
- ✅ `tsc --noEmit --skipLibCheck` pasa sin errores

## Archivos migrados
- **RoutingSection.tsx** — todas las referencias a `#2d6a4f`, `#52b788`, `emerald-*` reemplazadas
- **page.tsx** — journeySteps, valuePillars, badge, quote box, hero-chip icons, sourceCards
- **HomeVisuals.tsx** — ~58 ocurrencias de hex → variables CSS
- **MapComponent.tsx** — heat gradient, brandedTreeIcon
- **SearchBar.tsx** — MapPin, botón ubicación, hora/preferencia seleccionadas, botón buscar

## Hex fuera de scope (deliberadamente mantenidos)
- `page.tsx` — `#0a72ef` (azul sourceCard, diagóstico card, gradient multi-color, hover link) — no es parte de la paleta climática

## Notas
- Usar `var(--climate-green)` y no `var(--brand-green)` — Tailwind sólo registra `--color-climate-green` en `@theme inline`
- `rgba()` con el verde usa `rgba(74,124,89,...)` (no `rgba(45,106,79,...)`)
- El error de `leaflet.markercluster` es preexistente y no está relacionado con colores
