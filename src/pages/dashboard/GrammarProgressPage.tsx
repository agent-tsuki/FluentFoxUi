import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGrammarChapters } from '@/hooks/useGrammarChapters'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { BarList } from '@/components/charts/BarList'
import { AsyncBlock, DashboardPageHeader, Panel, StatTile } from '@/components/dashboard/DashboardBits'
import { LOCKED_GRAMMAR_LEVELS } from '@/components/grammar/LevelSwitcher'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { readCompletedChapters } from '@/lib/grammar/completion'
import type { GrammarChapterSummary } from '@/types/grammar'

const OPEN_LEVEL = 'n5'
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const
const PERCENT = 100

function chapterPath(level: string, id: number): string {
  return `/grammar/${level}/${id}`
}

function GrammarBody({ chapters }: { chapters: GrammarChapterSummary[] }) {
  const done = useMemo(() => readCompletedChapters(OPEN_LEVEL), [])
  const doneCount = chapters.filter((c) => done.has(c.id)).length
  const next = chapters.find((c) => !done.has(c.id))
  const share = chapters.length > 0 ? doneCount / chapters.length : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile icon="task_alt" label="Chapters done" value={`${doneCount}/${chapters.length}`} hint="JLPT N5" />
        <StatTile icon="menu_book" label="N5 complete" value={`${Math.round(share * PERCENT)}%`} hint={`${chapters.length - doneCount} chapters left`} />
        <StatTile icon="lock_open" label="Levels open" value={`${LEVELS.length - LOCKED_GRAMMAR_LEVELS.size}/${LEVELS.length}`} hint="N4 to N1 are on the way" />
        <StatTile icon="route" label="Up next" value={next ? `Ch. ${next.id}` : 'Done'} hint={next?.title ?? 'Every N5 chapter finished'} />
      </div>

      {next && (
        <Link
          to={chapterPath(OPEN_LEVEL, next.id)}
          className="flex items-center justify-between gap-4 rounded-xl bg-primary/10 p-5 text-on-surface transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-widest text-primary">{doneCount === 0 ? 'Start here' : 'Continue'}</span>
            <span className="block font-headline text-lg font-bold">
              Chapter {next.id} · {next.title}
            </span>
          </span>
          <Icon name="arrow_forward" className="text-2xl text-primary" />
        </Link>
      )}

      <Panel title="By JLPT level" description="Share of chapters you have marked complete.">
        <BarList
          label="Grammar chapters complete by level"
          rows={LEVELS.map((level) => {
            const locked = LOCKED_GRAMMAR_LEVELS.has(level)
            return {
              key: level,
              label: level.toUpperCase(),
              share: locked ? null : share,
              display: locked ? 'Coming soon' : `${doneCount}/${chapters.length}`,
              fill: 'bg-chart-1',
            }
          })}
        />
      </Panel>

      <Panel title="N5 chapters" description="Tap a chapter to open it. Ticked ones are marked complete.">
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
          {chapters.map((c) => {
            const complete = done.has(c.id)
            return (
              <li key={c.id}>
                <Link
                  to={chapterPath(OPEN_LEVEL, c.id)}
                  className={cn(
                    'flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    complete ? 'border-success/50 bg-success/10' : 'border-outline-variant/60',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                      complete ? 'bg-success text-surface' : 'bg-surface-container-high text-on-surface-variant',
                    )}
                  >
                    {complete ? <Icon name="check" className="text-base" /> : c.id}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold text-on-surface">{c.title}</span>
                  <span className="sr-only">{complete ? 'Complete' : 'Not complete'}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </Panel>

      <p className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Icon name="info" className="text-base" />
        Grammar progress is saved on this device, so it may differ on your other devices.
      </p>
    </div>
  )
}

/** /dashboard/grammar: chapter progress by JLPT level. */
export function GrammarProgressPage() {
  useDashboardTitle('Grammar')
  const chapters = useGrammarChapters(OPEN_LEVEL)
  return (
    <div className="space-y-8">
      <DashboardPageHeader eyebrow="Grammar" title="Grammar chapters" description="How far you are through each JLPT level, and where to pick up next." />
      <AsyncBlock state={chapters} what="the grammar chapters" skeletonClassName="h-96">
        {(list) => <GrammarBody chapters={list} />}
      </AsyncBlock>
    </div>
  )
}
