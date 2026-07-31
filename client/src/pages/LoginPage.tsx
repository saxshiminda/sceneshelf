import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ApiError } from '../lib/http'

export default function LoginPage() {
  const { login, loginWithTmdb, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : '/profile'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password, remember })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function onTmdbRedirect() {
    setError('')
    setRedirecting(true)
    try {
      await loginWithTmdb()
    } catch (err) {
      setRedirecting(false)
      setError(err instanceof ApiError ? err.message : 'Could not start TMDB login.')
    }
  }

  const busy = submitting || redirecting

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-fg">Welcome back</h1>
      <p className="mt-2 text-sm text-fg-secondary">
        Sign in with SceneShelf or your TMDB account.
      </p>

      <form onSubmit={onEmailSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm text-fg-secondary">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm text-fg-secondary">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-fg-secondary">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-border"
          />
          Remember me
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brass py-3 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-fg-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={onTmdbRedirect}
        disabled={busy}
        className="w-full rounded-md border border-border bg-elevated/40 py-3 text-sm text-fg transition hover:border-brass disabled:opacity-60"
      >
        {redirecting ? 'Redirecting…' : 'Log in with TMDB'}
      </button>

      <p className="mt-6 text-center text-sm text-fg-muted">
        No account?{' '}
        <Link to="/signup" className="text-brass hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
