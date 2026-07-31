import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchFilters, { type SearchFilterValues } from '../components/SearchFilters'
import ResultRow from '../components/ResultRow'
import { useBrowse, useGenres } from '../hooks/useMovies'
import {
  clearFiltersKeepQuery,
  parseSearchParams,
  toSearchParams,
} from '../lib/searchParams'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useMemo(() => parseSearchParams(searchParams), [searchParams])
  const [draftQuery, setDraftQuery] = useState(state.q)

  useEffect(() => {
    setDraftQuery(state.q)
  }, [state.q])

  const { data: genres, isLoading: genresLoading } = useGenres(state.type)
  const { data, error, isLoading } = useBrowse({
    q: state.q,
    type: state.type,
    genreIds: state.genreIds,
    yearFrom: state.yearFrom,
    yearTo: state.yearTo,
    minRating: state.minRating,
    sort: state.sort,
    page: state.page,
  })

  function patch(next: Partial<ReturnType<typeof parseSearchParams>>) {
    const merged = { ...state, ...next }
    if (
      next.type !== undefined ||
      next.genreIds !== undefined ||
      next.yearFrom !== undefined ||
      next.yearTo !== undefined ||
      next.minRating !== undefined ||
      next.sort !== undefined ||
      next.q !== undefined
    ) {
      merged.page = next.page ?? 1
    }
    setSearchParams(toSearchParams(merged), { replace: false })
  }

  function onClear() {
    setSearchParams(toSearchParams(clearFiltersKeepQuery(state.q)))
  }

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault()
    patch({ q: draftQuery, page: 1 })
  }

  const selectedGenreNames = (genres ?? [])
    .filter((g) => state.genreIds.includes(g.id))
    .map((g) => g.name)

  const metaParts: string[] = []
  if (data) {
    metaParts.push(
      `${Math.min(data.totalResults, data.titles.length * data.totalPages).toLocaleString()} results`,
    )
  }
  if (state.q.trim()) metaParts.push(`for '${state.q.trim()}'`)
  if (selectedGenreNames.length) metaParts.push(selectedGenreNames.join(', '))

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
      <form onSubmit={onSearchSubmit} className="flex flex-col gap-3" role="search">
        <div className="flex gap-3">
          <label htmlFor="search-page-q" className="sr-only">
            Search query
          </label>
          <input
            id="search-page-q"
            type="search"
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder="Search movies & series…"
            className="flex-1 rounded-full border border-border bg-surface px-5 py-2.5 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-brass"
          />
          <button
            type="submit"
            className="rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-canvas transition hover:opacity-90"
          >
            Search
          </button>
        </div>

        <SearchFilters
          values={{
            type: state.type,
            genreIds: state.genreIds,
            yearFrom: state.yearFrom,
            yearTo: state.yearTo,
            minRating: state.minRating,
            sort: state.sort,
          }}
          genres={genres ?? []}
          genresLoading={genresLoading}
          onChange={(next) => patch(next as Partial<SearchFilterValues>)}
          onClear={onClear}
        />
      </form>

      <p className="mt-5 text-sm text-fg-muted">
        {metaParts.length ? metaParts.join(' · ') : 'Browse and filter titles'}
      </p>

      {isLoading && <p className="py-16 text-fg-muted">Loading results…</p>}
      {error && (
        <p className="py-16 text-red-400">Failed to load: {error.message}</p>
      )}

      {data && !isLoading && (
        <>
          {data.titles.length === 0 ? (
            <p className="py-16 text-fg-muted">
              No titles match these filters. Try clearing a few.
            </p>
          ) : (
            <div className="mt-2">
              {data.titles.map((title) => (
                <ResultRow
                  key={`${title.mediaType}-${title.id}`}
                  title={title}
                  genres={genres ?? []}
                />
              ))}
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={state.page <= 1}
                onClick={() => patch({ page: state.page - 1 })}
                className="rounded-full border border-border px-5 py-2 text-sm text-fg-secondary transition hover:border-brass hover:text-fg disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-fg-muted">
                {state.page} / {data.totalPages}
              </span>
              <button
                type="button"
                disabled={state.page >= data.totalPages}
                onClick={() => patch({ page: state.page + 1 })}
                className="rounded-full border border-border px-5 py-2 text-sm text-fg-secondary transition hover:border-brass hover:text-fg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
