import { useEffect, useRef, useState } from 'react'
import { inflightDedupe } from '../lib/inflight'

/** Fetches data when deps change; dedupes Strict Mode double-mounts. */

export interface UseFetchResult<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  refetch: () => void
}

export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    const key = `fetch:${tick}:${JSON.stringify(deps)}`

    setIsLoading(true)
    setError(null)

    inflightDedupe(key, () => fetcherRef.current(new AbortController().signal))
      .then((result) => {
        if (cancelled) return
        setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      // Do not abort — Strict Mode remount must reuse the same in-flight request.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps come from the caller
  }, [...deps, tick])

  return {
    data,
    error,
    isLoading,
    refetch: () => setTick((n) => n + 1),
  }
}
