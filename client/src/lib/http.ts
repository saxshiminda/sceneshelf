/**
 * Typed HTTP client on native `fetch`.
 * createClient(config) → { get, post, put, patch, delete }
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue>

export interface RequestOptions {
  query?: QueryParams
  headers?: HeadersInit
  signal?: AbortSignal
  timeoutMs?: number
  /** Optional body for methods that normally omit one (e.g. DELETE). */
  body?: unknown
}

export interface ClientConfig {
  baseUrl: string
  defaultHeaders?: HeadersInit
  defaultQuery?: QueryParams
  getAuthToken?: () => string | null | undefined
  /** Include cookies (required for Laravel Sanctum SPA auth). */
  credentials?: RequestCredentials
  /** Attach X-XSRF-TOKEN from the XSRF-TOKEN cookie when present. */
  withXsrf?: boolean
  timeoutMs?: number
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

function appendQuery(url: string, params?: QueryParams): string {
  if (!params) return url

  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    search.set(key, String(value))
  }

  const qs = search.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text === '' ? undefined : text
}

function errorMessage(parsed: unknown, status: number): string {
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>
    if (typeof obj.message === 'string' && obj.message.trim()) return obj.message
    if (typeof obj.status_message === 'string') return obj.status_message
    if (typeof obj.errors === 'object' && obj.errors !== null) {
      const first = Object.values(obj.errors as Record<string, unknown>)[0]
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
      if (typeof first === 'string') return first
    }
  }
  return `Request failed with status ${status}`
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body: unknown,
  options: RequestOptions | undefined,
  config: ClientConfig,
): Promise<T> {
  const url = appendQuery(joinUrl(config.baseUrl, path), {
    ...config.defaultQuery,
    ...options?.query,
  })

  const headers = new Headers(config.defaultHeaders)
  if (options?.headers) {
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value)
    })
  }

  const token = config.getAuthToken?.()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (config.withXsrf) {
    const xsrf = readCookie('XSRF-TOKEN')
    if (xsrf) headers.set('X-XSRF-TOKEN', xsrf)
  }

  const resolvedBody = body !== undefined ? body : options?.body
  let payload: BodyInit | undefined
  if (resolvedBody !== undefined && resolvedBody !== null && method !== 'GET') {
    if (resolvedBody instanceof FormData) {
      headers.delete('Content-Type')
      payload = resolvedBody
    } else {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      payload = JSON.stringify(resolvedBody)
    }
  }

  const timeoutMs = options?.timeoutMs ?? config.timeoutMs ?? 15_000
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs)

  const signals = [timeoutController.signal]
  if (options?.signal) signals.push(options.signal)
  const signal = AbortSignal.any(signals)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: payload,
      signal,
      credentials: config.credentials,
    })

    const parsed = await parseBody(response)

    if (!response.ok) {
      throw new ApiError(response.status, errorMessage(parsed, response.status), parsed)
    }

    return parsed as T
  } finally {
    clearTimeout(timeoutId)
  }
}

export interface HttpClient {
  get: <T>(path: string, options?: RequestOptions) => Promise<T>
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => Promise<T>
  delete: <T>(path: string, options?: RequestOptions) => Promise<T>
}

export function createClient(config: ClientConfig): HttpClient {
  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>('GET', path, undefined, options, config),

    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>('POST', path, body, options, config),

    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>('PUT', path, body, options, config),

    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>('PATCH', path, body, options, config),

    delete: <T>(path: string, options?: RequestOptions) =>
      request<T>('DELETE', path, undefined, options, config),
  }
}
