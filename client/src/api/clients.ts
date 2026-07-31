import { createClient } from '../lib/http'
import { env } from '../lib/env'

/** The Movie Database (TMDB) — api_key on every request. */
export const tmdb = createClient({
  baseUrl: env.tmdbBaseUrl,
  defaultHeaders: {
    Accept: 'application/json',
  },
  defaultQuery: {
    api_key: env.tmdbApiKey,
  },
})

/**
 * Laravel API (Breeze + Sanctum cookie session).
 * Base URL is the app origin (e.g. http://localhost:8000), not /api.
 */
export const backend = createClient({
  baseUrl: env.backendUrl || 'http://localhost:8000',
  credentials: 'include',
  withXsrf: true,
  defaultHeaders: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
