import { useEffect, useState } from 'react'
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
  const [active, setActive] = useState(tabs[0]?.id ?? '')

  useEffect(() => {
    const sections = tabs.map(t => document.getElementById(t.id)).filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return
    // A section is "current" once its top passes the band just under the sticky bars.
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-140px 0px -55% 0px' },
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [tabs])

  const go = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav aria-label="Course sections" className="sticky top-nav z-20 border-b border-outline-variant/60 bg-surface/95 backdrop-blur">
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
                active === tab.id ? 'border-primary text-on-surface' : 'border-transparent text-on-surface-variant hover:text-on-surface',
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
