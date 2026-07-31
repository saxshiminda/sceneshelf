import { backend, tmdb } from './clients'
import type { RequestOptions } from '../lib/http'
import type {
  DeleteSessionResponse,
  LoginPayload,
  RegisterPayload,
  RequestTokenResponse,
  SessionResponse,
  TmdbAccount,
  User,
} from '../types/auth'

/** Seed Sanctum CSRF cookie before login/register/logout. */
export function getCsrfCookie(options?: RequestOptions) {
  return backend.get<void>('/sanctum/csrf-cookie', options)
}

export async function login(payload: LoginPayload, options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.post<void>('/login', payload, options)
}

export async function register(payload: RegisterPayload, options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.post<void>('/register', payload, options)
}

export async function logout(options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.post<void>('/logout', {}, options)
}

export function getUser(options?: RequestOptions) {
  return backend.get<User>('/api/user', options)
}

/** Sync a TMDB session into Laravel (creates/updates user + Sanctum login). */
export async function syncTmdbSession(sessionId: string, options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.post<User>('/auth/tmdb', { session_id: sessionId }, options)
}

/* —— TMDB auth helpers —— */

export function createRequestToken(options?: RequestOptions) {
  return tmdb.get<RequestTokenResponse>('/authentication/token/new', options)
}

export function validateTokenWithLogin(
  username: string,
  password: string,
  requestToken: string,
  options?: RequestOptions,
) {
  return tmdb.post<RequestTokenResponse>(
    '/authentication/token/validate_with_login',
    { username, password, request_token: requestToken },
    options,
  )
}

export function createSession(requestToken: string, options?: RequestOptions) {
  return tmdb.post<SessionResponse>(
    '/authentication/session/new',
    { request_token: requestToken },
    options,
  )
}

export function deleteSession(sessionId: string, options?: RequestOptions) {
  return tmdb.delete<DeleteSessionResponse>('/authentication/session', {
    ...options,
    body: { session_id: sessionId },
  })
}

export function getTmdbAccount(sessionId: string, options?: RequestOptions) {
  return tmdb.get<TmdbAccount>('/account', {
    ...options,
    query: { session_id: sessionId, ...options?.query },
  })
}

/** TMDB approve URL — user grants permission, then returns to redirectTo. */
export function tmdbApproveUrl(requestToken: string, redirectTo: string) {
  const params = new URLSearchParams({ redirect_to: redirectTo })
  return `https://www.themoviedb.org/authenticate/${requestToken}?${params}`
}
