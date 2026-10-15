import { useCallback, useEffect, useState } from 'react'

/**
 * A seconds countdown, e.g. for resend cooldowns.
 * `start(60)` begins counting; `remaining` reaches 0 when done.
 */
export function useCountdown() {
  const [endsAt, setEndsAt]       = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) setEndsAt(null)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [endsAt])

  const start = useCallback((seconds: number) => {
    setEndsAt(Date.now() + seconds * 1000)
  }, [])

  return { remaining, isRunning: remaining > 0, start }
}
