import { useEffect, useMemo, useState } from 'react'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface CourseTab {
  /** Id of the section the tab scrolls to. */
  id: string
  label: string
}

/**
 * CourseTabs — a sticky in-page nav under the site navbar. Each tab scrolls to
 * its section; the underline follows the section being read.
 */
export function CourseTabs({ tabs }: { tabs: CourseTab[] }) {
  const reducedMotion = useReducedMotion()
  const ids = useMemo(() => tabs.map((t) => t.id), [tabs])
  const spied = useScrollSpy(ids)
  // A tapped tab shows as current at once, before the smooth scroll reaches it.
  const [tapped, setTapped] = useState<string | undefined>()
  useEffect(() => setTapped(undefined), [spied])
  const active = tapped ?? spied ?? ''

  const go = (id: string) => {
    setTapped(id)
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav aria-label="Course sections" className="sticky top-nav z-20 border-b border-line bg-surface/95 backdrop-blur">
      <ul className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 sm:px-6 md:px-10">
        {tabs.map(tab => (
          <li key={tab.id} className="shrink-0">
            <a
              href={`#${tab.id}`}
              onClick={e => { e.preventDefault(); go(tab.id) }}
              aria-current={active === tab.id ? 'location' : undefined}
              className={cn(
                '-mb-px flex min-h-12 items-center border-b-2 px-3 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                active === tab.id ? 'border-primary text-ink' : 'border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
