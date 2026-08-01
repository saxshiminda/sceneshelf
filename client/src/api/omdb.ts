import { backend } from './clients'
import type { RequestOptions } from '../lib/http'

export async function getImdbRating(
  imdbId: string,
  options?: RequestOptions,
): Promise<{ rating: number | null; votes: string | null; imdbId: string } | null> {
  return backend.get<{ rating: number | null; votes: string | null; imdbId: string } | null>(
    '/api/omdb/rating',
    {
      ...options,
      query: { imdb_id: imdbId, ...options?.query },
    },
  )
}
