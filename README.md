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
php artisan migrate
php artisan serve
```

Defaults: `http://localhost:8000` with `FRONTEND_URL=http://localhost:5173`.

### Client

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

Set `VITE_BACKEND_URL=http://localhost:8000` and your TMDB key in `.env.local`.

## Auth

Laravel Breeze (SPA cookie sessions via Sanctum):

1. `GET /sanctum/csrf-cookie`
2. `POST /register` or `POST /login`
3. `GET /api/user`
4. `POST /logout`
