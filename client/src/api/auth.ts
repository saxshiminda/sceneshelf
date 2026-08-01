import { backend } from './clients'
import type { RequestOptions } from '../lib/http'
import type {
  DeleteSessionResponse,
  LoginPayload,
  RegisterPayload,
  RequestTokenResponse,
  SessionResponse,
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

export async function uploadProfilePhoto(file: File, options?: RequestOptions) {
  await getCsrfCookie(options)
  const body = new FormData()
  body.append('photo', file)
  return backend.post<User>('/api/user/profile-photo', body, options)
}

export async function deleteProfilePhoto(options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.delete<User>('/api/user/profile-photo', options)
}

/** Sync a TMDB session into Laravel (creates/updates user + Sanctum login). */
export async function syncTmdbSession(sessionId: string, options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.post<User>('/auth/tmdb', { session_id: sessionId }, options)
}

/* —— TMDB auth (proxied through Laravel) —— */

export function createRequestToken(options?: RequestOptions) {
  return backend.get<RequestTokenResponse>('/api/tmdb/authentication/token/new', options)
}

export function validateTokenWithLogin(
  username: string,
  password: string,
  requestToken: string,
  options?: RequestOptions,
) {
  return backend.post<RequestTokenResponse>(
    '/api/tmdb/authentication/token/validate_with_login',
    { username, password, request_token: requestToken },
    options,
  )
}

export function createSession(requestToken: string, options?: RequestOptions) {
  return backend.post<SessionResponse>(
    '/api/tmdb/authentication/session/new',
    { request_token: requestToken },
    options,
  )
}

export function deleteSession(sessionId: string, options?: RequestOptions) {
  return backend.delete<DeleteSessionResponse>('/api/tmdb/authentication/session', {
    ...options,
    body: { session_id: sessionId },
  })
}

/** TMDB approve URL — user grants permission, then returns to redirectTo. */
export function tmdbApproveUrl(requestToken: string, redirectTo: string) {
  const params = new URLSearchParams({ redirect_to: redirectTo })
  return `https://www.themoviedb.org/authenticate/${requestToken}?${params}`
}
