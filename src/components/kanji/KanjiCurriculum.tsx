import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { KanjiGroup } from '@/types/kanji'
import type { FinalTestResult } from '@/api/services/learningPathService'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusIcon } from '@/components/kanaCourse/StatusIcon'
import { ROW_LIST } from '@/components/kanaCourse/CurriculumGroup'
import { HASH_SCROLL_MARGIN } from '@/components/kanaCourse/courseUnits'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { kanjiLevelTestPath, kanjiSkipPath, kanjiUnitPath } from '@/lib/content/kanji/levels'
import type { KanjiLevelConfig } from '@/lib/content/kanji/courseTypes'
import { cn } from '@/lib/cn'
import { percent, type KanjiUnitView } from './kanjiUnits'

const QUIET_LINK =
  'inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

/**
 * KanjiCurriculumGroup — one themed group of a level's units: header with
 * "x of y done", a bar and a quiet "Test out" link, then the unit rows.
 * Same anatomy as the kana CurriculumGroup.
 */
interface KanjiCurriculumGroupProps {
  group: KanjiGroup
  units: KanjiUnitView[]
  nextId?: string
  highlightId?: string
}

export function KanjiCurriculumGroup({ group, units, nextId, highlightId }: KanjiCurriculumGroupProps) {
  const level = useKanjiLevel()
  const done = units.filter((u) => u.complete).length
  const allTestedOut = units.length > 0 && units.every((u) => u.state === 'skipped')
  const headingId = `group-${group.id}`

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 id={headingId} className="font-headline text-xl font-bold text-on-surface md:text-2xl">
              {group.title}
            </h2>
            <span className="text-sm tabular-nums text-on-surface-variant">
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
          <span className="inline-flex min-h-11 shrink-0 items-center gap-1 px-2 text-sm font-semibold text-on-surface-variant">
            <span aria-hidden className="flex">
              <Icon name="verified" filled className="text-base text-success" />
            </span>
            Tested out
          </span>
        ) : (
          <Link to={kanjiSkipPath(level.id, group.id)} aria-label={`Test out of ${group.title}`} className={cn(QUIET_LINK, '-mr-2')}>
            Test out
            <Icon name="chevron_right" className="text-lg" />
          </Link>
        )}
      </div>

      <ol aria-label={`${group.title} units`} className={ROW_LIST}>
        {units.map((view) => (
          <KanjiUnitRow key={view.unit.id} view={view} isNext={view.unit.id === nextId} highlighted={view.unit.id === highlightId} />
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
  highlighted: boolean
}

/** One unit row: a single link to the unit page, with its kanji and status (icon + text). */
const KanjiUnitRow = memo(function KanjiUnitRow({ view, isNext, highlighted }: KanjiUnitRowProps) {
  const level = useKanjiLevel()
  const { unit, number } = view

  return (
    <li>
      <Link
        id={`unit-${unit.id}`}
        to={kanjiUnitPath(level.id, unit.id)}
        className={cn(
          'group relative flex min-h-16 items-center gap-3 px-3 py-3 transition-colors duration-700 ease-out motion-reduce:transition-none sm:px-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
          HASH_SCROLL_MARGIN,
          isNext && 'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary',
          highlighted ? 'bg-primary/10' : 'hover:bg-surface-container-low',
        )}
      >
        <StatusIcon state={view.state} />
        <span className="w-5 shrink-0 text-sm tabular-nums text-on-surface-variant">
          <span className="sr-only">Unit </span>
          {number}
        </span>
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <span className="flex flex-wrap items-baseline gap-x-3 sm:min-w-0 sm:flex-1">
            <span className="font-bold text-on-surface sm:w-44 sm:shrink-0">{unit.title}</span>
            <span lang="ja" className="font-jp text-base tracking-wide text-on-surface-variant sm:text-lg">
              {unit.kanji.join('')}
            </span>
          </span>
          <span
            className={cn(
              'mt-0.5 block whitespace-nowrap text-xs tabular-nums sm:mt-0 sm:shrink-0 sm:text-right sm:text-sm',
              isNext ? 'font-semibold text-primary' : 'text-on-surface-variant',
            )}
          >
            {kanjiUnitStatusText(view, isNext)}
          </span>
        </span>
        <span aria-hidden className="flex shrink-0">
          <Icon name="chevron_right" className="text-xl text-on-surface-variant transition-transform motion-safe:group-hover:translate-x-0.5" />
        </span>
      </Link>
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
  const passed = Boolean(result?.passedAt)
  const status = passed && result ? `Passed · best ${percent(result.best)}` : result ? `Best ${percent(result.best)}` : 'Best —'

  return (
    <div className={ROW_LIST}>
      <Link
        to={kanjiLevelTestPath(level.id)}
        className="group flex min-h-16 items-center gap-3 px-3 py-3 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-4"
      >
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon name={passed ? 'workspace_premium' : 'emoji_events'} filled={passed} className={cn('text-2xl', passed ? 'text-success' : 'text-primary')} />
        </span>
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <span className="block min-w-0 sm:flex-1">
            <span className="block font-bold text-on-surface">{level.title} level test</span>
            <span className="block text-xs tabular-nums text-on-surface-variant sm:text-sm">{levelTestMeta(level, kanjiCount)}</span>
          </span>
          <span className={cn('mt-0.5 block whitespace-nowrap text-xs tabular-nums sm:mt-0 sm:text-sm', passed ? 'font-semibold text-on-surface' : 'text-on-surface-variant')}>
            {status}
          </span>
        </span>
        <span aria-hidden className="flex shrink-0">
          <Icon name="chevron_right" className="text-xl text-on-surface-variant transition-transform motion-safe:group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}
