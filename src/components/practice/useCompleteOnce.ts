import { useEffect, useLayoutEffect, useRef } from 'react'

/**
 * Calls `onComplete` once each time `reached` turns true (a session hitting its
 * results screen). The ref survives StrictMode's mount → unmount → mount
 * effect replay, so a results screen never reports twice; it re-arms once the
 * learner leaves results (e.g. "Play again").
 */
export function useCompleteOnce(reached: boolean, onComplete: (() => void) | undefined) {
  const firedRef = useRef(false)
  const callbackRef = useRef(onComplete)
  useLayoutEffect(() => {
    callbackRef.current = onComplete
  })

  useEffect(() => {
    if (!reached) {
      firedRef.current = false
      return
    }
    if (firedRef.current) return
    firedRef.current = true
    callbackRef.current?.()
  }, [reached])
}
