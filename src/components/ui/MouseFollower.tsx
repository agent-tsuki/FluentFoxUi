import { useEffect, useRef } from 'react'
import { useUI } from '@/context/UIContext'

/**
 * MouseFollower — a subtle ink-drop cursor that trails the real cursor.
 * Renders a small circle + a larger ring that follows with slight lag.
 * Only visible on pointer devices (hidden on touch).
 */
export function MouseFollower() {
  const { mouseFollowerEnabled } = useUI()
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mouseFollowerEnabled) return

    // Current mouse position
    let mx = -100, my = -100
    // Ring position (lags behind)
    let rx = -100, ry = -100
    let raf = 0

    function onMove(e: MouseEvent) {
      mx = e.clientX
      my = e.clientY
    }

    function tick() {
      // Instant dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
      }
      // Lerped ring
      rx += (mx - rx) * 0.14
      ry += (my - ry) * 0.14
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`
      }
      raf = requestAnimationFrame(tick)
    }

    // Only activate on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', onMove, { passive: true })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [mouseFollowerEnabled])

  if (!mouseFollowerEnabled) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="mouse-follower w-2 h-2 rounded-full bg-primary/70"
        style={{ transform: 'translate(-100px,-100px)' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="mouse-follower w-9 h-9 rounded-full border border-primary/30"
        style={{ transform: 'translate(-100px,-100px)' }}
      />
    </>
  )
}
