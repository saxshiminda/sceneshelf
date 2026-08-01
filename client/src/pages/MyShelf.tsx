import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShelfList } from '../hooks/useShelf'
import { shelfItemToTitleCard, type ShelfItem, type ShelfList } from '../api/shelf'
import { posterUrl } from '../api/movies'
import RequireAuth from '../components/RequireAuth'
import { useToast } from '../components/ToastProvider'
import { ApiError } from '../lib/http'

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
  const { items, isLoading, error, removeFromList } = useShelfList(tab)
  const { toast } = useToast()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function onRemove(item: ShelfItem) {
    const key = `${item.media_type}-${item.tmdb_id}`
    setBusyId(key)
    try {
      await removeFromList(item)
      toast('Removed from shelf')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not remove title')
    } finally {
      setBusyId(null)
    }
  }

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

      {!isLoading && !error && items.length === 0 && (
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

      {items.length > 0 && (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => {
            const title = shelfItemToTitleCard(item)
            const poster = posterUrl(title.posterPath)
            const key = `${item.media_type}-${item.tmdb_id}`
            return (
              <li key={key} className="group relative">
                <Link
                  to={`/title/${title.mediaType}/${title.id}`}
                  className="flex flex-col gap-2.5"
                >
                  <div className="overflow-hidden rounded-md bg-poster">
                    {poster ? (
                      <img
                        src={poster}
                        alt=""
                        loading="lazy"
                        className="aspect-[2/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center text-xs text-fg-muted">
                        No art
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="truncate text-sm font-medium text-fg group-hover:text-brass">
                      {title.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-fg-muted">{title.year ?? '—'}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  disabled={busyId === key}
                  onClick={() => void onRemove(item)}
                  className="mt-2 w-full rounded-md border border-border px-2 py-1.5 text-xs text-fg-secondary transition hover:border-red-400/60 hover:text-red-400 disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
