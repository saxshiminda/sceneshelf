import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth'
import { ApiError } from '../lib/http'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const next = await getUser()
    setUser(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const next = await getUser()
        if (!cancelled) setUser(next)
      } catch (err) {
        if (!cancelled) {
          setUser(null)
          if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 419)) {
            // Non-auth failures still leave the user logged out for this session.
          }
        }
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
      await refreshUser()
    },
    [refreshUser],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await apiRegister(payload)
      await refreshUser()
    },
    [refreshUser],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch (err) {
      if (!(err instanceof ApiError)) throw err
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
