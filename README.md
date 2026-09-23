# BaraFit

Plataforma todo-en-uno para entrenadores personales y sus clientes — rutinas, nutrición,
reservas/clases, pagos, progreso y chat — que replica la funcionalidad de
[Harbiz](https://www.harbiz.io) como PWA instalable con backend propio.

## Estructura del monorepo

- **[`backend/`](backend)** — API REST en Laravel (auth con Sanctum, base de datos, envío de
  emails de invitación, almacenamiento de fotos de progreso).
- **[`frontend/`](frontend)** — PWA en React + TypeScript + Vite que consume la API.

Cada carpeta tiene su propio `README.md` con instrucciones de instalación y despliegue.

## Arrancar todo en local

```bash
# Terminal 1 — backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
php artisan serve

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Credenciales de las cuentas de ejemplo sembradas por el backend: ver `backend/README.md`.

## Despliegue

Ver [`DEPLOYMENT.md`](DEPLOYMENT.md): GitHub Actions compila el frontend y actualiza
el backend automáticamente por SSH en cada push — el servidor nunca necesita Node.js.
