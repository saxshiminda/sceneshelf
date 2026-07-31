# SceneShelf

A React + TypeScript + Vite app for discovering movies and series, and building a personal shelf.

## Setup

```bash
cp .env.example .env.local
# paste your TMDB API key into .env.local
npm install
npm run dev
```

Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

## API usage

```ts
import { api, tmdb, getTrending } from './api'

await api.get('/users')
await tmdb.get('/configuration')
await getTrending('week')
```

```
src/
  api/index.ts       # import { api, tmdb } from here
  api/clients.ts     # tmdb + backend clients
  api/movies.ts      # TMDB service functions
  lib/http.ts        # createClient (get/post/put/patch/delete)
  hooks/useFetch.ts
  hooks/useMutation.ts
  hooks/useMovies.ts
  pages/             # Home, Search, My Shelf, Login, Signup
```

More detail: [src/api/README.md](src/api/README.md).

## Routes

| Path | Page |
|------|------|
| `/home` | Discover + hero search |
| `/search` | Results + filters |
| `/myshelf` | Personal shelf (placeholder) |
| `/login` `/signup` | Auth UI (no backend yet) |

## Scripts

- `npm run dev` — local Vite server
- `npm run build` — typecheck + production build
- `npm run lint` — Oxlint
