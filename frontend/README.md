# BaraFit — Frontend

PWA (Progressive Web App) en React + TypeScript + Vite que replica la funcionalidad de
[Harbiz](https://www.harbiz.io) para entrenadores personales y sus clientes.

Este directorio contiene solo el frontend. Habla con la API real en [`../backend`](../backend)
(Laravel) — no guarda datos localmente salvo el token de sesión.

## Desarrollo

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:8000
npm run dev             # servidor de desarrollo
npm run build            # build de producción (genera manifest + service worker)
npm run preview          # sirve el build de producción
```

El backend (`../backend`) debe estar corriendo para poder iniciar sesión y usar la app —
ver sus instrucciones de instalación en `../backend/README.md`.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Zustand (solo para estado de UI/sesión,
ya no como base de datos), Recharts, `vite-plugin-pwa` (manifest + service worker con Workbox
para instalabilidad y caché offline del app shell).
