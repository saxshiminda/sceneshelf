import { backend } from './clients'
import { getCsrfCookie } from './auth'
import type { RequestOptions } from '../lib/http'
import type { MediaType } from '../types/tmdb'

export type ShelfFlag = 'watched' | 'want_to_watch' | 'favorite'
export type ShelfList = 'watched' | 'want' | 'favorites'

export interface ShelfItem {
  id: number
  user_id: number
  tmdb_id: number
  media_type: MediaType
  title: string
  poster_path: string | null
  year: number | null
  watched: boolean
  want_to_watch: boolean
  favorite: boolean
  created_at?: string
  updated_at?: string
}

export interface ShelfStatus {
  item: ShelfItem | null
  tmdb_id: number
  media_type: MediaType
  watched: boolean
  want_to_watch: boolean
  favorite: boolean
}

export interface ToggleShelfPayload {
  tmdb_id: number
  media_type: MediaType
  flag: ShelfFlag
  title: string
  poster_path?: string | null
  year?: number | null
}

export function getShelf(list?: ShelfList, options?: RequestOptions) {
  return backend.get<ShelfItem[]>('/api/shelf', {
    ...options,
    query: {
      ...(list ? { list } : {}),
      ...options?.query,
    },
  })
}

export function getShelfStatus(
  mediaType: MediaType,
  tmdbId: number,
  options?: RequestOptions,
) {
  return backend.get<ShelfItem | null>(`/api/shelf/${mediaType}/${tmdbId}`, options)
}

export async function toggleShelf(payload: ToggleShelfPayload, options?: RequestOptions) {
  await getCsrfCookie(options)
  return backend.post<ShelfStatus>('/api/shelf/toggle', payload, options)
}

export function shelfItemToTitleCard(item: ShelfItem) {
  return {
    id: item.tmdb_id,
    mediaType: item.media_type,
    title: item.title,
    year: item.year,
    releaseDate: null,
    posterPath: item.poster_path,
    backdropPath: null,
    voteAverage: 0,
    overview: '',
    genreIds: [] as number[],
  }
}
