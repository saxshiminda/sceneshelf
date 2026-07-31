import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ApiError } from '../lib/http'

export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const { completeRedirectLogin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const requestToken = params.get('request_token')
    const approved = params.get('approved')

    if (!requestToken || approved === 'false') {
      setError('TMDB authorization was cancelled or incomplete.')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        await completeRedirectLogin(requestToken)
        if (!cancelled) navigate('/profile', { replace: true })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not finish TMDB login.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params, completeRedirectLogin, navigate])

  if (isAuthenticated && !error) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="font-display text-3xl text-fg">Connecting TMDB</h1>
      <p className="mt-2 text-sm text-fg-secondary">
        {error || 'Finishing sign-in and saving your account…'}
      </p>
      {error && (
        <a href="/login" className="mt-6 inline-block text-sm text-brass hover:underline">
          Back to login
        </a>
      )}
    </div>
  )
}
