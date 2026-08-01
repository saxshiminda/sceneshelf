import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useTheme } from '../theme/ThemeProvider'
import { useToast } from '../components/ToastProvider'
import RequireAuth from '../components/RequireAuth'
import { ApiError } from '../lib/http'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  )
}

function ProfileContent() {
  const { user, avatarUrl, logout, uploadAvatar, removeAvatar } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isTmdb = Boolean(user?.tmdb_id)
  const hasCustomPhoto = Boolean(user?.profile_photo_path)
  const [photoError, setPhotoError] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)

  const displayName = user?.name?.trim() || user?.tmdb_username || 'Profile'
  const subtitle = user?.tmdb_username
    ? `@${user.tmdb_username}`
    : user?.email && !user.email.endsWith('@tmdb.sceneshelf.local')
      ? user.email
      : null

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
      toast('Photo updated')
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
      toast('Photo removed')
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Could not remove photo.')
    } finally {
      setPhotoBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="size-20 rounded-full object-cover ring-1 ring-border sm:size-24"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-elevated ring-1 ring-border sm:size-24">
            <UserCircleIcon className="size-12 text-fg-muted" />
          </div>
        )}
        <div>
          <h1 className="font-display text-3xl text-fg sm:text-4xl">{displayName}</h1>
          {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/myshelf"
              className="rounded-md border border-border bg-elevated/40 px-3 py-1.5 text-sm text-fg transition hover:border-brass"
            >
              My Shelf
            </Link>
            {isTmdb && user?.tmdb_username && (
              <a
                href={`https://www.themoviedb.org/u/${user.tmdb_username}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-elevated/40 px-3 py-1.5 text-sm text-fg transition hover:border-brass"
              >
                TMDB profile
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-xl space-y-10">
        <section>
          <h2 className="font-display text-xl text-fg">Photo</h2>
          <p className="mt-1 text-sm text-fg-secondary">JPG, PNG, or WebP up to 2MB.</p>
          <div className="mt-5 flex flex-wrap gap-2">
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
          {photoError && <p className="mt-3 text-sm text-red-400">{photoError}</p>}
        </section>

        <section>
          <h2 className="font-display text-xl text-fg">Appearance</h2>
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

        <section>
          <h2 className="font-display text-xl text-fg">Session</h2>
          <button
            type="button"
            onClick={onLogout}
            className="mt-5 rounded-md border border-border px-4 py-2.5 text-sm text-fg transition hover:border-red-400/60 hover:text-red-400"
          >
            Log out
          </button>
        </section>
      </div>
    </div>
  )
}
