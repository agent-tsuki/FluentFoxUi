import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useKanaScript } from '@/context/KanaScriptContext'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { STICKY_RAIL_TOP, type CourseUnitView } from './courseUnits'

/**
 * CourseRail — the Course page's side column, from `lg` only: a sticky card
 * with progress by group and quick links. Below `lg` the group headers carry
 * the bars and the SectionNav the links. Practice lives in each unit.
 */
interface CourseRailProps {
  byId: ReadonlyMap<string, CourseUnitView>
  className?: string
}

/** Quick links, relative to the course base. */
const QUICK_LINKS = [
  { to: '/chart', label: 'Chart', icon: 'grid_view' },
  { to: '/tests', label: 'Check', icon: 'quiz' },
  { to: '/downloads', label: 'Print', icon: 'download' },
] as const

export function CourseRail({ byId, className }: CourseRailProps) {
  const script = useKanaScript()
  return (
    <aside
      aria-label="Course tools"
      className={cn(
        'hidden lg:sticky lg:block lg:self-start lg:rounded-xl lg:border lg:border-line lg:bg-surface-raised lg:dark:border-line-strong/60 lg:dark:bg-surface-sunken',
        STICKY_RAIL_TOP,
        className,
      )}
    >
      <RailBlock title="Your progress">
        <ul className="space-y-3">
          {script.groups.map((group) => {
            const units = group.unitIds.flatMap((id) => byId.get(id) ?? [])
            const done = units.filter((u) => u.complete).length
            return (
              <li key={group.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-ink">{group.title}</span>
                  <span className="tabular-nums text-ink-muted">
                    {done} / {units.length}
                  </span>
                </div>
                <ProgressBar
                  value={done}
                  max={units.length}
                  label={`${group.title} units done`}
                  valueText={`${done} of ${units.length} units done`}
                  tone={done === units.length ? 'success' : 'primary'}
                />
              </li>
            )
          })}
        </ul>
      </RailBlock>

      <nav aria-label="More in this course" className="border-t border-line p-2">
        <ul>
          {QUICK_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={script.basePath + link.to}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-ink hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:hover:bg-surface-hover"
              >
                <span aria-hidden className="flex">
                  <Icon name={link.icon} className="text-xl text-ink-muted" />
                </span>
                <span className="flex-1">{link.label}</span>
                <span aria-hidden className="flex">
                  <Icon name="chevron_right" className="text-xl text-ink-muted" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function RailBlock({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className={cn('p-5', className)}>
      <h2 className="mb-3 font-display text-base font-bold text-ink">{title}</h2>
      {children}
    </section>
  )
}
