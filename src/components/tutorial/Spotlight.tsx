import { useLayoutEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Space between the highlighted element and the cut-out's edge. */
const PAD = 8
/** Space between the cut-out and the card under it. */
const GAP = 14
const GUTTER = 16
const CARD_MAX_W = 384

interface Box {
  top: number
  left: number
  width: number
  height: number
}

/** The visible box of `[data-tour="<target>"]`, kept current on resize and scroll; null when absent or hidden (e.g. desktop-only nav on a phone). */
function useTargetBox(target: string | undefined): Box | null {
  const [box, setBox] = useState<Box | null>(null)

  useLayoutEffect(() => {
    if (!target) {
      setBox(null)
      return
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
    if (!el) {
      setBox(null)
      return
    }
    const measure = () => {
      const r = el.getBoundingClientRect()
      setBox(r.width > 0 && r.height > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [target])

  return box
}

interface SpotlightProps {
  /** `data-tour` value of the element to highlight; omit for a centred card. */
  target?: string
  reducedMotion: boolean
  children: ReactNode
}

/**
 * Dims the page with a cut-out around the target and pins `children` (the
 * step card) under it. Without a visible target the card is centred, so
 * every step works on phones where the highlighted UI is in a drawer.
 * Clicks on the dimmed page are swallowed: a stray tap must not skip the tour.
 */
export function Spotlight({ target, reducedMotion, children }: SpotlightProps) {
  const box = useTargetBox(target)
  const hole = box && {
    x: box.left - PAD,
    y: box.top - PAD,
    w: box.width + PAD * 2,
    h: box.height + PAD * 2,
  }

  const cardStyle = hole
    ? {
        top: hole.y + hole.h + GAP,
        left: Math.max(GUTTER, Math.min(hole.x + hole.w / 2 - CARD_MAX_W / 2, window.innerWidth - CARD_MAX_W - GUTTER)),
      }
    : undefined

  return (
    <div className="fixed inset-0 z-[70]">
      <svg aria-hidden className="absolute inset-0 h-full w-full text-black/55" onClick={(e) => e.stopPropagation()}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {hole && <rect x={hole.x} y={hole.y} width={hole.w} height={hole.h} rx={12} fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="currentColor" mask="url(#tour-mask)" />
      </svg>

      {hole && (
        <div
          aria-hidden
          className={cn('pointer-events-none absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent', !reducedMotion && 'animate-pulse')}
          style={{ top: hole.y, left: hole.x, width: hole.w, height: hole.h }}
        />
      )}

      <div
        className={cn(
          'absolute w-[min(24rem,calc(100vw-2rem))]',
          !hole && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
        style={cardStyle}
      >
        {children}
      </div>
    </div>
  )
}
