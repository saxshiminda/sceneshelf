export type MediaType = 'movie' | 'tv'

export interface Genre {
  id: number
  name: string
}

export interface GenreListResponse {
  genres: Genre[]
}

export interface TmdbTitle {
  id: number
  media_type?: MediaType | 'person'
  title?: string
  name?: string
  original_title?: string
  original_name?: string
  overview?: string | null
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  popularity?: number
  genre_ids?: number[]
  adult?: boolean
}

export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type SearchMultiResponse = PaginatedResponse<TmdbTitle>
export type DiscoverResponse = PaginatedResponse<TmdbTitle>
export type TrendingResponse = PaginatedResponse<TmdbTitle>

export type MovieSortBy =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'primary_release_date.desc'
  | 'primary_release_date.asc'

export type TvSortBy =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'first_air_date.desc'
  | 'first_air_date.asc'

export interface DiscoverParams {
  page?: number
  with_genres?: string
  sort_by?: string
  'vote_average.gte'?: number
  'vote_count.gte'?: number
  primary_release_year?: number
  'primary_release_date.gte'?: string
  'primary_release_date.lte'?: string
  first_air_date_year?: number
  'first_air_date.gte'?: string
  'first_air_date.lte'?: string
  include_adult?: boolean
  language?: string
}

/** Normalized card shape used across the UI. */
export interface TitleCard {
  id: number
  mediaType: MediaType
  title: string
  year: number | null
  releaseDate: string | null
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  overview: string
  genreIds: number[]
}

export function displayTitle(item: TmdbTitle): string {
  return item.title ?? item.name ?? item.original_title ?? item.original_name ?? 'Untitled'
}

export function displayYear(item: TmdbTitle): number | null {
  const date = item.release_date || item.first_air_date
  if (!date) return null
  const year = Number.parseInt(date.slice(0, 4), 10)
  return Number.isFinite(year) ? year : null
}

export function resolveMediaType(item: TmdbTitle, fallback: MediaType = 'movie'): MediaType {
  if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type
  if (item.title || item.release_date) return 'movie'
  if (item.name || item.first_air_date) return 'tv'
  return fallback
}

export function toTitleCard(item: TmdbTitle, fallback: MediaType = 'movie'): TitleCard | null {
  const mediaType = resolveMediaType(item, fallback)
  if (item.media_type === 'person') return null

  const releaseDate = item.release_date || item.first_air_date || null
  return {
    id: item.id,
    mediaType,
    title: displayTitle(item),
    year: displayYear(item),
    releaseDate,
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    voteAverage: item.vote_average ?? 0,
    overview: item.overview ?? '',
    genreIds: item.genre_ids ?? [],
  }
}

export interface CollectionRef {
  id: number
  name: string
  poster_path?: string | null
  backdrop_path?: string | null
}

export interface CollectionDetails {
  id: number
  name: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  parts: TmdbTitle[]
}

export interface ExternalIds {
  imdb_id?: string | null
  freebase_mid?: string | null
  freebase_id?: string | null
  tvdb_id?: number | null
  tvrage_id?: number | null
  wikidata_id?: string | null
  facebook_id?: string | null
  instagram_id?: string | null
  twitter_id?: string | null
}

export interface TitleDetails extends TmdbTitle {
  runtime?: number | null
  episode_run_time?: number[]
  genres?: Genre[]
  number_of_seasons?: number
  status?: string
  tagline?: string | null
  belongs_to_collection?: CollectionRef | null
  external_ids?: ExternalIds
  /** Present when details were requested with append_to_response=external_ids for movies. */
  imdb_id?: string | null
}
