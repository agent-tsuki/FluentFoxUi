import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import type { CourseUnitView } from './courseUnits'

interface ChartStudyPanelProps {
  basePath: string
  next?: CourseUnitView
  unitsDone: number
  unitsTotal: number
  masteredInView: number
  kanaInView: number
}

/**
 * The chart is a reference, but it should still point a learner toward the
 * next meaningful study action. This panel occupies the spare desktop column
 * without turning the chart itself into another dense control surface.
 */
export function ChartStudyPanel({
  basePath,
  next,
  unitsDone,
  unitsTotal,
  masteredInView,
  kanaInView,
}: ChartStudyPanelProps) {
  const courseFinished = !next
  const target = courseFinished ? `${basePath}/test` : `${basePath}/unit/${next.unit.id}`

  return (
    <aside
      aria-labelledby="chart-study-title"
      className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-5 dark:border-outline/60 dark:bg-surface-container lg:sticky lg:top-[calc(theme(spacing.nav)+theme(spacing.12)+theme(spacing.6))]"
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-primary">Your learning loop</p>
      <h2 id="chart-study-title" className="mt-1 font-headline text-xl font-bold text-on-surface">
        Chart → Learn
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Explore a sound here, then practise it in a short guided unit.
      </p>

      <ol className="mt-5 grid grid-cols-4 gap-1" aria-label="Kana course stages">
        {[
          { label: 'Chart', icon: 'grid_view', active: true },
          { label: 'Learn', icon: 'school' },
          { label: 'Check', icon: 'quiz' },
          { label: 'Print', icon: 'download' },
        ].map((stage) => (
          <li key={stage.label} className="min-w-0 text-center">
            <span
              aria-hidden
              className={`mx-auto flex size-8 items-center justify-center rounded-full ${stage.active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}
            >
              <Icon name={stage.icon} className="text-base" />
            </span>
            <span className={`mt-1 block text-[0.62rem] font-bold ${stage.active ? 'text-primary' : 'text-on-surface-variant'}`}>{stage.label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
          {courseFinished ? 'Ready for your milestone' : `Next in Learn · Unit ${next.number}`}
        </p>
        <p className="mt-1 font-headline text-lg font-bold text-on-surface">
          {courseFinished ? 'Take the final check' : next.unit.title}
        </p>
        {!courseFinished && (
          <p lang="ja" className="mt-0.5 font-jp text-lg text-on-surface-variant">
            {next.preview.text}{next.preview.truncated && '…'}
          </p>
        )}
        <ActionLink to={target} className="mt-4 w-full px-3 text-sm">
          {courseFinished ? 'Open final check' : 'Learn this row'}
          <Icon name="arrow_forward" className="text-lg" />
        </ActionLink>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-on-surface-variant">Units done</dt>
          <dd className="mt-0.5 font-bold tabular-nums text-on-surface">{unitsDone} / {unitsTotal}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">This view</dt>
          <dd className="mt-0.5 font-bold tabular-nums text-on-surface">{masteredInView} / {kanaInView} known</dd>
        </div>
      </dl>

      <Link
        to={`${basePath}/downloads`}
        className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Print a chart for review <Icon name="chevron_right" className="text-lg" />
      </Link>
    </aside>
  )
}
