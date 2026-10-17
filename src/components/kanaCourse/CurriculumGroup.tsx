import { Link } from 'react-router-dom'
import type { FinalTestResult } from '@/api/services/learningPathService'
import type { KanaGroup } from '@/lib/content/kana/courseTypes'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import { useKanaScript } from '@/context/KanaScriptContext'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'
import { percent, type CourseUnitView } from './courseUnits'
import { UnitRow } from './UnitRow'

/** The divided list surface shared by the unit lists and the final-test row. */
export const ROW_LIST =
  'divide-y divide-outline-variant/60 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest dark:divide-outline/40 dark:border-outline/60 dark:bg-surface-container-low'

const QUIET_LINK =
  'inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

/**
 * CurriculumGroup — one group of the Course curriculum (Basic 46, Dakuten,
 * Combinations, Foreign sounds): a header with "x of y done", a bar and a quiet "Test out"
 * link, then its units as divided rows.
 */
interface CurriculumGroupProps {
  group: KanaGroup
  units: CourseUnitView[]
  nextId?: string
  highlightId?: string
  className?: string
}

export function CurriculumGroup({ group, units, nextId, highlightId, className }: CurriculumGroupProps) {
  const done = units.filter((u) => u.complete).length
  const allTestedOut = units.length > 0 && units.every((u) => u.status.state === 'skipped')
  const headingId = `group-${group.id}`
  const { basePath } = useKanaScript()

  return (
    <section aria-labelledby={headingId} className={className}>
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
          <Link
            to={`${basePath}/skip/${group.id}`}
            aria-label={`Test out of ${group.title}`}
            className={cn(QUIET_LINK, '-mr-2')}
          >
            Test out
            <Icon name="chevron_right" className="text-lg" />
          </Link>
        )}
      </div>

      <ol aria-label={`${group.title} units`} className={ROW_LIST}>
        {units.map((view) => (
          <UnitRow
            key={view.unit.id}
            view={view}
            isNext={view.unit.id === nextId}
            highlighted={view.unit.id === highlightId}
          />
        ))}
      </ol>
    </section>
  )
}

/** Final-test facts shown on the Course page, e.g. "All 104 hiragana · 14 min · 80 % to pass". */
export function finalTestMeta(script: KanaScriptConfig, kanaCount: number): string {
  const { minutes, passMark } = script.finalTest
  return `All ${kanaCount} ${script.label.toLowerCase()} · ${minutes} min · ${Math.round(passMark * 100)} % to pass`
}

/**
 * FinalTestRow — the last row of the curriculum: one link to the final test.
 * Never locked; shows the best score once taken.
 */
export function FinalTestRow({ result, kanaCount }: { result?: FinalTestResult; kanaCount: number }) {
  const script = useKanaScript()
  const passed = Boolean(result?.passedAt)
  const status = passed && result ? `Passed · best ${percent(result.best)}` : result ? `Best ${percent(result.best)}` : 'Best —'

  return (
    <div className={ROW_LIST}>
      <Link
        to={`${script.basePath}/test`}
        className="group flex min-h-16 items-center gap-3 px-3 py-3 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-4"
      >
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon
            name={passed ? 'workspace_premium' : 'emoji_events'}
            filled={passed}
            className={cn('text-2xl', passed ? 'text-success' : 'text-primary')}
          />
        </span>
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
          <span className="block min-w-0 sm:flex-1">
            <span className="block font-bold text-on-surface">Final test</span>
            <span className="block text-xs tabular-nums text-on-surface-variant sm:text-sm">
              {finalTestMeta(script, kanaCount)}
            </span>
          </span>
          <span
            className={cn(
              'mt-0.5 flex items-center gap-1 whitespace-nowrap text-xs tabular-nums sm:mt-0 sm:text-sm',
              passed ? 'font-semibold text-on-surface' : 'text-on-surface-variant',
            )}
          >
            {passed && (
              <span aria-hidden className="flex">
                <Icon name="check_circle" filled className="text-base text-success" />
              </span>
            )}
            {status}
          </span>
        </span>
        <span aria-hidden className="flex shrink-0">
          <Icon
            name="chevron_right"
            className="text-xl text-on-surface-variant transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </div>
  )
}
