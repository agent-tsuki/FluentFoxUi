import { useEffect, useRef } from 'react'
import { useUI } from '@/context/UIContext'

/**
 * MouseFollower — a subtle ink-drop cursor that trails the real cursor.
 * Renders a small dot + a larger lagged ring.
 * Only visible on pointer (non-touch) devices.
 *
 * Optimisation: the RAF loop fully stops when the cursor hasn't moved for
 * 2 seconds and restarts on the next mousemove — no idle CPU burn.
 */
export function MouseFollower() {
  const { mouseFollowerEnabled } = useUI()
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mouseFollowerEnabled) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let mx = -100, my = -100
    let rx = -100, ry = -100
    let raf = 0
    let idleTimer = 0
    let running = false

    function startLoop() {
      if (running) return
      running = true
      tick()
    }

    function stopLoop() {
      running = false
      cancelAnimationFrame(raf)
    }

    function tick() {
      if (!running) return

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
      }

      rx += (mx - rx) * 0.14
      ry += (my - ry) * 0.14
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`
      }

      raf = requestAnimationFrame(tick)
    }

    function onMove(e: MouseEvent) {
      mx = e.clientX
      my = e.clientY

      // Restart the loop on movement
      startLoop()

      // Schedule loop stop after 2 s of no movement
      clearTimeout(idleTimer)
      idleTimer = window.setTimeout(stopLoop, 2000)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    startLoop()

    return () => {
      window.removeEventListener('mousemove', onMove)
      clearTimeout(idleTimer)
      stopLoop()
    }
  }, [mouseFollowerEnabled])

  if (!mouseFollowerEnabled) return null

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="mouse-follower w-2 h-2 rounded-full bg-primary/70"
        style={{ transform: 'translate(-100px,-100px)' }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="mouse-follower w-9 h-9 rounded-full border border-primary/30"
        style={{ transform: 'translate(-100px,-100px)' }}
      />
    </>
  )
}
