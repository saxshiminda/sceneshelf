import { createClient } from '../lib/http'
import { env } from '../lib/env'

/**
 * Laravel API (Breeze + Sanctum cookie session).
 * In local dev, baseUrl is '' and Vite proxies to Laravel (same-origin cookies).
 * All TMDB / OMDb traffic goes through Laravel — no API keys in the browser.
 */
export const backend = createClient({
  baseUrl: env.backendUrl,
  credentials: 'include',
  withXsrf: true,
  defaultHeaders: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
