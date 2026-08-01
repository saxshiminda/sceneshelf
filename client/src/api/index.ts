/**
 * Simple entry point for HTTP calls.
 *
 *   import { api, tmdb, getTrending } from '../api'
 */

export { createClient, ApiError } from '../lib/http'
export type { HttpClient, RequestOptions, ClientConfig } from '../lib/http'

export { tmdb, backend } from './clients'

/** Default client for your own API — get, post, put, patch, delete. */
export { backend as api } from './clients'

export * from './movies'
export * from './auth'
export * from './omdb'
export * from './shelf'
