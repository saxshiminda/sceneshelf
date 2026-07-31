import { useFetch } from './useFetch'
import {
  discoverMovies,
  discoverTv,
  getCollection,
  getMovieDetails,
  getMovieGenres,
  getSimilarMovies,
  getSimilarTv,
  getTrending,
  getTvDetails,
  getTvGenres,
  mapTitles,
  searchMovies,
  searchMulti,
  searchTv,
} from '../api/movies'
import { getImdbRating } from '../api/omdb'
import type { DiscoverParams, MediaType, TitleCard } from '../types/tmdb'

export function useTrending(media: 'all' | MediaType = 'all') {
  return useFetch(
    async (signal) => {
      const res = await getTrending(media, 'week', { signal })
      return mapTitles(res.results)
    },
    [media],
  )
}

export interface BrowseFilters {
  q: string
  type: 'all' | MediaType
  genreIds: number[]
  yearFrom: string
  yearTo: string
  minRating: string
  sort: string
  page: number
}

export interface BrowseResult {
  titles: TitleCard[]
  page: number
  totalPages: number
  totalResults: number
}

function yearBounds(yearFrom: string, yearTo: string, kind: MediaType) {
  const from = yearFrom.trim()
  const to = yearTo.trim()
  const params: DiscoverParams = {}

  if (kind === 'movie') {
    if (from) params['primary_release_date.gte'] = `${from}-01-01`
    if (to) params['primary_release_date.lte'] = `${to}-12-31`
  } else {
    if (from) params['first_air_date.gte'] = `${from}-01-01`
    if (to) params['first_air_date.lte'] = `${to}-12-31`
  }

  return params
}

function sortFor(type: MediaType, sort: string): string {
  if (sort === 'newest' || sort === 'date') {
    return type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc'
  }
  if (sort === 'title') {
    return type === 'movie' ? 'original_title.asc' : 'name.asc'
  }
  if (sort === 'rating') return 'vote_average.desc'
  return 'popularity.desc'
}

async function browseTitles(filters: BrowseFilters, signal: AbortSignal): Promise<BrowseResult> {
  const {
    q,
    type,
    genreIds,
    yearFrom,
    yearTo,
    minRating,
    sort,
    page,
  } = filters

  const query = q.trim()
  const genre = genreIds.length ? genreIds.join(',') : undefined
  const rating = minRating ? Number(minRating) : undefined
  const hasClientFilters = Boolean(genre || yearFrom || yearTo || rating)

  if (query) {
    if (type === 'movie') {
      const res = await searchMovies(query, page, { signal })
      let titles = mapTitles(res.results, 'movie')
      titles = applyClientFilters(titles, filters)
      return {
        titles,
        page: res.page,
        totalPages: res.total_pages,
        totalResults: hasClientFilters ? titles.length : res.total_results,
      }
    }

    if (type === 'tv') {
      const res = await searchTv(query, page, { signal })
      let titles = mapTitles(res.results, 'tv')
      titles = applyClientFilters(titles, filters)
      return {
        titles,
        page: res.page,
        totalPages: res.total_pages,
        totalResults: hasClientFilters ? titles.length : res.total_results,
      }
    }

    const res = await searchMulti(query, page, { signal })
    let titles = mapTitles(res.results).filter((t) => t.mediaType === 'movie' || t.mediaType === 'tv')
    titles = applyClientFilters(titles, filters)
    return {
      titles,
      page: res.page,
      totalPages: res.total_pages,
      totalResults: hasClientFilters ? titles.length : res.total_results,
    }
  }

  const voteCountFloor = sort === 'rating' || rating ? 50 : undefined

  if (type === 'movie') {
    const res = await discoverMovies(
      {
        page,
        with_genres: genre,
        sort_by: sortFor('movie', sort),
        'vote_average.gte': rating,
        ...(voteCountFloor ? { 'vote_count.gte': voteCountFloor } : {}),
        ...yearBounds(yearFrom, yearTo, 'movie'),
      },
      { signal },
    )
    return {
      titles: mapTitles(res.results, 'movie'),
      page: res.page,
      totalPages: Math.min(res.total_pages, 500),
      totalResults: res.total_results,
    }
  }

  if (type === 'tv') {
    const res = await discoverTv(
      {
        page,
        with_genres: genre,
        sort_by: sortFor('tv', sort),
        'vote_average.gte': rating,
        ...(voteCountFloor ? { 'vote_count.gte': voteCountFloor } : {}),
        ...yearBounds(yearFrom, yearTo, 'tv'),
      },
      { signal },
    )
    return {
      titles: mapTitles(res.results, 'tv'),
      page: res.page,
      totalPages: Math.min(res.total_pages, 500),
      totalResults: res.total_results,
    }
  }

  const voteFloor = voteCountFloor ? { 'vote_count.gte': voteCountFloor } : {}
  const [movies, shows] = await Promise.all([
    discoverMovies(
      {
        page,
        with_genres: genre,
        sort_by: sortFor('movie', sort),
        'vote_average.gte': rating,
        ...voteFloor,
        ...yearBounds(yearFrom, yearTo, 'movie'),
      },
      { signal },
    ),
    discoverTv(
      {
        page,
        with_genres: genre,
        sort_by: sortFor('tv', sort),
        'vote_average.gte': rating,
        ...voteFloor,
        ...yearBounds(yearFrom, yearTo, 'tv'),
      },
      { signal },
    ),
  ])

  let titles = interleave(
    mapTitles(movies.results, 'movie'),
    mapTitles(shows.results, 'tv'),
  )
  titles = applyClientFilters(titles, filters)

  return {
    titles,
    page,
    totalPages: Math.min(Math.max(movies.total_pages, shows.total_pages), 500),
    totalResults: movies.total_results + shows.total_results,
  }
}

function applyClientFilters(titles: TitleCard[], filters: BrowseFilters): TitleCard[] {
  const genreSet = new Set(filters.genreIds)
  const from = filters.yearFrom ? Number(filters.yearFrom) : null
  const to = filters.yearTo ? Number(filters.yearTo) : null
  const rating = filters.minRating ? Number(filters.minRating) : null

  let next = titles.filter((t) => {
    if (rating !== null && !Number.isNaN(rating) && t.voteAverage < rating) return false
    if (from !== null && !Number.isNaN(from) && (t.year === null || t.year < from)) return false
    if (to !== null && !Number.isNaN(to) && (t.year === null || t.year > to)) return false
    if (genreSet.size > 0 && !t.genreIds.some((id) => genreSet.has(id))) return false
    return true
  })

  if (filters.sort === 'title') {
    next = [...next].sort((a, b) => a.title.localeCompare(b.title))
  } else if (filters.sort === 'newest') {
    next = [...next].sort((a, b) => {
      const da = a.releaseDate ?? ''
      const db = b.releaseDate ?? ''
      return db.localeCompare(da)
    })
  }

  return next
}

function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = []
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    if (i < a.length) out.push(a[i])
    if (i < b.length) out.push(b[i])
  }
  return out
}

export function useBrowse(filters: BrowseFilters) {
  const key = JSON.stringify(filters)
  return useFetch((signal) => browseTitles(filters, signal), [key])
}

export function useGenres(type: 'all' | MediaType) {
  return useFetch(
    async (signal) => {
      if (type === 'movie') {
        const res = await getMovieGenres({ signal })
        return res.genres
      }
      if (type === 'tv') {
        const res = await getTvGenres({ signal })
        return res.genres
      }
      const [movies, shows] = await Promise.all([
        getMovieGenres({ signal }),
        getTvGenres({ signal }),
      ])
      const byId = new Map<number, { id: number; name: string }>()
      for (const g of [...movies.genres, ...shows.genres]) {
        byId.set(g.id, g)
      }
      return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
    },
    [type],
  )
}

export function useTitleDetails(mediaType: MediaType | null, id: number | null) {
  return useFetch(
    async (signal) => {
      if (!mediaType || id === null) return null
      if (mediaType === 'movie') return getMovieDetails(id, { signal })
      return getTvDetails(id, { signal })
    },
    [mediaType, id],
  )
}

/** Other parts in a franchise/collection (sequels, prequels). Empty when none. */
export function useCollectionParts(collectionId: number | null, excludeId: number | null) {
  return useFetch(
    async (signal) => {
      if (collectionId === null) return []
      const res = await getCollection(collectionId, { signal })
      const parts = mapTitles(res.parts ?? [], 'movie')
        .filter((t) => t.id !== excludeId)
        .sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
      return parts
    },
    [collectionId, excludeId],
  )
}

/** Similar / related titles for a movie or series. */
export function useSimilarTitles(
  mediaType: MediaType | null,
  id: number | null,
  excludeIds: number[] = [],
) {
  const excludeKey = excludeIds.join(',')
  return useFetch(
    async (signal) => {
      if (!mediaType || id === null) return []
      const res =
        mediaType === 'movie'
          ? await getSimilarMovies(id, 1, { signal })
          : await getSimilarTv(id, 1, { signal })
      const exclude = new Set(excludeIds)
      return mapTitles(res.results, mediaType)
        .filter((t) => !exclude.has(t.id))
        .slice(0, 12)
    },
    [mediaType, id, excludeKey],
  )
}

/** IMDb rating via OMDb when VITE_OMDB_API_KEY is set. */
export function useImdbRating(imdbId: string | null) {
  return useFetch(
    async (signal) => {
      if (!imdbId) return null
      return getImdbRating(imdbId, { signal })
    },
    [imdbId],
  )
}
