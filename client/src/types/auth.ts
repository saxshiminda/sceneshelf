/** Auth types for SceneShelf (Laravel + TMDB). */

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  tmdb_id: number | null
  tmdb_username: string | null
  avatar_path: string | null
  include_adult: boolean
  iso_639_1: string | null
  iso_3166_1: string | null
  created_at?: string
  updated_at?: string
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

/** TMDB authentication response types. */

export interface RequestTokenResponse {
  success: boolean
  expires_at: string
  request_token: string
}

export interface SessionResponse {
  success: boolean
  session_id: string
}

export interface DeleteSessionResponse {
  success: boolean
}

export interface TmdbAccount {
  id: number
  name: string
  username: string
  include_adult: boolean
  iso_639_1: string
  iso_3166_1: string
  avatar?: {
    gravatar?: { hash: string | null }
    tmdb?: { avatar_path: string | null }
  }
}
