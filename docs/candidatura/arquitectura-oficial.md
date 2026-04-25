# Arquitectura oficial del proyecto

Fecha de referencia: 2026-04-25

## Arquitectura principal

- Frontend: `Next.js` desplegado en `Vercel`
- Backend: `FastAPI` desplegado en infraestructura propia
- Exposición pública del backend: `Cloudflare Tunnel`
- Dominio principal: `https://madridrefugio.es`
- Subdominio API: `https://api.madridrefugio.es`

## Flujo operativo

1. Los artefactos geoespaciales pesados se generan offline.
2. Los artefactos de runtime se conservan fuera del código fuente cuando procede.
3. El backend arranca validando datos y publicando `GET /health`.
4. Las consultas del frontend entran por `/api/*` y se reenvían al backend estable.

## Decisión de arquitectura

Esta es la arquitectura oficial para evaluación, demostración pública y candidatura.

## Alternativas documentadas

- `Railway`: alternativa opcional para desplegar el backend.
- Configuraciones antiguas o transitorias: se conservan solo como referencia técnica, no como fuente de verdad operativa principal.

## Fuente de verdad documental

Para presentación externa y revisión funcional, esta arquitectura prevalece sobre notas históricas de despliegue.
