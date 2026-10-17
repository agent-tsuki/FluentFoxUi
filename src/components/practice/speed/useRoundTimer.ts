import { useEffect, useRef, useState } from 'react'

const TICK_MS = 100

/**
 * Counts `durationMs` down while `running`. Time only passes while the tab is
 * visible: hiding the tab (visibilitychange) pauses it, showing it resumes.
 * Calls `onEnd` once when it reaches zero. Restart by bumping `runId`.
 */
export function useRoundTimer(running: boolean, durationMs: number, runId: number, onEnd: () => void) {
  const [remaining, setRemaining] = useState(durationMs)
  const [paused, setPaused] = useState(false)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    setRemaining(durationMs)
  }, [durationMs, runId])

  useEffect(() => {
    if (!running) return
    let left = durationMs
    let last = performance.now()
    let ended = false
    setRemaining(left)

    const tick = () => {
      const now = performance.now()
      if (document.hidden) {
        last = now
        return
      }
      left = Math.max(0, left - (now - last))
      last = now
      setRemaining(left)
      if (left === 0 && !ended) {
        ended = true
        window.clearInterval(id)
        onEndRef.current()
      }
    }
    const onVisibility = () => {
      // Don't count the time the tab was hidden.
      last = performance.now()
      setPaused(document.hidden)
    }

    const id = window.setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [running, durationMs, runId])

  return { remaining, paused }
}
