# BaraFit API

Laravel 13 API backend for **BaraFit**, a fitness-coaching PWA with two roles
(`trainer`, `client`). Built to replace a browser-only localStorage mock in
the sibling React/Vite frontend (`../frontend`). Authentication is Sanctum in
**token mode** (Bearer tokens) — there is no cookie/session assumption, so a
separately-hosted frontend can talk to this API from any origin.

## Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

The API is then available at `http://127.0.0.1:8000/api`.

Mail (client invites) uses the `log` driver by default — sent emails land in
`storage/logs/laravel.log` instead of actually being delivered, which is
fine for local dev since every invite response also includes a ready-to-use
`acceptUrl`.

## Seeded demo credentials

All passwords are `password`.

| Role    | Name             | Email                 |
|---------|------------------|------------------------|
| Trainer | Carlos Ríos      | carlos@barafit.app     |
| Client  | Lucía Fernández  | lucia@example.com      |
| Client  | Marcos Iglesias  | marcos@example.com     |
| Client  | Paula Gómez      | paula@example.com      |

The seed also creates 10 exercises, a 3-day workout plan for Lucía, nutrition
plans for Lucía and Marcos, several bookings (two 1:1 sessions, a completed
session, and a recurring weekly group class with capacity 6 and 2 attendees
across 4 occurrences sharing one `seriesId`), progress entries over several
weeks for Lucía and Marcos, a conversation with a few messages per client,
and invoices in `paid`, `pending`, and `overdue` states.

## Endpoints

All routes are under `/api`. Routes marked **public** need no `Authorization`
header; everything else requires `Authorization: Bearer <token>`.

**Auth**
- `POST /register` (public) — trainer self-signup
- `POST /login` (public)
- `POST /logout`
- `GET /me`

**Clients / invites**
- `GET /clients` — trainer: their clients
- `GET /clients/{id}`
- `POST /clients/invite` (trainer) — creates an invite, emails it, returns the invite incl. `acceptUrl`
- `GET /invites/{token}` (public)
- `POST /invites/{token}/accept` (public) — `{password}`, creates the client account + returns a token

**Exercises** (full CRUD, scoped to the trainer)
- `GET/POST /exercises`, `GET/PUT/PATCH/DELETE /exercises/{id}`

**Workout plans**
- `GET/POST /workout-plans` (filter `?clientId=`)
- `GET/PUT /workout-plans/{id}` — PUT replaces the whole `days`/`items` tree transactionally
- `GET /workout-plans/{id}/completions` — list completions for the plan
- `POST /workout-plans/{id}/completions` (client) — `{dayId, date, completedItemIds}`, upserts

**Nutrition plans**
- `GET/POST /nutrition-plans` (filter `?clientId=`)
- `GET/PUT /nutrition-plans/{id}` — PUT replaces the whole `meals` list

**Bookings**
- `GET /bookings` — trainer: theirs; client: ones they attend
- `GET /bookings/available` (client) — upcoming group classes from their trainer with open spots they haven't joined
- `POST /bookings` — supports `capacity` (group classes) and `recurrence: {freq:"weekly", until}` (creates one booking per week sharing a `seriesId`)
- `PATCH /bookings/{id}` — status/details
- `DELETE /bookings/{id}` — single occurrence
- `DELETE /bookings/series/{seriesId}` — whole recurring series
- `POST /bookings/{id}/attendees` — `{clientId?}` (self-join for clients, or a trainer adding any of their clients); 422 past capacity
- `DELETE /bookings/{id}/attendees/{clientId}`

**Progress entries**
- `GET /progress-entries` (filter `?clientId=`)
- `POST /progress-entries` — multipart; optional `photo` file, stored under `storage/app/public/progress-photos`

**Conversations / messages**
- `GET /conversations` — mine (auto-created per trainer/client pair)
- `GET /conversations/{id}/messages`
- `POST /conversations/{id}/messages` — `{text}`

**Invoices**
- `GET /invoices` (filter `?clientId=`)
- `POST /invoices` (trainer)
- `PATCH /invoices/{id}` — `{status}`; a client may only set their own invoice to `paid`, a trainer may set any status

## Authorization

Every resource is scoped with real Laravel `Policy` classes
(`app/Policies/*`), registered in `AppServiceProvider` and enforced via
`$this->authorize(...)` in controllers — trainers only ever see/mutate their
own clients' data, and clients only ever see/mutate their own.

## Production: swapping SQLite for MySQL/PostgreSQL

All migrations use plain, portable Schema Builder syntax (no SQLite-only
features), so moving to MySQL or PostgreSQL is a config-only change — set
`DB_CONNECTION` to `mysql` or `pgsql` and fill in `DB_HOST`, `DB_PORT`,
`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` in `.env` (examples are commented
in `.env.example`), then run `php artisan migrate --seed` against that
database. No migration or model code needs to change.
