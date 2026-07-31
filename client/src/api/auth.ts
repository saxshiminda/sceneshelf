import { backend } from './clients'
import type { RequestOptions } from '../lib/http'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

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
