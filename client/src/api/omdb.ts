import { env } from '../lib/env'
import type { RequestOptions } from '../lib/http'
import { createClient } from '../lib/http'

export interface OmdbTitleResponse {
  Response: 'True' | 'False'
  Error?: string
  imdbID?: string
  imdbRating?: string
  imdbVotes?: string
  Title?: string
}

const omdb = env.omdbApiKey
  ? createClient({
      baseUrl: 'https://www.omdbapi.com',
      defaultHeaders: { Accept: 'application/json' },
      defaultQuery: { apikey: env.omdbApiKey },
    })
  : null

export function hasOmdb(): boolean {
  return Boolean(omdb)
}

export async function getImdbRating(
  imdbId: string,
  options?: RequestOptions,
): Promise<{ rating: number | null; votes: string | null; imdbId: string } | null> {
  if (!omdb) return null

  const res = await omdb.get<OmdbTitleResponse>('/', {
    ...options,
    query: { i: imdbId, ...options?.query },
  })

  if (res.Response !== 'True') return null

  const rating =
    res.imdbRating && res.imdbRating !== 'N/A' ? Number.parseFloat(res.imdbRating) : null

  return {
    imdbId: res.imdbID ?? imdbId,
    rating: Number.isFinite(rating) ? rating : null,
    votes: res.imdbVotes && res.imdbVotes !== 'N/A' ? res.imdbVotes : null,
  }
}
