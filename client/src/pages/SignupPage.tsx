import { Link, Navigate, useNavigate } from 'react-router-dom'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ApiError } from '../lib/http'

export default function SignupPage() {
  const { register, loginWithTmdb, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create account.')
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
      <h1 className="font-display text-3xl text-fg">Create your shelf</h1>
      <p className="mt-2 text-sm text-fg-secondary">
        Register with email, or connect a TMDB account.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="signup-name" className="mb-1.5 block text-sm text-fg-secondary">
            Name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-sm text-fg-secondary">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-sm text-fg-secondary">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
          />
        </div>
        <div>
          <label
            htmlFor="signup-password-confirmation"
            className="mb-1.5 block text-sm text-fg-secondary"
          >
            Confirm password
          </label>
          <input
            id="signup-password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none focus:border-brass"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-brass py-3 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
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
        {redirecting ? 'Redirecting…' : 'Sign up with TMDB'}
      </button>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-brass hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
