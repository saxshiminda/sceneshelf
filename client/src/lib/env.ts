/**
 * Typed env access.
 * TMDB / OMDb API keys live only on the Laravel server.
 */

export const env = {
  /** Public TMDB image CDN (no secret). */
  tmdbImageBase:
    (import.meta.env.VITE_TMDB_IMAGE_BASE as string | undefined)?.replace(/\/+$/, '') ||
    'https://image.tmdb.org/t/p',
  /**
   * Laravel origin. Leave empty in local dev so requests stay same-origin
   * and Vite proxies them (avoids cross-origin cookie / CORS issues).
   */
  backendUrl: (() => {
    const raw = import.meta.env.VITE_BACKEND_URL as string | undefined
    if (typeof raw === 'string') return raw.replace(/\/+$/, '')
    return import.meta.env.DEV ? '' : 'http://localhost:8000'
  })(),
}
