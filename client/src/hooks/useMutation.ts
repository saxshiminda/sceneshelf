import { useEffect, useRef, useState } from 'react'

/** Runs a write (POST/PUT/PATCH/DELETE) when you call `mutate()`. */

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>
  data: TData | null
  error: Error | null
  isPending: boolean
  reset: () => void
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables, signal: AbortSignal) => Promise<TData>,
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isPending, setIsPending] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
    }
  }, [])

  async function mutate(variables: TVariables): Promise<TData | undefined> {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setIsPending(true)
    setError(null)

    try {
      const result = await mutationFn(variables, controller.signal)
      if (mountedRef.current) {
        setData(result)
        setIsPending(false)
      }
      return result
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return undefined
      if (err instanceof Error && err.name === 'AbortError') return undefined

      const next = err instanceof Error ? err : new Error(String(err))
      if (mountedRef.current) {
        setError(next)
        setIsPending(false)
      }
      throw next
    }
  }

  function reset() {
    controllerRef.current?.abort()
    setData(null)
    setError(null)
    setIsPending(false)
  }

  return { mutate, data, error, isPending, reset }
}
