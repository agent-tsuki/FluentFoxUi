import { lazy, memo, Suspense } from 'react'
import { Icon } from '@/components/ui/Icon'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { JaText } from '@/components/learn/JaText'
import { cn } from '@/lib/cn'
import { HASH_SCROLL_MARGIN, percent, type CourseUnitView } from './courseUnits'
import { StatusIcon } from './StatusIcon'
import { useUnitAccordion } from './unitAccordion'

// The steps load with the first opened row, not with the Learn page.
const UnitPanel = lazy(() => import('./UnitPanel').then((m) => ({ default: m.UnitPanel })))

/**
 * UnitRow — one unit in the Learn page's curriculum. The row is a button that
 * opens the unit's steps right under it (one row open at a time, kept in the
 * URL as `?unit=<id>`), and carries `id="unit-<id>"` for scrolling to it.
 * Status is icon + text, never colour alone; the "Up next" unit adds a 2 px
 * primary bar on its left edge.
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
  const accordion = useUnitAccordion()
  const open = accordion?.openId === unit.id
  const panelId = `unit-panel-${unit.id}`

  return (
    <li>
      <button
        type="button"
        id={`unit-${unit.id}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => accordion?.toggle(unit.id)}
        className={cn(
          'group relative flex min-h-16 w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-700 ease-out motion-reduce:transition-none sm:px-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
          HASH_SCROLL_MARGIN,
          isNext && 'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary',
          highlighted ? 'bg-primary/10' : open ? 'bg-surface-container-low' : 'hover:bg-surface-container-low',
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
            name="expand_more"
            className={cn('text-xl text-on-surface-variant transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
          />
        </span>
      </button>
      {open && accordion && (
        <div id={panelId} role="region" aria-labelledby={`unit-${unit.id}`} className="border-t border-outline-variant/40 bg-surface">
          <Suspense
            fallback={
              <LoadingState label="Loading the unit…" className="space-y-3 p-6">
                <SkeletonBlock className="h-6 w-40 rounded-xl" />
                <SkeletonBlock className="h-24 w-full rounded-2xl" />
              </LoadingState>
            }
          >
            <UnitPanel
              unit={unit}
              onStartQuiz={() => accordion.startQuiz(unit.id)}
              onStartPractice={(mode) => accordion.startPractice(unit.id, mode)}
            />
          </Suspense>
        </div>
      )}
    </li>
  )
})
