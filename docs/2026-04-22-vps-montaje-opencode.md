# VPS montaje para Madrid Refugio

Fecha: 2026-04-22

Objetivo de este documento:
- dejar preparado el orden de montaje del nuevo VPS para `Madrid Refugio`
- mantener el frontend en `Vercel`
- mover solo el backend al VPS
- dejar instalado `OpenCode` y CLI base para que un LLM pueda completar la configuracion en la proxima sesion

## Arquitectura objetivo

- Frontend: `Vercel`
- Backend: `FastAPI + uvicorn` en VPS Ubuntu 24.04
- Proxy HTTPS: `Caddy`
- Proceso backend: `systemd`
- Datos persistentes: directorio fuera del repo, montado via `DATA_DIR`
- Dominio recomendado: `api.<tu-dominio>` o un subdominio temporal tipo DuckDNS

Nota de estado:

- Este documento describe un runbook de montaje de VPS.
- La arquitectura pública actualmente consolidada del proyecto usa `Vercel + VPS + Cloudflare Tunnel`.
- `Railway` permanece como alternativa opcional y no como infraestructura principal vigente.

## Lo que ya sabemos del repo

Referencias reales del proyecto:

- Backend principal: `api.py`
- Arranque actual en Railway: `python prepare_search_data.py && uvicorn api:app --host 0.0.0.0 --port $PORT`
- Healthcheck: `GET /health`
- Alias adicional: `GET /api/health`
- Directorio de datos configurable: `DATA_DIR`
- Valor por defecto local: `data/processed`
- CORS ya contempla `https://madrid-refugio.vercel.app` y acepta overrides por `FRONTEND_ORIGIN` y `ADDITIONAL_ALLOWED_ORIGINS`
- Secret conocido en `.env.example`: `AEMET_API_KEY`
- Token opcional para GitHub assets/API: `GITHUB_TOKEN` o `GH_TOKEN`
- Rewrite actual del frontend en Vercel: `frontend/vercel.json` apunta hoy a Railway

## Decisiones ya cerradas

- VPS comprado: OVH `VPS-2`
- Sistema: `Ubuntu 24.04`
- Frontend se queda en `Vercel`
- El VPS sera solo para este proyecto, pero tambien servira para entrar por SSH y usar CLI/OpenCode

## Resultado esperado al final

- `https://api.<dominio>/health` devuelve `200`
- `https://api.<dominio>/api/suggest` responde correctamente
- `https://api.<dominio>/api/route` responde correctamente
- El frontend en Vercel deja de apuntar a Railway y apunta al nuevo backend
- El backend queda persistente, reiniciable y con logs accesibles por `journalctl`
- OpenCode queda instalado y usable dentro del VPS

## Credenciales y datos a tener preparados antes de empezar

Obligatorio:

- acceso SSH al VPS
- usuario con `sudo`
- URL del repo GitHub
- ficheros grandes del runtime o acceso para descargarlos

Muy recomendable:

- dominio o subdominio para el backend
- `AEMET_API_KEY`
- `GITHUB_TOKEN` o `GH_TOKEN` con acceso de lectura al repo si hiciera falta descargar release assets autenticados

Para OpenCode:

- elegir proveedor/modelo antes de la sesion
- si vas con GitHub Copilot en OpenCode: tener lista la autenticacion web de GitHub
- si vas con OpenRouter/OpenAI/Anthropic/Zen: tener API key lista

## Rutas propuestas en el VPS

Usar estas rutas salvo razon fuerte para cambiarlas:

- app: `/srv/refugio_madrid/app`
- venv: `/srv/refugio_madrid/venv`
- datos persistentes: `/srv/refugio_madrid/data/processed`
- env del servicio: `/etc/refugio_madrid.env`
- servicio systemd: `/etc/systemd/system/refugio_madrid.service`
- config Caddy: `/etc/caddy/Caddyfile`

## Orden de montaje

### Fase 1. Acceso inicial y endurecimiento minimo

1. Entrar por SSH.
2. Actualizar paquetes.
3. Crear usuario de trabajo si OVH no lo deja fino de inicio.
4. Configurar clave SSH y desactivar acceso por password si procede.
5. Activar firewall basico:
   - `22/tcp`
   - `80/tcp`
   - `443/tcp`
6. Instalar `fail2ban` si quieres dejarlo fino desde el dia 1.

Comandos base orientativos:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip htop jq ufw fail2ban ca-certificates gnupg
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo systemctl enable --now fail2ban
```

### Fase 2. Runtime base para app y CLI

Instalar:

- `python3`
- `python3-venv`
- `python3-pip`
- `build-essential`
- `nodejs`
- `npm`
- `gh`
- `caddy`

Comandos orientativos:

```bash
sudo apt install -y python3 python3-venv python3-pip build-essential caddy
sudo apt install -y nodejs npm
type gh >/dev/null 2>&1 || (curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null && sudo apt update && sudo apt install -y gh)
```

Notas:

- Si quieres Node LTS fino, mejor instalarlo con `nvm` o NodeSource en vez del paquete por defecto de Ubuntu.
- Para este proyecto el backend no depende de Node, pero OpenCode si puede necesitar ecosistema Node segun metodo de instalacion.

### Fase 3. Instalar OpenCode

Referencias comprobadas hoy:

- instalacion rapida: `curl -fsSL https://opencode.ai/install | bash`
- alternativa: `npm install -g opencode-ai`

Ruta recomendada:

1. Instalar OpenCode.
2. Verificar que `opencode --help` responde.
3. Dejar config global en `~/.config/opencode/opencode.json`.
4. Autenticar proveedor con `/connect` o con variables de entorno.

Configuracion inicial recomendada:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "autoupdate": true,
  "share": "manual",
  "permission": {
    "bash": "ask",
    "edit": "ask"
  },
  "watcher": {
    "ignore": [
      "node_modules/**",
      ".git/**",
      ".next/**",
      "__pycache__/**"
    ]
  }
}
```

Opciones de proveedor para la proxima sesion:

- GitHub Copilot: OpenCode soporta autenticacion via `/connect` con login por dispositivo
- OpenRouter/OpenAI/Anthropic/Zen: tambien validos si prefieres API key

Comprobaciones:

```bash
opencode --help
opencode
```

Dentro de OpenCode:

- `/connect`
- `/models`

### Fase 4. Clonar el proyecto y preparar estructura

```bash
sudo mkdir -p /srv/refugio_madrid
sudo chown -R $USER:$USER /srv/refugio_madrid
git clone <URL_DEL_REPO> /srv/refugio_madrid/app
python3 -m venv /srv/refugio_madrid/venv
/srv/refugio_madrid/venv/bin/pip install --upgrade pip
/srv/refugio_madrid/venv/bin/pip install -r /srv/refugio_madrid/app/requirements.txt
mkdir -p /srv/refugio_madrid/data/processed
```

### Fase 5. Cargar datos persistentes

En `DATA_DIR` deben existir como minimo estos ficheros de runtime:

- `madrid_shadow_graph.graphml`
- `shadow_matrix.parquet`

Tambien conviene dejar preparados:

- `213605-4-callejero-oficial-madrid-csv.csv`
- `madrid_search_index.json`
- `madrid_search_index.meta.json`

Nota operativa importante:

- `refugios_sustitutos.geojson` y `fuentes.geojson` se leen desde `data/processed` dentro del repo, no desde `DATA_DIR`
- por tanto, esos dos deben existir en el checkout del repo

Fuentes para meter los datos:

- copia manual por `scp`/`rsync`
- descarga desde GitHub release
- dejar que el backend descargue algunos assets si tiene token y logica habilitada

Comandos ejemplo desde tu maquina local:

```bash
scp madrid_shadow_graph.graphml usuario@IP:/srv/refugio_madrid/data/processed/
scp shadow_matrix.parquet usuario@IP:/srv/refugio_madrid/data/processed/
scp 213605-4-callejero-oficial-madrid-csv.csv usuario@IP:/srv/refugio_madrid/data/processed/
scp madrid_search_index.json usuario@IP:/srv/refugio_madrid/data/processed/
scp madrid_search_index.meta.json usuario@IP:/srv/refugio_madrid/data/processed/
```

### Fase 6. Crear archivo de entorno del servicio

Crear `/etc/refugio_madrid.env` con algo de este estilo:

```dotenv
DATA_DIR=/srv/refugio_madrid/data/processed
LOG_LEVEL=INFO
AEMET_API_KEY=<TU_AEMET_API_KEY>
FRONTEND_ORIGIN=https://madrid-refugio.vercel.app
ADDITIONAL_ALLOWED_ORIGINS=
GITHUB_TOKEN=
GH_TOKEN=
FORCE_REFRESH_GRAPH_FROM_RELEASE=0
```

Permisos:

```bash
sudo chown root:root /etc/refugio_madrid.env
sudo chmod 600 /etc/refugio_madrid.env
```

### Fase 7. Probar backend sin systemd

Antes de dejarlo como servicio:

```bash
set -a
source /etc/refugio_madrid.env
set +a
cd /srv/refugio_madrid/app
/srv/refugio_madrid/venv/bin/python prepare_search_data.py
/srv/refugio_madrid/venv/bin/uvicorn api:app --host 127.0.0.1 --port 8000
```

Verificaciones locales en el servidor:

```bash
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1:8000/api/health
```

Si `/health` falla, revisar en este orden:

1. `DATA_DIR`
2. existencia de `madrid_shadow_graph.graphml`
3. existencia de `shadow_matrix.parquet`
4. dependencias Python
5. memoria libre del VPS

### Fase 8. Crear servicio systemd

Crear `/etc/systemd/system/refugio_madrid.service`:

```ini
[Unit]
Description=Madrid Refugio FastAPI backend
After=network.target

[Service]
Type=simple
User=<USUARIO_SSH>
WorkingDirectory=/srv/refugio_madrid/app
EnvironmentFile=/etc/refugio_madrid.env
ExecStart=/bin/bash -lc '/srv/refugio_madrid/venv/bin/python prepare_search_data.py && /srv/refugio_madrid/venv/bin/uvicorn api:app --host 127.0.0.1 --port 8000'
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Aplicar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now refugio_madrid
sudo systemctl status refugio_madrid
journalctl -u refugio_madrid -n 200 --no-pager
```

### Fase 9. Poner Caddy delante

Caso recomendado con dominio o subdominio:

```caddyfile
api.midominio.com {
    encode gzip zstd

    reverse_proxy 127.0.0.1:8000
}
```

Aplicar:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Notas:

- Caddy gestiona HTTPS automaticamente si el DNS ya apunta al VPS
- si aun no tienes dominio, puedes dejar el backend temporalmente en `http://IP:8000` para pruebas internas, pero no es el final deseable para Vercel

### Fase 10. Cambiar Vercel para dejar de usar Railway

Hoy `frontend/vercel.json` reescribe `/api/:path*` hacia:

```text
https://web-production-1f04a.up.railway.app/api/:path*
```

Cuando el backend del VPS este validado, cambiar esa URL al nuevo endpoint, por ejemplo:

```text
https://api.midominio.com/api/:path*
```

Despues desplegar frontend en Vercel y verificar:

- pagina carga
- autocompletado llama al backend nuevo
- calculo de ruta funciona

## Secuencia recomendada para la proxima sesion con LLM

Prompt recomendado para el agente en el VPS:

```text
Estamos en el VPS nuevo de Madrid Refugio. No quiero tocar funcionalidad de la app salvo lo minimo para dejarla desplegada. Sigue el runbook docs/2026-04-22-vps-montaje-opencode.md. Objetivo: instalar runtime base, instalar OpenCode CLI, clonar el repo en /srv/refugio_madrid/app, configurar el backend FastAPI con systemd y Caddy, validar /health y dejar pendiente o aplicado el cambio final de Vercel desde Railway al nuevo backend. Antes de editar nada, inspecciona el repo y confirma los pasos. No hagas cambios destructivos y pide confirmacion si falta dominio, secretos o ficheros de datos.
```

Orden de trabajo para el agente:

1. verificar acceso, RAM y disco
2. instalar paquetes base
3. instalar `gh` y `opencode`
4. autenticar proveedor de OpenCode si el usuario lo facilita
5. clonar repo y crear venv
6. cargar o verificar datos persistentes
7. crear `/etc/refugio_madrid.env`
8. probar `uvicorn` local
9. crear `systemd`
10. poner `Caddy`
11. validar `/health`
12. si ya hay dominio, preparar cambio de `frontend/vercel.json`

## Checklist de verificacion final

- `free -h`
- `df -h`
- `systemctl status refugio_madrid`
- `journalctl -u refugio_madrid -n 200 --no-pager`
- `curl -i http://127.0.0.1:8000/health`
- `curl -i https://api.<dominio>/health`
- `curl -i https://api.<dominio>/api/health`
- prueba manual desde frontend en Vercel

## Riesgos conocidos

- sin dominio/subdominio el cierre fino con Vercel queda incompleto
- si faltan `madrid_shadow_graph.graphml` o `shadow_matrix.parquet`, el backend no quedara operativo
- el backend ya fue sensible a memoria en Railway; aunque este VPS va holgado, no conviene meter mas servicios pesados a la vez
- `prepare_search_data.py` puede regenerar o descargar artefactos y alargar el primer arranque

## Lo que NO haria en la primera sesion

- no moveria el frontend fuera de Vercel
- no meteria Docker si el objetivo es salir rapido y estable
- no cambiaria arquitectura del proyecto
- no tocaria codigo de negocio salvo que el despliegue descubra una incidencia real

## Ficheros del repo relevantes para esta migracion

- `README.md`
- `api.py`
- `requirements.txt`
- `railway.json`
- `frontend/vercel.json`
- `.env.example`
