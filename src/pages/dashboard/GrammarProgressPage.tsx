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
import { useChapterProgress } from '@/hooks/useChapterProgress'
import type { GrammarChapterSummary } from '@/types/grammar'

const OPEN_LEVEL = 'n5'
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const
const PERCENT = 100

function chapterPath(level: string, id: number): string {
  return `/grammar/${level}/${id}`
}

function GrammarBody({ chapters }: { chapters: GrammarChapterSummary[] }) {
  // Kept on the server for signed-in learners; older on-device ticks otherwise.
  const progress = useChapterProgress(OPEN_LEVEL)
  const local = useMemo(() => readCompletedChapters(OPEN_LEVEL), [])
  const done = useMemo(
    () => (progress.enabled ? new Set([...progress.byChapter].filter(([, p]) => p.completed).map(([n]) => n)) : local),
    [progress.enabled, progress.byChapter, local],
  )
  const vocabPassed = [...progress.byChapter.values()].filter((p) => p.vocabPassed).length
  const doneCount = chapters.filter((c) => done.has(c.id)).length
  const next = chapters.find((c) => !done.has(c.id))
  const share = chapters.length > 0 ? doneCount / chapters.length : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile icon="task_alt" label="Chapters done" value={`${doneCount}/${chapters.length}`} hint="JLPT N5" />
        <StatTile icon="menu_book" label="N5 complete" value={`${Math.round(share * PERCENT)}%`} hint={`${chapters.length - doneCount} chapters left`} />
        <StatTile icon="translate" label="Vocab quizzes passed" value={`${vocabPassed}/${chapters.length}`} hint="Their words come back in reviews" />
        <StatTile icon="route" label="Up next" value={next ? `Ch. ${next.id}` : 'Done'} hint={next?.title ?? 'Every N5 chapter finished'} />
      </div>

      {next && (
        <Link
          to={chapterPath(OPEN_LEVEL, next.id)}
          className="flex items-center justify-between gap-4 rounded-md bg-primary/10 p-5 text-ink transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-primary">{doneCount === 0 ? 'Start here' : 'Continue'}</span>
            <span className="block font-display text-lg font-bold">
              Chapter {next.id} · {next.title}
            </span>
          </span>
          <Icon name="arrow_forward" className="text-2xl text-primary" />
        </Link>
      )}

      <Panel title="By JLPT level" description="Share of chapters complete.">
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
            const scores = progress.byChapter.get(c.id)
            return (
              <li key={c.id}>
                <Link
                  to={chapterPath(OPEN_LEVEL, c.id)}
                  className={cn(
                    'flex min-h-14 items-center gap-3 rounded-sm border px-3 py-2 text-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    complete ? 'border-success/50 bg-success/10' : 'border-line',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                      complete ? 'bg-success text-surface' : 'bg-surface-hover text-ink-muted',
                    )}
                  >
                    {complete ? <Icon name="check" className="text-base" /> : c.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{c.title}</span>
                    {(scores?.exerciseBest !== undefined || scores?.vocabBest !== undefined) && (
                      <span className="block text-xs text-ink-muted">
                        {[
                          scores.exerciseBest !== undefined && `Exercise ${scores.exerciseBest}%`,
                          scores.vocabBest !== undefined && `Vocab ${scores.vocabBest}%`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </span>
                  <span className="sr-only">{complete ? 'Complete' : 'Not complete'}</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </Panel>

      {!progress.enabled && (
        <p className="flex items-center gap-2 text-xs text-ink-muted">
          <Icon name="info" className="text-base" />
          Grammar progress is saved on this device until you sign in and verify your email.
        </p>
      )}
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
