import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrending } from '../hooks/useMovies'
import PosterRow from '../components/PosterRow'
import Logo from '../components/Logo'

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data: films, error: filmError, isLoading: filmsLoading } = useTrending('movie')
  const { data: series, error: seriesError, isLoading: seriesLoading } = useTrending('tv')

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 lg:px-8">
      <section className="flex flex-col items-center px-2 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
        <Logo size="lg" to={null} className="mx-auto" />
        <h1 className="sr-only">SceneShelf</h1>
        <p className="mt-5 text-base text-fg-secondary sm:text-lg">
          Your private cinema shelf.
        </p>

        <form
          onSubmit={onSearch}
          className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
          role="search"
        >
          <label htmlFor="home-search" className="sr-only">
            Search movies and series
          </label>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & series…"
            className="flex-1 rounded-md border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-brass"
          />
          <button
            type="submit"
            className="rounded-md bg-brass px-6 py-3 text-sm font-semibold text-canvas transition hover:opacity-90"
          >
            Search
          </button>
        </form>
      </section>

      <div className="space-y-14">
        {(filmsLoading || filmError) && (
          <p className="text-sm text-fg-muted">
            {filmError ? `Failed to load films: ${filmError.message}` : 'Loading films…'}
          </p>
        )}
        {films && films.length > 0 && (
          <PosterRow
            title="Trending films"
            titles={films.slice(0, 8)}
            seeAllHref="/search?type=movie&sort=relevance"
          />
        )}

        {(seriesLoading || seriesError) && (
          <p className="text-sm text-fg-muted">
            {seriesError ? `Failed to load series: ${seriesError.message}` : 'Loading series…'}
          </p>
        )}
        {series && series.length > 0 && (
          <PosterRow
            title="Series to start"
            titles={series.slice(0, 8)}
            seeAllHref="/search?type=tv&sort=relevance"
          />
        )}
      </div>
    </div>
  )
}
