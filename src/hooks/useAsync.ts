import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  /** Re-run the load (e.g. from an ErrorState retry button). */
  refetch: () => void
}

interface Settled<T> {
  /** The `key` this result belongs to; `null` forces a reload (refetch). */
  key: string | null
  data: T | undefined
  error: Error | null
}

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

/**
 * useAsync — the shared data-fetching hook (FRONTEND_STANDARDS §6). Runs `load`
 * whenever `key` changes, ignores results that arrive after the key changed or
 * the component unmounted, and exposes loading/error state plus `refetch`.
 *
 * `peek` (optional) returns already-cached data synchronously; when it returns
 * something other than `undefined` there is no loading state at all, so cached
 * views render on the first frame.
 */
export function useAsync<T>(key: string, load: () => Promise<T>, peek?: () => T | undefined): AsyncState<T> {
  const [settled, setSettled] = useState<Settled<T>>({ key: null, data: undefined, error: null })
  const [attempt, setAttempt] = useState(0)

  const loadRef = useRef(load)
  const peekRef = useRef(peek)
  useLayoutEffect(() => {
    loadRef.current = load
    peekRef.current = peek
  })

  useEffect(() => {
    let cancelled = false
    const cached = peekRef.current?.()
    if (cached !== undefined) {
      setSettled({ key, data: cached, error: null })
      return
    }
    loadRef.current().then(
      data => !cancelled && setSettled({ key, data, error: null }),
      (error: unknown) => !cancelled && setSettled({ key, data: undefined, error: toError(error) }),
    )
    return () => {
      cancelled = true
    }
  }, [key, attempt])

  const refetch = useCallback(() => {
    setSettled(s => ({ ...s, key: null }))
    setAttempt(a => a + 1)
  }, [])

  // Until the effect settles for this key, fall back to the synchronous cache.
  if (settled.key === key) return { data: settled.data, isLoading: false, error: settled.error, refetch }
  const peeked = peek?.()
  return { data: peeked, isLoading: peeked === undefined, error: null, refetch }
}
