import { backend } from './clients'
import { env } from '../lib/env'
import type { RequestOptions } from '../lib/http'
import type {
  CollectionDetails,
  DiscoverParams,
  DiscoverResponse,
  GenreListResponse,
  MediaType,
  SearchMultiResponse,
  TitleCard,
  TitleDetails,
  TrendingResponse,
} from '../types/tmdb'
import { toTitleCard } from '../types/tmdb'

/** Poster/backdrop images stay on TMDB's CDN (no API key required). */
export function posterUrl(path: string | null | undefined, size: 'w342' | 'w500' | 'w780' | 'original' = 'w342') {
  if (!path) return null
  return `${env.tmdbImageBase}/${size}${path}`
}

export function backdropUrl(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return null
  return `${env.tmdbImageBase}/${size}${path}`
}

export function getTrending(
  media: 'all' | MediaType = 'all',
  timeWindow: 'day' | 'week' = 'week',
  options?: RequestOptions,
) {
  return backend.get<TrendingResponse>(`/api/tmdb/trending/${media}/${timeWindow}`, {
    ...options,
    query: { language: 'en-US', ...options?.query },
  })
}

export function searchMulti(query: string, page = 1, options?: RequestOptions) {
  return backend.get<SearchMultiResponse>('/api/tmdb/search/multi', {
    ...options,
    query: {
      query,
      page,
      include_adult: false,
      language: 'en-US',
      ...options?.query,
    },
  })
}

export function searchMovies(query: string, page = 1, options?: RequestOptions) {
  return backend.get<DiscoverResponse>('/api/tmdb/search/movie', {
    ...options,
    query: {
      query,
      page,
      include_adult: false,
      language: 'en-US',
      ...options?.query,
    },
  })
}

export function searchTv(query: string, page = 1, options?: RequestOptions) {
  return backend.get<DiscoverResponse>('/api/tmdb/search/tv', {
    ...options,
    query: {
      query,
      page,
      include_adult: false,
      language: 'en-US',
      ...options?.query,
    },
  })
}

export function discoverMovies(params: DiscoverParams = {}, options?: RequestOptions) {
  return backend.get<DiscoverResponse>('/api/tmdb/discover/movie', {
    ...options,
    query: {
      language: 'en-US',
      include_adult: false,
      sort_by: 'popularity.desc',
      ...params,
      ...options?.query,
    },
  })
}

export function discoverTv(params: DiscoverParams = {}, options?: RequestOptions) {
  return backend.get<DiscoverResponse>('/api/tmdb/discover/tv', {
    ...options,
    query: {
      language: 'en-US',
      include_adult: false,
      sort_by: 'popularity.desc',
      ...params,
      ...options?.query,
    },
  })
}

export function getMovieGenres(options?: RequestOptions) {
  return backend.get<GenreListResponse>('/api/tmdb/genre/movie/list', {
    ...options,
    query: { language: 'en-US', ...options?.query },
  })
}

export function getTvGenres(options?: RequestOptions) {
  return backend.get<GenreListResponse>('/api/tmdb/genre/tv/list', {
    ...options,
    query: { language: 'en-US', ...options?.query },
  })
}

export function mapTitles(
  results: Parameters<typeof toTitleCard>[0][],
  fallback: MediaType = 'movie',
): TitleCard[] {
  return results
    .map((item) => toTitleCard(item, fallback))
    .filter((card): card is TitleCard => card !== null)
}

export function getMovieDetails(id: number | string, options?: RequestOptions) {
  return backend.get<TitleDetails>(`/api/tmdb/movie/${id}`, {
    ...options,
    query: {
      language: 'en-US',
      append_to_response: 'external_ids',
      ...options?.query,
    },
  })
}

export function getTvDetails(id: number | string, options?: RequestOptions) {
  return backend.get<TitleDetails>(`/api/tmdb/tv/${id}`, {
    ...options,
    query: {
      language: 'en-US',
      append_to_response: 'external_ids',
      ...options?.query,
    },
  })
}

export function resolveImdbId(details: TitleDetails): string | null {
  const id = details.imdb_id || details.external_ids?.imdb_id
  return id && id.startsWith('tt') ? id : null
}

export function getCollection(id: number | string, options?: RequestOptions) {
  return backend.get<CollectionDetails>(`/api/tmdb/collection/${id}`, {
    ...options,
    query: { language: 'en-US', ...options?.query },
  })
}

export function getSimilarMovies(id: number | string, page = 1, options?: RequestOptions) {
  return backend.get<DiscoverResponse>(`/api/tmdb/movie/${id}/similar`, {
    ...options,
    query: { language: 'en-US', page, ...options?.query },
  })
}

export function getSimilarTv(id: number | string, page = 1, options?: RequestOptions) {
  return backend.get<DiscoverResponse>(`/api/tmdb/tv/${id}/similar`, {
    ...options,
    query: { language: 'en-US', page, ...options?.query },
  })
}
