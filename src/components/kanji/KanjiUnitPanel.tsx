import { useMemo, type ReactNode } from 'react'
import type { KanjiUnit } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { downloadKanjiWorksheet, useKanjiLevelData, useKanjiPath } from '@/hooks/useKanji'
import { getKanjiPath, kanjiUnitSteps } from '@/api/services/kanjiProgressService'
import { kanjiUnitQuizPath } from '@/lib/content/kanji/levels'
import { Icon } from '@/components/ui/Icon'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { UnitStepTabs, type UnitTab } from '@/components/learn/UnitStepTabs'
import { KanjiLesson } from './KanjiLesson'
import { KanjiWriteStep } from './KanjiWriteStep'
import { KANJI_PRACTICE_MODES, type KanjiPracticeModeId } from './practiceModes'

type TabStep = 'learn' | 'write' | 'practise'

const STEPS: Record<TabStep, { title: string; icon: string; hint: string }> = {
  learn: { title: 'Learn', icon: 'school', hint: 'Meet each kanji: its meaning, the reading to learn first, a key word and its strokes.' },
  write: { title: 'Write', icon: 'gesture', hint: 'Trace each kanji, then write it with a faded guide, then from memory.' },
  practise: { title: 'Practise', icon: 'fitness_center', hint: 'Pick any mode. Each round only uses this unit’s kanji.' },
}

interface KanjiUnitPanelProps {
  unit: KanjiUnit
  /** 1-based position in the level (for the worksheet). */
  number: number
  /** Opens this unit's quiz popup. */
  onStartQuiz: () => void
  /** Opens one practice mode for this unit as a popup. */
  onStartPractice: (mode: KanjiPracticeModeId) => void
}

/**
 * KanjiUnitPanel — one kanji unit's steps under its row on the course page,
 * like the kana Learn page (UnitStepTabs): Learn / Write / Practise are small
 * tabs whose content swaps in place, opening on the first one not done yet,
 * or on Practise once the unit is finished. Passing the quiz finishes the
 * unit, and practice stays available after. Quiz opens as a popup, Download
 * PDF downloads the trace-and-write sheet, and practice modes open as popups.
 */
export function KanjiUnitPanel({ unit, number, onStartQuiz, onStartPractice }: KanjiUnitPanelProps) {
  const level = useKanjiLevel()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const entries = useMemo(() => (data ? unit.kanji.flatMap((c) => data.byChar.get(c) ?? []) : []), [data, unit.kanji])
  const progress = useKanjiPath(level.id).units[unit.id]
  const store = getKanjiPath(level.id)
  const done = kanjiUnitSteps(unit, progress)
  const skipped = Boolean(progress?.skippedAt)

  if (isLoading) {
    return (
      <LoadingState label="Loading the unit…" className="space-y-3 p-6">
        <SkeletonBlock className="h-6 w-40 rounded-md" />
        <SkeletonBlock className="h-24 w-full rounded-xl" />
      </LoadingState>
    )
  }
  if (error || !data) return <ErrorState message="We couldn't load this unit." onRetry={refetch} />

  const body: Record<TabStep, (goTo: (step: TabStep) => void) => ReactNode> = {
    learn: (goTo) => (
      <KanjiLesson entries={entries} batchSize={level.batchSize} onFinish={() => goTo('write')} onLearned={() => store.markTraced(unit.id)} />
    ),
    write: () => <KanjiWriteStep entries={entries} onComplete={() => store.markWritten(unit.id)} />,
    practise: () => (
      <LearnerOnly prompt="inline">
        <ul className="grid gap-2 sm:grid-cols-2">
          {KANJI_PRACTICE_MODES.map((mode) => (
            <li key={mode.id}>
              <button
                type="button"
                onClick={() => onStartPractice(mode.id)}
                className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-surface-raised shadow-elevation-1 px-3 py-2 text-left hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon name={mode.icon} className="text-xl text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{mode.title}</span>
                  <span className="block text-xs text-ink-muted">{mode.summary}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </LearnerOnly>
    ),
  }
  const order: TabStep[] = ['learn', 'write', 'practise']
  const tabs: UnitTab<TabStep>[] = order.map((step) => ({ id: step, ...STEPS[step], done: done[step], render: body[step] }))
  // A finished unit (quiz passed, tested out or every step done) opens on Practise; otherwise on the first step not done yet.
  const complete = done.quiz || skipped || (done.learn && done.write && done.practise && done.print)
  const initial: TabStep = complete ? 'practise' : (order.find((s) => !done[s]) ?? 'practise')

  return (
    <div className="space-y-4 px-3 pb-3 pt-3 sm:px-5">
      {skipped && (
        <p className="flex items-center gap-2 rounded-md bg-secondary-container px-3 py-2 text-sm text-on-secondary-container">
          <Icon name="verified" className="text-lg" />
          <span className="min-w-0 flex-1">You tested out of this unit.</span>
          <button
            type="button"
            onClick={() => store.undoSkip(unit.id)}
            className="min-h-10 rounded-sm px-2 font-bold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Undo
          </button>
        </p>
      )}
      <UnitStepTabs
        idPrefix={`kanji-${unit.id}`}
        label={`${unit.title} steps`}
        tabs={tabs}
        initial={initial}
        quiz={{ passed: done.quiz, best: progress?.quizBest, onStart: onStartQuiz, returnTo: kanjiUnitQuizPath(level.id, unit.id) }}
        pdf={{
          done: done.print,
          onDownload: async () => {
            await downloadKanjiWorksheet({ levelTitle: level.title, pdfSlug: level.pdfSlug, unit, unitNumber: number, entries })
            store.markPrinted(unit.id)
            return true
          },
        }}
      />
    </div>
  )
}
