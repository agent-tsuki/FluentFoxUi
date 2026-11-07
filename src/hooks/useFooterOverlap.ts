import { useEffect, useState } from 'react'

/**
 * How many pixels of the site footer are on screen (0 until it scrolls in).
 * A fixed sidebar moves up by this much, so the footer pushes it away
 * instead of covering it. Updates on
 * scroll, resize and layout changes, at most once per frame.
 */
export function useFooterOverlap(): number {
  const [overlap, setOverlap] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const footer = document.querySelector('footer')
      const top = footer ? footer.getBoundingClientRect().top : Infinity
      setOverlap(Math.max(0, Math.round(window.innerHeight - top)))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Content loading in (or collapsing) moves the footer without a scroll.
    const resize = new ResizeObserver(schedule)
    resize.observe(document.body)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resize.disconnect()
    }
  }, [])

  return overlap
}
