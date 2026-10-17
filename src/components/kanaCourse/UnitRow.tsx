import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { JaText } from '@/components/learn/JaText'
import { cn } from '@/lib/cn'
import { useKanaScript } from '@/context/KanaScriptContext'
import { HASH_SCROLL_MARGIN, percent, type CourseUnitView } from './courseUnits'
import { StatusIcon } from './StatusIcon'

/**
 * UnitRow — one unit in the Course curriculum list. The whole row is a single
 * link to the unit page and carries `id="unit-<id>"` so the unit page's back
 * link (`#unit-<id>`) can scroll to it. Status is icon + text, never colour
 * alone; the "Up next" unit adds a 2 px primary bar on its left edge.
 */
interface UnitRowProps {
  view: CourseUnitView
  isNext: boolean
  /** Briefly tinted after arriving via `#unit-<id>`. */
  highlighted: boolean
}

export function unitStatusText(view: CourseUnitView, isNext: boolean): string {
  const { state, completed, total } = view.status
  const steps = `${completed} of ${total} steps`
  switch (state) {
    case 'done':
      return view.quizBest !== undefined ? `Done · Quiz ${percent(view.quizBest)}` : 'Done'
    case 'skipped':
      return 'Tested out'
    case 'in-progress':
      return isNext ? `Up next · ${steps}` : `In progress · ${steps}`
    default:
      return isNext ? 'Up next' : 'Not started'
  }
}

export const UnitRow = memo(function UnitRow({ view, isNext, highlighted }: UnitRowProps) {
  const { unit, number, preview, status } = view
  const { basePath } = useKanaScript()

  return (
    <li>
      <Link
        id={`unit-${unit.id}`}
        to={`${basePath}/unit/${unit.id}`}
        className={cn(
          'group relative flex min-h-16 items-center gap-3 px-3 py-3 transition-colors duration-700 ease-out motion-reduce:transition-none sm:px-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
          HASH_SCROLL_MARGIN,
          isNext && 'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary',
          highlighted ? 'bg-primary/10' : 'hover:bg-surface-container-low',
        )}
      >
        <StatusIcon state={status.state} />
        <span className="w-5 shrink-0 text-sm tabular-nums text-on-surface-variant">
          <span className="sr-only">Unit </span>
          {number}
        </span>

        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <span className="flex flex-wrap items-baseline gap-x-3 sm:min-w-0 sm:flex-1 sm:flex-nowrap">
            <span className="font-bold text-on-surface sm:w-48 sm:shrink-0 lg:w-40 xl:w-48">
              <JaText text={unit.title} />
            </span>
            <span lang="ja" className="whitespace-nowrap font-jp text-base text-on-surface-variant sm:text-lg lg:text-base xl:text-lg">
              {preview.text}
              {preview.truncated && <span aria-hidden>…</span>}
            </span>
          </span>
          <span
            className={cn(
              'mt-0.5 block whitespace-nowrap text-xs tabular-nums sm:mt-0 sm:shrink-0 sm:text-right sm:text-sm',
              isNext ? 'font-semibold text-primary' : 'text-on-surface-variant',
            )}
          >
            {unitStatusText(view, isNext)}
          </span>
        </span>

        <span aria-hidden className="flex shrink-0">
          <Icon
            name="chevron_right"
            className="text-xl text-on-surface-variant transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </li>
  )
})
