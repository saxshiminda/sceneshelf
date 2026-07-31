import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrending } from '../hooks/useMovies'
import MovieCard from '../components/MovieCard'

type ShelfTab = 'watched' | 'want' | 'favorites'

const TABS: { id: ShelfTab; label: string }[] = [
  { id: 'watched', label: 'Watched' },
  { id: 'want', label: 'Want to Watch' },
  { id: 'favorites', label: 'Favorites' },
]

export default function MyShelf() {
  const [tab, setTab] = useState<ShelfTab>('watched')
  // Placeholder content until shelf API exists — show trending as visual stand-in
  const { data: titles, isLoading } = useTrending('all')
  const slice =
    tab === 'watched'
      ? titles?.slice(0, 6)
      : tab === 'want'
        ? titles?.slice(3, 9)
        : titles?.slice(6, 12)

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="font-display text-4xl text-fg sm:text-5xl">My Shelf</h1>
      <p className="mt-3 max-w-lg text-fg-secondary">
        Watched, Want to Watch, and Favorites—your private lists.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-px">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition ${
              tab === t.id
                ? 'border-brass text-fg'
                : 'border-transparent text-fg-muted hover:text-fg-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-10 text-fg-muted">Loading…</p>}

      {!isLoading && (!slice || slice.length === 0) && (
        <div className="mt-12 text-center">
          <p className="text-fg-muted">Nothing on this shelf yet.</p>
          <Link
            to="/search"
            className="mt-4 inline-block text-sm text-brass hover:underline"
          >
            Browse titles
          </Link>
        </div>
      )}

      {slice && slice.length > 0 && (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {slice.map((title) => (
            <li key={`${title.mediaType}-${title.id}`}>
              <MovieCard title={title} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
