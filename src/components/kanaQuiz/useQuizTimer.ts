import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * useQuizTimer — counts active time while `running`, paused whenever the tab
 * is hidden. Calls `onExpire` once the limit is reached. Re-renders once per
 * second (not per tick) so the countdown text stays cheap.
 */
export function useQuizTimer(limitSeconds: number, running: boolean, onExpire: () => void) {
  const elapsedMs = useRef(0)
  const [elapsed, setElapsed] = useState(0)
  const expireRef = useRef(onExpire)
  useLayoutEffect(() => {
    expireRef.current = onExpire
  })

  useEffect(() => {
    if (!running) return
    let banked = elapsedMs.current
    let since: number | null = document.hidden ? null : performance.now()
    const read = () => banked + (since === null ? 0 : performance.now() - since)

    const tick = () => {
      const ms = read()
      elapsedMs.current = ms
      setElapsed(Math.min(limitSeconds, Math.floor(ms / 1000)))
      if (ms >= limitSeconds * 1000) expireRef.current()
    }
    const onVisibility = () => {
      if (document.hidden) {
        banked = read()
        since = null
      } else {
        since = performance.now()
      }
      tick()
    }

    const id = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
      elapsedMs.current = read()
    }
  }, [running, limitSeconds])

  const reset = useCallback(() => {
    elapsedMs.current = 0
    setElapsed(0)
  }, [])

  /** Active seconds so far, and seconds left. */
  return { elapsed, remaining: Math.max(0, limitSeconds - elapsed), reset, getElapsedMs: () => elapsedMs.current }
}

/** 365 → "6:05". */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** 365 → "6 min 5 s", for screen readers and results. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  return m > 0 ? `${m} min ${s % 60} s` : `${s} s`
}
