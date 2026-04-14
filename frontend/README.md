# Frontend de Madrid Refugio

Aplicación Next.js que sirve la interfaz pública de Madrid Refugio.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Build de producción

```bash
npm run build
npm run start
```

## Estructura principal

- `src/app/page.tsx`: home pública y análisis territorial
- `src/components/SearchBar.tsx`: buscador principal de rutas
- `src/components/RoutingSection.tsx`: cálculo y visualización de rutas
- `src/components/MapComponent.tsx`: mapa reutilizable para rutas y análisis territorial
- `src/app/metodologia/page.tsx`: memoria técnica accesible desde la web

## Despliegue

El frontend se despliega en Vercel. El proyecto raíz define `Root Directory = frontend`, por lo que los despliegues de producción deben hacerse desde la raíz del repositorio o respetando esa configuración.
