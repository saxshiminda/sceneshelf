# SceneShelf

Movie discovery shelf — React client + Laravel API.

## Structure

```
client/   React (Vite) frontend
api/      Laravel Breeze + Sanctum API
```

## Setup

### API

```bash
cd api
cp .env.example .env
composer install
php artisan key:generate
# Set TMDB_API_KEY in .env (same key as the client)
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

If port 8000 is busy, use another port (e.g. `8001`) and set `VITE_API_PROXY_TARGET` in the client to match.

Defaults: `FRONTEND_URL=http://localhost:5173`.

### Client

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

Leave `VITE_BACKEND_URL` empty so the Vite dev server proxies Laravel (`/login`, `/sanctum`, `/api`, …). That keeps auth cookies same-origin and avoids cross-origin / CORS issues.

Set your TMDB key and `VITE_API_PROXY_TARGET` (Laravel URL) in `.env.local`.

## Auth

Three ways to sign in:

1. **Register / login** — email + password (`POST /register`, `POST /login`)
2. **TMDB credentials** — TMDB username + password on the login page
3. **TMDB browser approve** — redirect to themoviedb.org, then `/auth/callback`

TMDB flows call `POST /auth/tmdb` with a `session_id`. Laravel verifies it with TMDB, upserts the user (tmdb id, username, avatar, prefs), and starts a Sanctum session.
