import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

interface CarouselProps<T> {
  items: readonly T[]
  /** Stable key for an item. */
  itemKey: (item: T) => string
  renderItem: (item: T, index: number) => ReactNode
  /** Names the carousel for screen readers, and labels the arrows ("Previous {label}"). */
  label: string
  /** Shown on the left of the arrows row, e.g. the section heading. */
  header?: ReactNode
  /** Card widths per breakpoint; the default shows about 1¼, 2, 3 then 4 cards. */
  itemClassName?: string
  className?: string
}

const GAP_PX = 16
const DEFAULT_ITEM = 'w-[80%] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]'

const ARROW =
  'grid size-11 place-items-center rounded-full border border-line-strong bg-surface-raised text-ink transition-colors duration-fast hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-raised'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Carousel: one row of cards that slides sideways. Arrows move one card at a
 * time and dim at either end; touch and trackpads swipe, cards snap into
 * place, and a thin bar shows where you are in the row. The track itself is
 * focusable, so arrow keys scroll it too.
 */
export function Carousel<T>({ items, itemKey, renderItem, label, header, itemClassName = DEFAULT_ITEM, className }: CarouselProps<T>) {
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })
  const [bar, setBar] = useState({ width: 1, left: 0 })

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 })
    const width = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1
    setBar({ width, left: max > 0 ? (el.scrollLeft / max) * (1 - width) : 0 })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const resize = new ResizeObserver(measure)
    resize.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      resize.disconnect()
    }
  }, [measure, items.length])

  const move = (direction: 1 | -1) => {
    const el = track.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return
    el.scrollBy({ left: direction * (card.offsetWidth + GAP_PX), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const scrolls = !(edges.start && edges.end)

  return (
    <section aria-roledescription="carousel" aria-label={label} className={className}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">{header}</div>
        {scrolls && (
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => move(-1)} disabled={edges.start} aria-label={`Previous ${label}`} className={ARROW}>
              <Icon name="chevron_left" className="text-2xl" />
            </button>
            <button type="button" onClick={() => move(1)} disabled={edges.end} aria-label={`Next ${label}`} className={ARROW}>
              <Icon name="chevron_right" className="text-2xl" />
            </button>
          </div>
        )}
      </div>

      <ul
        ref={track}
        tabIndex={0}
        aria-label={label}
        className={cn(
          'mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain rounded-md pb-1',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        )}
      >
        {items.map((item, index) => (
          <li key={itemKey(item)} aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}`} className={cn('shrink-0 snap-start', itemClassName)}>
            {renderItem(item, index)}
          </li>
        ))}
      </ul>

      {scrolls && (
        <div aria-hidden="true" className="relative mt-5 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="absolute inset-y-0 rounded-full bg-primary transition-[left] duration-fast motion-reduce:transition-none"
            style={{ width: `${bar.width * 100}%`, left: `${bar.left * 100}%` }}
          />
        </div>
      )}
    </section>
  )
}
