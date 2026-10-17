import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useKanaScript } from '@/context/KanaScriptContext'
import { COURSE_CONTAINER, coursePagesFor } from './coursePages'

/**
 * SectionNav — the kana course sub-nav (Course · Chart · Tests · Downloads),
 * built on CourseSectionNav (also used by the kanji course).
 * Real links with `aria-current="page"` (NavLink), sticky just under the fixed
 * site navbar (`top-nav`). Flat with a bottom border at rest; once it sticks,
 * the border gives way to `shadow-elevation-1` (border or elevation, never both).
 * The four items fit from 320 px up (tighter padding below 340 px); the list
 * still scrolls sideways as a last resort.
 */
interface SectionNavProps {
  className?: string
}

export interface CourseNavItem {
  to: string
  label: string
  /** Match the path exactly (the course root). */
  end?: boolean
  /** Small count after the label, e.g. reviews due. */
  badge?: number
}

const ITEM =
  'relative inline-flex h-full min-w-11 items-center justify-center whitespace-nowrap rounded-xl px-2 text-sm font-semibold transition-colors duration-150 min-[340px]:px-3 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ' +
  // The active underline: 2 px, flush with the bar's bottom edge.
  'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full min-[340px]:after:inset-x-3'

export function SectionNav({ className }: SectionNavProps) {
  const script = useKanaScript()
  const items = coursePagesFor(script).map((page) => ({ to: page.to, label: page.navLabel, end: page.to === script.basePath }))
  return <CourseSectionNav label={`${script.label} course`} items={items} className={className} />
}

/** The same sticky sub-nav for any course (the kanji levels use it directly). */
export function CourseSectionNav({ label, items, className }: { label: string; items: readonly CourseNavItem[]; className?: string }) {
  const stuck = useStuck()

  return (
    <>
      {/* A 1 px marker just above the bar: once it scrolls under the site navbar, the bar is stuck. */}
      <div ref={stuck.sentinelRef} aria-hidden className="-mb-px h-px" />
      <nav
        ref={stuck.navRef}
        aria-label={label}
        className={cn(
          'sticky top-nav z-30 h-12 border-b bg-surface transition-shadow duration-200',
          stuck.isStuck ? 'border-transparent shadow-elevation-1' : 'border-outline-variant/60',
          className,
        )}
      >
        <div className={cn(COURSE_CONTAINER, 'h-full')}>
          <ul className="-mx-2 flex h-full items-stretch gap-1 overflow-x-auto [scrollbar-width:none] min-[340px]:-mx-3 [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <li key={item.to} className="flex">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      ITEM,
                      isActive ? 'text-primary after:bg-primary' : 'text-on-surface-variant hover:text-on-surface',
                    )
                  }
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-xs font-bold tabular-nums text-primary">
                      <span className="sr-only">, </span>
                      {item.badge}
                      <span className="sr-only"> due</span>
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}

/**
 * Whether the sticky bar is pinned. Watches the sentinel against a root
 * margin equal to the bar's own computed `top` (the site-nav height), so the
 * nav-height token stays the single source of truth.
 */
function useStuck() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const nav = navRef.current
    if (!sentinel || !nav || typeof IntersectionObserver === 'undefined') return
    const offset = Math.round(parseFloat(getComputedStyle(nav).top) || 0)
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < offset + 1),
      { rootMargin: `-${offset + 1}px 0px 0px 0px`, threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return { sentinelRef, navRef, isStuck }
}
