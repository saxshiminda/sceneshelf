# API layer

```
Component → hooks → movies.ts → clients (tmdb) → http.ts → TMDB
```

| File | Role |
|------|------|
| `../lib/http.ts` | HTTP client factory (`createClient`) |
| `clients.ts` | `tmdb` + `backend` / `api` instances |
| `index.ts` | Import entry: `api`, `tmdb`, movie helpers |
| `movies.ts` | Named TMDB endpoints |
| `../hooks/useFetch.ts` | Read hook (loading / error / abort) |
| `../hooks/useMutation.ts` | Write hook (`mutate()`) |
| `../hooks/useMovies.ts` | `useTrending`, `useBrowse`, `useGenres` |

## Usage

```ts
import { api, tmdb, getTrending, discoverMovies } from '../api'

await api.get('/users')
await tmdb.get('/configuration')
await getTrending('all')
await discoverMovies({ with_genres: '28', page: 1 })
```

Free TMDB key: https://www.themoviedb.org/settings/api

To use your own backend later: set `VITE_BACKEND_URL`, keep secrets server-side, and call `api`.
