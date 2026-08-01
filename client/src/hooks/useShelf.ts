import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getShelf,
  getShelfStatus,
  getShelfStatuses,
  shelfKey,
  toggleShelf,
  type ShelfFlag,
  type ShelfFlags,
  type ShelfItem,
  type ShelfList,
  type ToggleShelfPayload,
} from '../api/shelf'
import { ApiError } from '../lib/http'
import { inflightDedupe } from '../lib/inflight'
import { useAuth } from '../auth/AuthProvider'
import type { MediaType, TitleCard } from '../types/tmdb'

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
      const next = await inflightDedupe(`shelf:list:${list}`, () => getShelf(list))
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
    let cancelled = false
    ;(async () => {
      if (!isAuthenticated) {
        setItems([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const next = await inflightDedupe(`shelf:list:${list}`, () => getShelf(list))
        if (!cancelled) setItems(next)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load shelf'))
          setItems([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, list])

  const removeFromList = useCallback(
    async (item: ShelfItem) => {
      const flag: ShelfFlag =
        list === 'watched' ? 'watched' : list === 'want' ? 'want_to_watch' : 'favorite'

      const result = await toggleShelf({
        tmdb_id: item.tmdb_id,
        media_type: item.media_type,
        flag,
        title: item.title,
        poster_path: item.poster_path,
        year: item.year,
      })

      setItems((prev) =>
        prev.filter((row) => !(row.tmdb_id === item.tmdb_id && row.media_type === item.media_type)),
      )

      return result
    },
    [list],
  )

  return { items, isLoading: authLoading || isLoading, error, reload, removeFromList }
}

export function useShelfStatus(mediaType: MediaType | null, tmdbId: number | null) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [status, setStatus] = useState<ShelfFlags>({
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
        const item = await inflightDedupe(`shelf:status:${mediaType}:${tmdbId}`, () =>
          getShelfStatus(mediaType, tmdbId),
        )
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
        return result
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not update shelf.')
        return null
      } finally {
        setBusy(false)
      }
    },
    [isAuthenticated, mediaType, tmdbId],
  )

  return { status, isLoading, busy, error, toggle, isAuthenticated }
}

/** One batch request for a list of titles (search results). */
export function useShelfStatusMap(titles: TitleCard[]) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [map, setMap] = useState<Record<string, ShelfFlags>>({})
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const titleKey = useMemo(
    () => titles.map((t) => shelfKey(t.mediaType, t.id)).join(','),
    [titles],
  )

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || titles.length === 0) {
      setMap({})
      return
    }

    let cancelled = false
    const items = titles.map((t) => ({ media_type: t.mediaType, tmdb_id: t.id }))
    ;(async () => {
      try {
        const next = await inflightDedupe(`shelf:statuses:${titleKey}`, () =>
          getShelfStatuses(items),
        )
        if (!cancelled) setMap(next)
      } catch {
        if (!cancelled) setMap({})
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, titleKey, titles])

  const toggle = useCallback(
    async (title: TitleCard, flag: ShelfFlag) => {
      if (!isAuthenticated) return null
      const key = shelfKey(title.mediaType, title.id)
      setBusyKey(key)
      try {
        const result = await toggleShelf({
          tmdb_id: title.id,
          media_type: title.mediaType,
          flag,
          title: title.title,
          poster_path: title.posterPath,
          year: title.year,
        })
        setMap((prev) => ({
          ...prev,
          [key]: {
            watched: result.watched,
            want_to_watch: result.want_to_watch,
            favorite: result.favorite,
          },
        }))
        return result
      } finally {
        setBusyKey(null)
      }
    },
    [isAuthenticated],
  )

  return {
    map,
    busyKey,
    isAuthenticated,
    statusFor: (title: TitleCard) =>
      map[shelfKey(title.mediaType, title.id)] ?? {
        watched: false,
        want_to_watch: false,
        favorite: false,
      },
    toggle,
  }
}
