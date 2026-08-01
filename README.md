# SceneShelf

Movie discovery shelf — React client + Laravel API.

## Structure

```
client/   React (Vite) frontend
api/      Laravel Breeze + Sanctum API (also proxies TMDB / OMDb)
```

## Setup

### API

```bash
cd api
cp .env.example .env
composer install
php artisan key:generate
# Required: TMDB_API_KEY=...
# Optional: OMDB_API_KEY=...
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

### Client

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

Leave `VITE_BACKEND_URL` empty so Vite proxies Laravel. Set `VITE_API_PROXY_TARGET` to your artisan URL.

**No TMDB key in the client** — React calls `/api/tmdb/...`, Laravel calls TMDB.

## Auth

1. Register / login with email + password
2. Or **Log in with TMDB** (browser approve → `/auth/callback`)

## Shelf

Authenticated users can toggle watched / want to watch / favorites on title + search pages. Lists live under **My Shelf**.
