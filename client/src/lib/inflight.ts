/** Share in-flight promises so React Strict Mode remounts don't double-fetch. */

const inflight = new Map<string, Promise<unknown>>()

export function inflightDedupe<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>

  const promise = run().finally(() => {
    // Keep until after the current remount cycle so Strict Mode shares it.
    queueMicrotask(() => {
      if (inflight.get(key) === promise) inflight.delete(key)
    })
  })

  inflight.set(key, promise)
  return promise as Promise<T>
}

export function clearInflight(prefix?: string) {
  if (!prefix) {
    inflight.clear()
    return
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key)
  }
}
