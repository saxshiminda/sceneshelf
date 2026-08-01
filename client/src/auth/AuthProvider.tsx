import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createRequestToken,
  createSession,
  deleteProfilePhoto,
  deleteSession,
  getUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  syncTmdbSession,
  tmdbApproveUrl,
  uploadProfilePhoto,
} from '../api/auth'
import { posterUrl } from '../api/movies'
import { ApiError } from '../lib/http'
import { clearInflight, inflightDedupe } from '../lib/inflight'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

const TMDB_SESSION_KEY = 'sceneshelf_tmdb_session_id'
const AUTH_BOOTSTRAP_KEY = 'auth:bootstrap'

async function bootstrapUser(): Promise<User | null> {
  return inflightDedupe(AUTH_BOOTSTRAP_KEY, async () => {
    try {
      return await getUser()
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 419)) {
        return null
      }
      throw err
    }
  })
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  avatarUrl: string | null
  tmdbSessionId: string | null
  /** Email / password login (Laravel). */
  login: (payload: LoginPayload) => Promise<void>
  /** Email / password register (Laravel). */
  register: (payload: RegisterPayload) => Promise<void>
  /** Start TMDB approve redirect flow. */
  loginWithTmdb: () => Promise<void>
  /** Finish TMDB redirect after /auth/callback. */
  completeRedirectLogin: (requestToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  removeAvatar: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readTmdbSession(): string | null {
  try {
    return localStorage.getItem(TMDB_SESSION_KEY)
  } catch {
    return null
  }
}

function persistTmdbSession(sessionId: string | null) {
  try {
    if (sessionId) localStorage.setItem(TMDB_SESSION_KEY, sessionId)
    else localStorage.removeItem(TMDB_SESSION_KEY)
  } catch {
    // ignore
  }
}

function userAvatar(user: User | null): string | null {
  if (!user) return null
  if (user.profile_photo_url) return user.profile_photo_url
  if (user.avatar_path) return posterUrl(user.avatar_path, 'w342')
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tmdbSessionId, setTmdbSessionId] = useState<string | null>(() => readTmdbSession())
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const next = await getUser()
    setUser(next)
  }, [])

  const applyTmdbSession = useCallback(async (sessionId: string) => {
    const next = await syncTmdbSession(sessionId)
    clearInflight(AUTH_BOOTSTRAP_KEY)
    persistTmdbSession(sessionId)
    setTmdbSessionId(sessionId)
    setUser(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const next = await bootstrapUser()
        if (!cancelled) setUser(next)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      await apiLogin(payload)
      clearInflight(AUTH_BOOTSTRAP_KEY)
      await refreshUser()
    },
    [refreshUser],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await apiRegister(payload)
      clearInflight(AUTH_BOOTSTRAP_KEY)
      await refreshUser()
    },
    [refreshUser],
  )

  const loginWithTmdb = useCallback(async () => {
    const tokenRes = await createRequestToken()
    const redirectTo = `${window.location.origin}/auth/callback`
    window.location.assign(tmdbApproveUrl(tokenRes.request_token, redirectTo))
  }, [])

  const completeRedirectLogin = useCallback(
    async (requestToken: string) => {
      const sessionRes = await createSession(requestToken)
      await applyTmdbSession(sessionRes.session_id)
    },
    [applyTmdbSession],
  )

  const logout = useCallback(async () => {
    const tmdbSession = tmdbSessionId ?? readTmdbSession()
    try {
      await apiLogout()
    } catch (err) {
      if (!(err instanceof ApiError)) throw err
    } finally {
      clearInflight(AUTH_BOOTSTRAP_KEY)
      setUser(null)
      persistTmdbSession(null)
      setTmdbSessionId(null)
    }
    if (tmdbSession) {
      try {
        await deleteSession(tmdbSession)
      } catch (err) {
        if (!(err instanceof ApiError)) throw err
      }
    }
  }, [tmdbSessionId])

  const uploadAvatar = useCallback(async (file: File) => {
    const next = await uploadProfilePhoto(file)
    setUser(next)
  }, [])

  const removeAvatar = useCallback(async () => {
    const next = await deleteProfilePhoto()
    setUser(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      avatarUrl: userAvatar(user),
      tmdbSessionId,
      login,
      register,
      loginWithTmdb,
      completeRedirectLogin,
      logout,
      refreshUser,
      uploadAvatar,
      removeAvatar,
    }),
    [
      user,
      isLoading,
      tmdbSessionId,
      login,
      register,
      loginWithTmdb,
      completeRedirectLogin,
      logout,
      refreshUser,
      uploadAvatar,
      removeAvatar,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
