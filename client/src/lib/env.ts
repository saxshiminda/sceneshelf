/**
 * Typed env access. Missing VITE_* vars fail fast at startup.
 * Note: VITE_ values are public in the browser bundle — proxy secrets via your backend in production.
 */

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing env var ${String(name)}. Copy .env.example to .env.local and fill it in.`,
    )
  }

  return value
}

export const env = {
  tmdbApiKey: requireEnv('VITE_TMDB_API_KEY'),
  tmdbBaseUrl: requireEnv('VITE_TMDB_BASE_URL'),
  tmdbImageBase: requireEnv('VITE_TMDB_IMAGE_BASE'),
  /**
   * Laravel origin. Leave empty in local dev so requests stay same-origin
   * and Vite proxies them (avoids cross-origin cookie / CORS issues).
   */
  backendUrl: (() => {
    const raw = import.meta.env.VITE_BACKEND_URL as string | undefined
    if (typeof raw === 'string') return raw.replace(/\/+$/, '')
    return import.meta.env.DEV ? '' : 'http://localhost:8000'
  })(),
  /** Optional — enables real IMDb ratings via OMDb (https://www.omdbapi.com/apikey.aspx). */
  omdbApiKey: (import.meta.env.VITE_OMDB_API_KEY as string | undefined)?.trim() ?? '',
}
