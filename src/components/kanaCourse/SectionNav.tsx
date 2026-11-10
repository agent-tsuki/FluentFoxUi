import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { useKanaScript } from '@/context/KanaScriptContext'
import { COURSE_CONTAINER, coursePagesFor } from './coursePages'

/** SectionNav: the kana course's pages (Chart, Learn, Check, Print), built on CourseSectionNav. */
interface SectionNavProps {
  className?: string
}

export interface CourseNavItem {
  to: string
  label: string
  /** Match the path exactly. */
  end?: boolean
  /** Small count after the label, e.g. reviews due. */
  badge?: number
}

const ITEM = 'flex min-h-touch-target items-center justify-center whitespace-nowrap rounded-md px-3 text-label transition-colors duration-fast'

export function SectionNav({ className }: SectionNavProps) {
  const script = useKanaScript()
  const items = coursePagesFor(script).map((page) => ({ to: page.to, label: page.navLabel, end: page.id === 'course' }))
  return <CourseSectionNav label={`${script.label} course`} items={items} className={className} />
}

/** The same sticky sub-nav for any course (the kanji levels use it directly). */
export function CourseSectionNav({ label, items, className }: { label: string; items: readonly CourseNavItem[]; className?: string }) {
  return (
    <nav aria-label={label} className={cn('sticky top-nav z-30 bg-surface py-2', className)}>
      <div className={COURSE_CONTAINER}>
        <ul className="flex gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.to} className="flex-[1_0_auto]">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(ITEM, isActive ? 'bg-surface-raised text-ink shadow-elevation-1' : 'text-ink-muted hover:bg-surface-hover hover:text-ink')}
              >
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge tone="current" className="ml-1.5 tabular-nums">
                    <span className="sr-only">, </span>
                    {item.badge}
                    <span className="sr-only"> due</span>
                  </Badge>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
