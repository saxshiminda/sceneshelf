import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function ProfilePage() {
  const { user } = useAuth()
  const isTmdb = Boolean(user?.tmdb_id)
  const emailLabel =
    user?.email && !user.email.endsWith('@tmdb.sceneshelf.local') ? user.email : null

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl text-fg">Account</h2>
        <p className="mt-1 text-sm text-fg-secondary">
          {isTmdb ? 'Connected through The Movie Database and SceneShelf.' : 'Your SceneShelf profile.'}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border-b border-border/80 pb-4">
            <dt className="text-xs tracking-wide text-fg-muted uppercase">Name</dt>
            <dd className="mt-1 text-sm text-fg">{user?.name ?? '—'}</dd>
          </div>
          {emailLabel && (
            <div className="border-b border-border/80 pb-4">
              <dt className="text-xs tracking-wide text-fg-muted uppercase">Email</dt>
              <dd className="mt-1 text-sm text-fg">{emailLabel}</dd>
            </div>
          )}
          {isTmdb && (
            <>
              <div className="border-b border-border/80 pb-4">
                <dt className="text-xs tracking-wide text-fg-muted uppercase">TMDB username</dt>
                <dd className="mt-1 text-sm text-fg">{user?.tmdb_username ?? '—'}</dd>
              </div>
              <div className="border-b border-border/80 pb-4">
                <dt className="text-xs tracking-wide text-fg-muted uppercase">Region</dt>
                <dd className="mt-1 text-sm text-fg">{user?.iso_3166_1 || '—'}</dd>
              </div>
              <div className="border-b border-border/80 pb-4">
                <dt className="text-xs tracking-wide text-fg-muted uppercase">Language</dt>
                <dd className="mt-1 text-sm text-fg">{user?.iso_639_1 || '—'}</dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <section>
        <h2 className="font-display text-xl text-fg">Shortcuts</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/myshelf"
            className="rounded-md border border-border bg-elevated/40 px-4 py-2.5 text-sm text-fg transition hover:border-brass"
          >
            Open My Shelf
          </Link>
          <Link
            to="/search"
            className="rounded-md border border-border bg-elevated/40 px-4 py-2.5 text-sm text-fg transition hover:border-brass"
          >
            Browse titles
          </Link>
          {isTmdb && user?.tmdb_username && (
            <a
              href={`https://www.themoviedb.org/u/${user.tmdb_username}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border bg-elevated/40 px-4 py-2.5 text-sm text-fg transition hover:border-brass"
            >
              View on TMDB
            </a>
          )}
        </div>
      </section>
    </div>
  )
}
