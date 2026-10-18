import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useKanaScript } from '@/context/KanaScriptContext'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PracticeModeList } from '@/components/sections/KanaChart/PracticeModeList'
import { cn } from '@/lib/cn'
import { HASH_SCROLL_MARGIN, STICKY_RAIL_TOP, type CourseUnitView } from './courseUnits'

/**
 * CourseRail — the Course page's side column. Rendered once: below `lg` it
 * stacks after the curriculum and shows only the Practice block (the group
 * headers already carry the bars, the SectionNav the links); at `lg` it is a
 * sticky card with progress by group, Practice and quick links.
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
        'lg:sticky lg:self-start lg:rounded-2xl lg:border lg:border-outline-variant/60 lg:bg-surface-container-lowest lg:dark:border-outline/60 lg:dark:bg-surface-container-low',
        STICKY_RAIL_TOP,
        className,
      )}
    >
      <RailBlock title="Your progress" className="hidden lg:block">
        <ul className="space-y-3">
          {script.groups.map((group) => {
            const units = group.unitIds.flatMap((id) => byId.get(id) ?? [])
            const done = units.filter((u) => u.complete).length
            return (
              <li key={group.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-on-surface">{group.title}</span>
                  <span className="tabular-nums text-on-surface-variant">
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

      <section
        id="practice"
        aria-labelledby="practice-heading"
        className={cn(HASH_SCROLL_MARGIN, 'lg:border-t lg:border-outline-variant/60 lg:p-4 lg:dark:border-outline/40')}
      >
        <h2
          id="practice-heading"
          className="font-headline text-xl font-bold text-on-surface md:text-2xl lg:text-base"
        >
          Practise what you&apos;ve learned
        </h2>
        <p className="mb-3 mt-0.5 text-sm text-on-surface-variant">Short sessions across all {script.label.toLowerCase()}.</p>
        <PracticeModeList variant="compact" className="sm:grid-cols-3 lg:grid-cols-2" />
      </section>

      <nav aria-label="More in this course" className="hidden border-t border-outline-variant/60 p-2 dark:border-outline/40 lg:block">
        <ul>
          {QUICK_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={script.basePath + link.to}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:hover:bg-surface-container"
              >
                <span aria-hidden className="flex">
                  <Icon name={link.icon} className="text-xl text-on-surface-variant" />
                </span>
                <span className="flex-1">{link.label}</span>
                <span aria-hidden className="flex">
                  <Icon name="chevron_right" className="text-xl text-on-surface-variant" />
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
      <h2 className="mb-3 font-headline text-base font-bold text-on-surface">{title}</h2>
      {children}
    </section>
  )
}
