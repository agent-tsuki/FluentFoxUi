import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useKanaScript } from '@/context/KanaScriptContext'
import { COURSE_CONTAINER, coursePagesFor } from './coursePages'

/**
 * SectionNav — the kana course sub-nav (Course · Chart · Tests · Downloads).
 * Real links with `aria-current="page"` (NavLink), sticky just under the fixed
 * site navbar (`top-nav`). Flat with a bottom border at rest; once it sticks,
 * the border gives way to `shadow-elevation-1` (border or elevation, never both).
 * The four items fit from 320 px up (tighter padding below 340 px); the list
 * still scrolls sideways as a last resort.
 */
interface SectionNavProps {
  className?: string
}

const ITEM =
  'relative inline-flex h-full min-w-11 items-center justify-center whitespace-nowrap rounded-xl px-2 text-sm font-semibold transition-colors duration-150 min-[340px]:px-3 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ' +
  // The active underline: 2 px, flush with the bar's bottom edge.
  'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full min-[340px]:after:inset-x-3'

export function SectionNav({ className }: SectionNavProps) {
  const stuck = useStuck()
  const script = useKanaScript()

  return (
    <>
      {/* A 1 px marker just above the bar: once it scrolls under the site navbar, the bar is stuck. */}
      <div ref={stuck.sentinelRef} aria-hidden className="-mb-px h-px" />
      <nav
        ref={stuck.navRef}
        aria-label={`${script.label} course`}
        className={cn(
          'sticky top-nav z-30 h-12 border-b bg-surface transition-shadow duration-200',
          stuck.isStuck ? 'border-transparent shadow-elevation-1' : 'border-outline-variant/60',
          className,
        )}
      >
        <div className={cn(COURSE_CONTAINER, 'h-full')}>
          <ul className="-mx-2 flex h-full items-stretch gap-1 overflow-x-auto [scrollbar-width:none] min-[340px]:-mx-3 [&::-webkit-scrollbar]:hidden">
            {coursePagesFor(script).map((page) => (
              <li key={page.id} className="flex">
                <NavLink
                  to={page.to}
                  end={page.to === script.basePath}
                  className={({ isActive }) =>
                    cn(
                      ITEM,
                      isActive ? 'text-primary after:bg-primary' : 'text-on-surface-variant hover:text-on-surface',
                    )
                  }
                >
                  {page.navLabel}
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
