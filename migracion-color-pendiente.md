# Migración de Color - Pendiente

## Estado actual
- ✅ `globals.css`: variables `--climate-green`, `--climate-terracotta`, `--climate-cyan` + aliases `--brand-*`
- ✅ `Icons.tsx`: 13 iconos line-art con paleta nueva
- ✅ Migración de iconos lucide -> custom en 4 archivos
- ✅ Migración de colores hex -> variables CSS (completa en archivos listados)
- ✅ `tsc --noEmit --skipLibCheck` pasa sin errores

## Estado de migración

### ✅ Todos los archivos de la lista completados
- **RoutingSection.tsx** — banner "Ejemplo cargado", shade card, shade progress, tarjetas refugios/consejo
- **page.tsx** — journeySteps, valuePillars, badge hero-chip, quote box, hero-chip icons, sourceCards color
- **HomeVisuals.tsx** — ~58 ocurrencias (#2d6a4f, #52b788, #f6ad55, #0ea5e9, #1a3d2b) → variables CSS
- **MapComponent.tsx** — heat gradient (#f6ad55), brandedTreeIcon (#2d6a4f, #52b788)
- **SearchBar.tsx** — MapPin icon, botón ubicación, botón buscar, hora seleccionada, preferencia seleccionada

### ⏳ No tocados (fuera de scope de migración climática)
- page.tsx l199 `#0a72ef` — azul sourceCard (no es verde/terracotta/cyan)
- page.tsx l357 `#0a72ef`, `#ebf5ff` — diagóstico card azul (no es verde)
- page.tsx l413 `#0a72ef`, `#de1d8d`, `#ff5b4f` — gradient multi-color (no es verde)
- page.tsx l587 `#0a72ef` — hover link azul (no es verde)
- MapComponent.tsx l352 — solo comentario textual

### 1. RoutingSection.tsx
Reemplazar hex que quedaron fuera de los edits anteriores:

| Línea aprox. | Antiguo | Nuevo |
|---|---|---|
| banner "Ejemplo cargado" (l269) | `border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(220,252,231,0.82))] text-emerald-700 text-emerald-900` | `border-[var(--climate-green)]/20 bg-[linear-gradient(180deg,rgba(244,250,245,0.96),rgba(233,245,238,0.82))] text-[var(--climate-green)] text-[var(--climate-green)]` |
| botón "Simular día" (l303) | `bg-[#1a3d2b] border-[#1a3d2b] shadow-[0_12px_20px_rgba(26,61,43,0.20)]` | `bg-[var(--climate-green)] border-[var(--climate-green)] shadow-[0_12px_20px_rgba(74,124,89,0.20)]` |
| shade progress bar (l387) | `border-[#d4ead7]` | `border-[var(--climate-green)]/20` |
| shade card bg (l387) | `bg-[#d4ead7]` | `bg-[var(--climate-green)]/10` |
| shade gradient (l407) | `bg-[linear-gradient(90deg,#52b788,#2d6a4f)]` | `bg-[linear-gradient(90deg,var(--climate-green),var(--climate-green))]` (ya cambiado) |
| tarjetas refugios/consejo (l499, l537) | `border-[#d4ead7] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(244,250,245,0.95))] shadow-[0_14px_32px_rgba(45,106,79,0.08)]` | `border-[var(--climate-green)]/14 bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(240,247,242,0.95))] shadow-[0_14px_32px_rgba(74,124,89,0.08)]` |
| hero-chip iconos (l249,256,262 en page.tsx) | `text-[#2d6a4f]` | `text-[var(--climate-green)]` |

### 2. page.tsx
| Línea | Antiguo | Nuevo |
|---|---|---|
| journeySteps tone (l158,165) | `bg-[#ebf5ff] text-[#0a72ef]` / `bg-[#f0fdf4] text-[#2d6a4f]` | `bg-[var(--ds-gray-50)] text-[var(--ds-gray-600)]` / `bg-[var(--climate-green)]/10 text-[var(--climate-green)]` |
| valuePillars tone (l181,188) | `bg-[#f0fdf4] text-[#2d6a4f]` | `bg-[var(--climate-green)]/10 text-[var(--climate-green)]` |
| sourceCards color (l204) | `color: "#0ea5e9"` | `color: "var(--brand-blue)"` |
| hero-chip icons (l249,256,262) | `text-[#2d6a4f]` | `text-[var(--climate-green)]` |
| badge "Madrid caminado..." (l237) | `border-[rgba(45,106,79,0.12)] text-[#2d6a4f]` | `border-[rgba(74,124,89,0.12)] text-[var(--climate-green)]` |
| quote box (l322,325) | `text-[#2d6a4f]` | `text-[var(--climate-green)]` |

### 3. HomeVisuals.tsx (~50 ocurrencias)
Este archivo tiene muchos SVGs inline. Reemplazar:
- `#2d6a4f` -> `var(--climate-green)` (verde principal, ~35 ocurrencias)
- `#f6ad55` -> `var(--climate-terracotta)` (sol/alertas, ~12 ocurrencias)
- `#0ea5e9` -> `var(--climate-cyan)` (agua, ~3 ocurrencias)
- `#52b788` -> `var(--climate-green)` (verde secundario en árbol)

### 4. MapComponent.tsx
| Línea | Antiguo | Nuevo |
|---|---|---|
| heat gradient (l74) | `0.45: '#f6ad55'` | `0.45: 'var(--climate-terracotta)'` |
| brandedTreeIcon (l226) | `fill="#2d6a4f"` / `fill="#52b788"` | `fill="var(--climate-green)"` / `fill="var(--climate-green)"` |

### 5. SearchBar.tsx
| Línea | Antiguo | Nuevo |
|---|---|---|
| MapPin icon (l357) | `text-emerald-700` | `text-[var(--climate-green)]` |
| botón "Mi ubicación" (l363) | `bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100` | `bg-[var(--climate-green)]/10 text-[var(--climate-green)] hover:bg-[var(--climate-green)]/15` |
| hora seleccionada (l448) | `border-[#1a3d2b] bg-[#1a3d2b] shadow-[0_12px_20px_rgba(26,61,43,0.20)]` | `border-[var(--climate-green)] bg-[var(--climate-green)] shadow-[0_12px_20px_rgba(74,124,89,0.20)]` |
| preference seleccionada (l467) | `border-emerald-600 bg-emerald-600 text-white shadow-[0_12px_20px_rgba(22,163,74,0.22)]` | `border-[var(--climate-green)] bg-[var(--climate-green)] text-white shadow-[0_12px_20px_rgba(74,124,89,0.22)]` |
| botón buscar (l431) | `bg-[linear-gradient(180deg,#1f7a45,#14532d)] shadow-[0_18px_32px_rgba(20,83,45,0.26)] hover:bg-[#15803d]` | `bg-[var(--climate-green)] shadow-[0_18px_32px_rgba(74,124,89,0.26)] hover:opacity-90` |

## Notas para la próxima sesión
- Después de cada archivo, ejecutar `npx tsc --noEmit --skipLibCheck` para verificar
- El error de `leaflet.markercluster` es preexistente (no bloquea migración de color)
- Usar `var(--climate-green)` en lugar de `var(--brand-green)` porque Tailwind registra `--color-climate-green` en `@theme inline`, no `--color-brand-green`
- Los hex con `rgba()` necesitan recalcularse: `rgba(45,106,79,0.12)` = `rgba(74,124,89,0.12)`
