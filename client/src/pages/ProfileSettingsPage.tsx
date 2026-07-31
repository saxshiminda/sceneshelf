import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useTheme } from '../theme/ThemeProvider'
import { ApiError } from '../lib/http'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function ProfileSettingsPage() {
  const { user, avatarUrl, logout, uploadAvatar, removeAvatar } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isTmdb = Boolean(user?.tmdb_id)
  const hasCustomPhoto = Boolean(user?.profile_photo_path)
  const [photoError, setPhotoError] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)

  async function onLogout() {
    await logout()
    navigate('/home', { replace: true })
  }

  async function onPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setPhotoError('')
    setPhotoBusy(true)
    try {
      await uploadAvatar(file)
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Could not upload photo.')
    } finally {
      setPhotoBusy(false)
    }
  }

  async function onRemovePhoto() {
    setPhotoError('')
    setPhotoBusy(true)
    try {
      await removeAvatar()
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Could not remove photo.')
    } finally {
      setPhotoBusy(false)
    }
  }

  return (
    <div className="max-w-xl space-y-10">
      <section>
        <h2 className="font-display text-xl text-fg">Profile photo</h2>
        <p className="mt-1 text-sm text-fg-secondary">
          Upload an image to use across SceneShelf. JPG, PNG, or WebP up to 2MB.
        </p>
        <div className="mt-5 flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="size-16 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-elevated ring-1 ring-border">
              <UserCircleIcon className="size-10 text-fg-muted" />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onPhotoChange}
            />
            <button
              type="button"
              disabled={photoBusy}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-border px-4 py-2 text-sm text-fg transition hover:border-brass disabled:opacity-60"
            >
              {photoBusy ? 'Uploading…' : 'Upload photo'}
            </button>
            {hasCustomPhoto && (
              <button
                type="button"
                disabled={photoBusy}
                onClick={onRemovePhoto}
                className="rounded-md border border-border px-4 py-2 text-sm text-fg-secondary transition hover:border-red-400/60 hover:text-red-400 disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {photoError && <p className="mt-3 text-sm text-red-400">{photoError}</p>}
      </section>

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
