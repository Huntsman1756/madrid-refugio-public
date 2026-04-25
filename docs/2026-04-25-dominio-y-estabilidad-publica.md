# Dominio y estabilidad publica para Madrid Refugio

Fecha: 2026-04-25

Objetivo de este documento:
- quitar la dependencia del quick tunnel temporal
- dejar una URL publica estable para el backend
- dejar el frontend de Vercel apuntando a un hostname fijo
- poder apagar el portatil y olvidarse de cambios manuales

## Estado actual

Frontend publico: `https://madrid-refugio.vercel.app`
Backend local en VPS: `http://localhost:8000`
VPS: `168.119.158.141`
Dominio: `madridrefugio.es` (comprado, registrado hasta 2027)

## Resultado final deseado

- Frontend estable en un dominio propio: `https://madridrefugio.es`
- Backend estable en un subdominio fijo: `https://api.madridrefugio.es`
- Tunnel nombrado de Cloudflare apuntando al backend del VPS
- Vercel apuntando al backend estable
- sin quick tunnels manuales
- sin depender de una sesion SSH abierta

## Arquitectura

- Frontend: `Vercel`
- Backend: `FastAPI` en el VPS
- Publicacion del backend: `Cloudflare Tunnel` nombrado
- Dominio gestionado en Cloudflare

```
madridrefugio.es        -> Vercel
www.madridrefugio.es    -> Vercel
api.madridrefugio.es    -> Cloudflare Tunnel -> http://localhost:8000
```

## Tareas completadas

### 1. Comprar dominio

- [x] `madridrefugio.es` comprado via DonDominio
- Expira: 2027
- Registrado: 2026-04-25

### 2. Mover DNS a Cloudflare

- [x] Dominio anadido a Cloudflare
- [x] Nameservers cambiados en DonDominio:
  - `ariadne.ns.cloudflare.com`
  - `wells.ns.cloudflare.com`
- [x] Nameservers propagados (2026-04-25 ~04:24 UTC)

### 3. Crear hostname estable para el backend

- [x] Tunnel nombrado `refugio-api` (id: `7b7771e2-a6e6-458d-8b18-c0a4abea106c`)
- [x] `/etc/cloudflared/config.yml` actualizado:

```yml
tunnel: 7b7771e2-a6e6-458d-8b18-c0a4abea106c
credentials-file: /root/.cloudflared/7b7771e2-a6e6-458d-8b18-c0a4abea106c.json

ingress:
  - hostname: api.madridrefugio.es
    service: http://localhost:8000
  - service: http_status:404
```

- [x] DNS route creado: `api.madridrefugio.es` -> tunnel
- [x] Servicio `cloudflared` reiniciado y activo (4 conexiones establecidas)
- [x] Verificado: `curl https://api.madridrefugio.es/health` responde `200` (2026-04-25 ~09:04 UTC)

### 4. Apuntar Vercel al backend estable

- [x] `frontend/vercel.json` actualizado con rewrite a `https://api.madridrefugio.es/api/:path*`
- [x] Commit y push hecho
- [x] Deploy automatico en Vercel completado

### 5. Anadir dominio propio al frontend en Vercel

- [x] Dominios anadidos en Vercel: `madridrefugio.es` y `www.madridrefugio.es`
- [x] DNS records creados en Cloudflare via API:
  - `A @` -> `216.198.79.1` (proxied)
  - `CNAME www` -> `1c7f22a426b47848.vercel-dns-017.com` (proxied)
- [x] CNAME api proxied (naranja) en Cloudflare:
  - `CNAME api` -> `api.madridrefugio.es.coastline9050hmlb.com` (proxied)
- [x] SSL en Cloudflare activo (Full/Full Strict)

## Verificacion completa final - 2026-04-25 ~09:06 UTC

Backend:
```bash
curl https://api.madridrefugio.es/health
curl https://api.madridrefugio.es/api/health
```

Frontend:
- abrir `https://madridrefugio.es`
- probar `Equilibrada` y `Mas sombra`
- comprobar que no aparecen errores `Failed to fetch`
- comprobar que la peticion de red va a `/api/route`

Rutas de prueba buenas:
- `Nuevos Ministerios -> Plaza de Castilla`
- `Calle Atocha 1, Madrid -> Plaza Puerta Del Sol 1 B, Madrid`
- `Gran Via 1, Madrid -> Plaza Eliptica 1, Madrid`

Quick tunnel manual: eliminado con `pkill` (2026-04-25 ~09:04 UTC)

## Pendiente a futuro

### Unificar backend raiz y `deploy-vps/`

Hay cambios utiles aplicados manualmente en el VPS que no estan completamente versionados en `deploy-vps/`.

Conviene:
- revisar `deploy-vps/api.py`
- revisar `deploy-vps/docker-compose.yml`
- dejar repo y produccion alineados

### Cerrar huecos documentales de candidatura

Conviene ademas:

- mantener `Railway` solo como alternativa opcional en README y memoria
- conservar una arquitectura oficial unica para evaluacion externa
- documentar secretos y variables reales en `.env.example` y `SECURITY.md`

## Reglas

- `NEXT_PUBLIC_API_URL` no debe existir en variables de entorno de Vercel
- No volver a meter una URL temporal en las variables de entorno
- El tunnel nombrado `refugio-api` se mantiene (servicio systemd)
- El quick tunnel manual se elimina tras verificar el estable

## Checklist de cierre

- [x] dominio comprado
- [x] dominio en Cloudflare
- [x] dominio activo en Cloudflare (nameservers propagados)
- [x] `api.madridrefugio.es` responde `200`
- [x] Vercel sin `NEXT_PUBLIC_API_URL`
- [x] frontend apuntando a `api.madridrefugio.es`
- [x] quick tunnel eliminado
- [x] pruebas manuales de rutas correctas
- [x] web publica estable con dominio propio
- [ ] CI backend y frontend pasando
