import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveErrorMessage } from '@/api/errors'

export type ActionResult<T> = { ok: true; value: T } | { ok: false }

export interface AdminActionState {
  /** Key of the action in flight (e.g. 'sync', 'reset:name'), or null. */
  busy:    string | null
  /** Friendly message for the last failure. */
  error:   string
  /** Short confirmation for the last success, when one was given. */
  notice:  string
  /** Runs `action`; never rejects — check `ok` on the result. */
  run:     <T>(key: string, action: () => Promise<T>, successNotice?: string) => Promise<ActionResult<T>>
  clear:   () => void
}

/**
 * useAdminAction — busy/error/notice bookkeeping for admin writes, so each
 * button shows its own spinner and failures surface as a readable message
 * instead of an unhandled rejection.
 */
export function useAdminAction(): AdminActionState {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const run = useCallback(async <T>(key: string, action: () => Promise<T>, successNotice?: string): Promise<ActionResult<T>> => {
    setBusy(key)
    setError('')
    setNotice('')
    try {
      const result = await action()
      if (mounted.current && successNotice) setNotice(successNotice)
      return { ok: true, value: result }
    } catch (err: unknown) {
      if (mounted.current) setError(resolveErrorMessage(err))
      return { ok: false }
    } finally {
      if (mounted.current) setBusy(null)
    }
  }, [])

  const clear = useCallback(() => {
    setError('')
    setNotice('')
  }, [])

  return { busy, error, notice, run, clear }
}
