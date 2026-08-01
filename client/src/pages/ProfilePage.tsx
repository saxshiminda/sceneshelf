import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
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
  const { user, avatarUrl, logout, updateProfile, uploadAvatar } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isTmdb = Boolean(user?.tmdb_id)
  const isTmdbPlaceholderEmail = Boolean(user?.email?.endsWith('@tmdb.sceneshelf.local'))
  const needsCurrentPassword = !isTmdbPlaceholderEmail

  const [name, setName] = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [formError, setFormError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [saving, setSaving] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)

  useEffect(() => {
    setName(user?.name ?? '')
  }, [user?.name])

  const displayName = user?.name?.trim() || user?.tmdb_username || 'Profile'
  const subtitle = user?.tmdb_username
    ? `@${user.tmdb_username}`
    : user?.email && !isTmdbPlaceholderEmail
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

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setFormError('')

    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('Name is required.')
      return
    }

    const changingPassword = password.length > 0 || passwordConfirmation.length > 0
    if (changingPassword) {
      if (password !== passwordConfirmation) {
        setFormError('New passwords do not match.')
        return
      }
      if (needsCurrentPassword && !currentPassword) {
        setFormError('Enter your current password to set a new one.')
        return
      }
    }

    setSaving(true)
    try {
      await updateProfile({
        name: trimmed,
        ...(changingPassword
          ? {
              password,
              password_confirmation: passwordConfirmation,
              ...(needsCurrentPassword ? { current_password: currentPassword } : {}),
            }
          : {}),
      })
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
      toast('Profile saved')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
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
            aria-label="Change profile photo"
            className="group relative block overflow-hidden rounded-full ring-1 ring-border transition hover:ring-brass disabled:opacity-60"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-20 object-cover sm:size-24"
              />
            ) : (
              <div className="flex size-20 items-center justify-center bg-elevated sm:size-24">
                <UserCircleIcon className="size-12 text-fg-muted" />
              </div>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {photoBusy ? '…' : 'Change'}
            </span>
          </button>
          {photoError && <p className="mt-2 max-w-[10rem] text-xs text-red-400">{photoError}</p>}
        </div>

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
          <h2 className="font-display text-xl text-fg">Account</h2>
          <form onSubmit={onSave} className="mt-5 space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm text-fg-secondary">
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
              />
            </div>

            <div>
              <label htmlFor="profile-password" className="mb-1.5 block text-sm text-fg-secondary">
                New password
              </label>
              <input
                id="profile-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
              />
              <p className="mt-1.5 text-xs text-fg-muted">Leave blank to keep your current password.</p>
            </div>

            {(password.length > 0 || passwordConfirmation.length > 0) && (
              <>
                {needsCurrentPassword && (
                  <div>
                    <label
                      htmlFor="profile-current-password"
                      className="mb-1.5 block text-sm text-fg-secondary"
                    >
                      Current password
                    </label>
                    <input
                      id="profile-current-password"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="profile-password-confirmation"
                    className="mb-1.5 block text-sm text-fg-secondary"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="profile-password-confirmation"
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
                  />
                </div>
              </>
            )}

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md border border-border bg-elevated/40 px-4 py-2.5 text-sm text-fg transition hover:border-brass disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
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
