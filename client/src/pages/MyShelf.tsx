import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShelfList } from '../hooks/useShelf'
import { shelfItemToTitleCard, type ShelfList } from '../api/shelf'
import MovieCard from '../components/MovieCard'
import RequireAuth from '../components/RequireAuth'

const TABS: { id: ShelfList; label: string }[] = [
  { id: 'watched', label: 'Watched' },
  { id: 'want', label: 'Want to Watch' },
  { id: 'favorites', label: 'Favorites' },
]

export default function MyShelf() {
  return (
    <RequireAuth>
      <MyShelfContent />
    </RequireAuth>
  )
}

function MyShelfContent() {
  const [tab, setTab] = useState<ShelfList>('watched')
  const { items, isLoading, error } = useShelfList(tab)
  const titles = items.map(shelfItemToTitleCard)

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

      {!isLoading && error && (
        <p className="mt-10 text-sm text-red-400">{error.message}</p>
      )}

      {!isLoading && !error && titles.length === 0 && (
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

      {titles.length > 0 && (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {titles.map((title) => (
            <li key={`${title.mediaType}-${title.id}`}>
              <MovieCard title={title} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
