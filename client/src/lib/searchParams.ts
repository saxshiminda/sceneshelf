/** Read/write search filter state from URL search params. */

import type { MediaFilter, SearchFilterValues } from '../components/SearchFilters'

export const EMPTY_FILTERS: SearchFilterValues = {
  type: 'all',
  genreIds: [],
  yearFrom: '',
  yearTo: '',
  minRating: '',
  sort: 'relevance',
}

export interface SearchParamsState extends SearchFilterValues {
  q: string
  page: number
}

export function parseSearchParams(params: URLSearchParams): SearchParamsState {
  const typeRaw = params.get('type')
  const type: MediaFilter =
    typeRaw === 'movie' || typeRaw === 'tv' || typeRaw === 'all' ? typeRaw : 'all'

  const genreRaw = params.get('genre') ?? ''
  const genreIds = genreRaw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)

  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const sort = params.get('sort') ?? 'relevance'

  return {
    q: params.get('q') ?? '',
    type,
    genreIds,
    yearFrom: params.get('yearFrom') ?? '',
    yearTo: params.get('yearTo') ?? '',
    minRating: params.get('rating') ?? '',
    sort: sort === 'popularity' ? 'relevance' : sort,
    page,
  }
}

export function toSearchParams(state: SearchParamsState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.q.trim()) params.set('q', state.q.trim())
  if (state.type !== 'all') params.set('type', state.type)
  if (state.genreIds.length) params.set('genre', state.genreIds.join(','))
  if (state.yearFrom) params.set('yearFrom', state.yearFrom)
  if (state.yearTo) params.set('yearTo', state.yearTo)
  if (state.minRating) params.set('rating', state.minRating)
  if (state.sort && state.sort !== 'relevance') params.set('sort', state.sort)
  if (state.page > 1) params.set('page', String(state.page))

  return params
}

export function clearFiltersKeepQuery(q: string): SearchParamsState {
  return { ...EMPTY_FILTERS, q, page: 1 }
}
