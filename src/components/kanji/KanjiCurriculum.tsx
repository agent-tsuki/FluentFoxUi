import { lazy, memo, Suspense } from 'react'
import { Link } from 'react-router-dom'
import type { KanjiGroup } from '@/types/kanji'
import type { FinalTestResult } from '@/api/services/learningPathService'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusIcon } from '@/components/kanaCourse/StatusIcon'
import { ROW_LIST } from '@/components/kanaCourse/CurriculumGroup'
import { HASH_SCROLL_MARGIN } from '@/components/kanaCourse/courseUnits'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { useUnitAccordion } from '@/components/kanaCourse/unitAccordion'
import type { KanjiLevelConfig } from '@/lib/content/kanji/courseTypes'
import { cn } from '@/lib/cn'
import { percent, type KanjiUnitView } from './kanjiUnits'
import { useKanjiOverlayLink } from './kanjiOverlays'

// The steps load with the first opened row, not with the course page.
const KanjiUnitPanel = lazy(() => import('./KanjiUnitPanel').then((m) => ({ default: m.KanjiUnitPanel })))

const QUIET_LINK =
  'inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-md px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

/**
 * KanjiCurriculumGroup — one themed group of a level's units: header with
 * "x of y done", a bar and a quiet "Test out" link, then the unit rows.
 * Same anatomy as the kana CurriculumGroup.
 */
interface KanjiCurriculumGroupProps {
  group: KanjiGroup
  units: KanjiUnitView[]
  nextId?: string
}

export function KanjiCurriculumGroup({ group, units, nextId }: KanjiCurriculumGroupProps) {
  const overlayLink = useKanjiOverlayLink()
  const done = units.filter((u) => u.complete).length
  const allTestedOut = units.length > 0 && units.every((u) => u.state === 'skipped')
  const headingId = `group-${group.id}`

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 id={headingId} className="font-display text-xl font-bold text-ink md:text-2xl">
              {group.title}
            </h2>
            <span className="text-sm tabular-nums text-ink-muted">
              {done} of {units.length} done
            </span>
          </div>
          <ProgressBar
            value={done}
            max={units.length}
            label={`${group.title} units done`}
            valueText={`${done} of ${units.length} units done`}
            tone={done === units.length ? 'success' : 'primary'}
            className="mt-2 max-w-60"
          />
        </div>
        {allTestedOut ? (
          <span className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-sm font-semibold text-ink-muted">
            <span aria-hidden className="flex">
              <Icon name="verified" filled className="text-base text-success" />
            </span>
            Tested out
          </span>
        ) : (
          <Link to={overlayLink({ skip: group.id })} aria-label={`Test out of ${group.title}`} className={cn(QUIET_LINK, '-mr-2')}>
            Test out
            <Icon name="chevron_right" className="text-lg" />
          </Link>
        )}
      </div>

      <ol aria-label={`${group.title} units`} className={ROW_LIST}>
        {units.map((view) => (
          <KanjiUnitRow key={view.unit.id} view={view} isNext={view.unit.id === nextId} />
        ))}
      </ol>
    </section>
  )
}

export function kanjiUnitStatusText(view: KanjiUnitView, isNext: boolean): string {
  const steps = `${view.completed} of ${view.total} steps`
  switch (view.state) {
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

interface KanjiUnitRowProps {
  view: KanjiUnitView
  isNext: boolean
}

/**
 * One unit row: a button that opens the unit's steps right under it (one row
 * open at a time, kept in the URL as `?unit=<id>`), like the kana Learn page.
 * Carries `id="unit-<id>"` for scrolling to it; status is icon + text.
 */
const KanjiUnitRow = memo(function KanjiUnitRow({ view, isNext }: KanjiUnitRowProps) {
  const { unit, number } = view
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
          'group relative flex min-h-16 w-full items-center gap-3 px-3 py-3 text-left transition-colors sm:px-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
          HASH_SCROLL_MARGIN,
          open ? 'bg-surface-sunken' : 'hover:bg-surface-hover',
        )}
      >
        <StatusIcon state={view.state} />
        <span className="w-5 shrink-0 text-sm tabular-nums text-ink-muted">
          <span className="sr-only">Unit </span>
          {number}
        </span>
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <span className="flex flex-wrap items-baseline gap-x-3 sm:min-w-0 sm:flex-1">
            <span className="font-bold text-ink sm:w-44 sm:shrink-0">{unit.title}</span>
            <span lang="ja" className="font-ja text-base tracking-wide text-ink-muted sm:text-lg">
              {unit.kanji.join('')}
            </span>
          </span>
          <span
            className={cn(
              'mt-0.5 block whitespace-nowrap text-xs tabular-nums sm:mt-0 sm:shrink-0 sm:text-right sm:text-sm',
              isNext ? 'font-semibold text-primary' : 'text-ink-muted',
            )}
          >
            {kanjiUnitStatusText(view, isNext)}
          </span>
        </span>
        <span aria-hidden className="flex shrink-0">
          <Icon
            name="expand_more"
            className={cn('text-xl text-ink-muted transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
          />
        </span>
      </button>
      {open && accordion && (
        <div id={panelId} role="region" aria-labelledby={`unit-${unit.id}`} className="border-t border-line bg-surface">
          <Suspense
            fallback={
              <LoadingState label="Loading the unit…" className="space-y-3 p-6">
                <SkeletonBlock className="h-6 w-40 rounded-md" />
                <SkeletonBlock className="h-24 w-full rounded-xl" />
              </LoadingState>
            }
          >
            <KanjiUnitPanel
              unit={unit}
              number={number}
              onStartQuiz={() => accordion.startQuiz(unit.id)}
              onStartPractice={(mode) => accordion.startPractice(unit.id, mode)}
            />
          </Suspense>
        </div>
      )}
    </li>
  )
})

/** "All 79 kanji · 15 min · 80% to pass" */
export function levelTestMeta(level: KanjiLevelConfig, kanjiCount: number): string {
  const { minutes, passMark, questions } = level.levelTest
  return `${questions} questions from all ${kanjiCount} kanji · ${minutes} min · ${Math.round(passMark * 100)}% to pass`
}

/** The last curriculum row: the level test (never locked). */
export function KanjiLevelTestRow({ result, kanjiCount }: { result?: FinalTestResult; kanjiCount: number }) {
  const level = useKanjiLevel()
  const overlayLink = useKanjiOverlayLink()
  const passed = Boolean(result?.passedAt)
  const status = passed && result ? `Passed · best ${percent(result.best)}` : result ? `Best ${percent(result.best)}` : 'Best —'

  return (
    <div className={ROW_LIST}>
      <Link
        to={overlayLink({ test: 'level' })}
        className="group flex min-h-16 items-center gap-3 px-3 py-3 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-4"
      >
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon name={passed ? 'workspace_premium' : 'emoji_events'} filled={passed} className={cn('text-2xl', passed ? 'text-success' : 'text-primary')} />
        </span>
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <span className="block min-w-0 sm:flex-1">
            <span className="block font-bold text-ink">{level.title} level test</span>
            <span className="block text-xs tabular-nums text-ink-muted sm:text-sm">{levelTestMeta(level, kanjiCount)}</span>
          </span>
          <span className={cn('mt-0.5 block whitespace-nowrap text-xs tabular-nums sm:mt-0 sm:text-sm', passed ? 'font-semibold text-ink' : 'text-ink-muted')}>
            {status}
          </span>
        </span>
        <span aria-hidden className="flex shrink-0">
          <Icon name="chevron_right" className="text-xl text-ink-muted transition-transform motion-safe:group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}
