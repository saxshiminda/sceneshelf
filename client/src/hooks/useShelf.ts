import { useCallback, useEffect, useState } from 'react'
import {
  getShelf,
  getShelfStatus,
  toggleShelf,
  type ShelfFlag,
  type ShelfItem,
  type ShelfList,
  type ToggleShelfPayload,
} from '../api/shelf'
import { ApiError } from '../lib/http'
import { useAuth } from '../auth/AuthProvider'
import type { MediaType } from '../types/tmdb'

export function useShelfList(list: ShelfList) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<ShelfItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const next = await getShelf(list)
      setItems(next)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load shelf'))
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, list])

  useEffect(() => {
    if (authLoading) return
    void reload()
  }, [authLoading, reload])

  return { items, isLoading: authLoading || isLoading, error, reload }
}

export function useShelfStatus(mediaType: MediaType | null, tmdbId: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [status, setStatus] = useState({
    watched: false,
    want_to_watch: false,
    favorite: false,
  })
  const [isLoading, setIsLoading] = useState(Boolean(mediaType && tmdbId))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !mediaType || tmdbId === null) {
      setStatus({ watched: false, want_to_watch: false, favorite: false })
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    ;(async () => {
      try {
        const item = await getShelfStatus(mediaType, tmdbId)
        if (cancelled) return
        setStatus({
          watched: Boolean(item?.watched),
          want_to_watch: Boolean(item?.want_to_watch),
          favorite: Boolean(item?.favorite),
        })
      } catch {
        if (!cancelled) {
          setStatus({ watched: false, want_to_watch: false, favorite: false })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, mediaType, tmdbId])

  const toggle = useCallback(
    async (flag: ShelfFlag, meta: Omit<ToggleShelfPayload, 'flag' | 'tmdb_id' | 'media_type'>) => {
      if (!mediaType || tmdbId === null) return
      if (!isAuthenticated) {
        setError('Sign in to save titles to your shelf.')
        return
      }

      setBusy(true)
      setError(null)
      try {
        const result = await toggleShelf({
          tmdb_id: tmdbId,
          media_type: mediaType,
          flag,
          ...meta,
        })
        setStatus({
          watched: result.watched,
          want_to_watch: result.want_to_watch,
          favorite: result.favorite,
        })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not update shelf.')
      } finally {
        setBusy(false)
      }
    },
    [isAuthenticated, mediaType, tmdbId],
  )

  return { status, isLoading, busy, error, toggle, isAuthenticated }
}
