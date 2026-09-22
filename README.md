# BaraFit

PWA (Progressive Web App) que replica la funcionalidad de [Harbiz](https://www.harbiz.io) —la plataforma
todo-en-uno para entrenadores personales y sus clientes— usando una única base de código web
instalable, en lugar de apps nativas separadas por plataforma.

## Funcionalidad

**Panel de entrenador**
- Dashboard con clientes activos, próximas sesiones e ingresos
- Gestión de clientes e invitaciones
- Constructor de rutinas (días, ejercicios, series/reps/carga/descanso)
- Biblioteca de ejercicios por grupo muscular
- Planes de nutrición con macros y comidas
- Agenda de sesiones individuales y clases grupales
- Facturación y seguimiento de pagos
- Chat con cada cliente

**Área de cliente**
- Rutina asignada con marcado de series completadas
- Plan nutricional con macros diarios
- Reserva de sesiones/clases
- Registro de progreso (peso, % grasa, medidas, fotos) con gráficas
- Chat con su entrenador
- Historial de pagos

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Zustand (persistencia en
`localStorage` como backend simulado), Recharts, `vite-plugin-pwa` (manifest + service worker
con Workbox para instalabilidad y caché offline del app shell).

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción (genera manifest + service worker)
npm run preview   # sirve el build de producción
```

Al entrar, la pantalla de login permite elegir una cuenta demo de entrenador o de cliente
(los datos se generan la primera vez y se guardan en `localStorage`).
