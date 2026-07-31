import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useTheme } from '../theme/ThemeProvider'

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isTmdb = Boolean(user?.tmdb_id)

  async function onLogout() {
    await logout()
    navigate('/home', { replace: true })
  }

  return (
    <div className="max-w-xl space-y-10">
      <section>
        <h2 className="font-display text-xl text-fg">Appearance</h2>
        <p className="mt-1 text-sm text-fg-secondary">
          Switch between light and dark projection room themes.
        </p>
        <div className="mt-5 flex items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <p className="text-sm text-fg">Theme</p>
            <p className="text-xs text-fg-muted">
              Currently {theme === 'dark' ? 'dark' : 'light'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-border px-4 py-2 text-sm text-fg transition hover:border-brass"
          >
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </section>

      {isTmdb && (
        <section>
          <h2 className="font-display text-xl text-fg">TMDB preferences</h2>
          <p className="mt-1 text-sm text-fg-secondary">
            Synced from your TMDB account and stored in SceneShelf.
          </p>
          <dl className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <dt className="text-sm text-fg">Include adult content</dt>
              <dd className="text-sm text-fg-secondary">
                {user?.include_adult ? 'Enabled' : 'Disabled'}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <dt className="text-sm text-fg">Country</dt>
              <dd className="text-sm text-fg-secondary">{user?.iso_3166_1 || '—'}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <dt className="text-sm text-fg">Language</dt>
              <dd className="text-sm text-fg-secondary">{user?.iso_639_1 || '—'}</dd>
            </div>
          </dl>
          <a
            href="https://www.themoviedb.org/settings/profile"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-brass hover:underline"
          >
            Edit on TMDB
          </a>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl text-fg">Session</h2>
        <p className="mt-1 text-sm text-fg-secondary">
          Sign out of SceneShelf{isTmdb ? ' and disconnect TMDB on this browser' : ''}.
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 rounded-md border border-border px-4 py-2.5 text-sm text-fg transition hover:border-red-400/60 hover:text-red-400"
        >
          Log out
        </button>
      </section>
    </div>
  )
}
