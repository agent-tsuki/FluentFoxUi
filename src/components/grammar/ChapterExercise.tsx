import { memo, useCallback, useMemo, useState } from 'react'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { PracticeShellBack, PracticeShellFill } from '@/components/practice/PracticeShell'
import { TestWorksheet } from '@/components/testCenter/TestWorksheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useChapterContent } from '@/hooks/useChapterContent'
import { chapterPracticeSets, type PracticeGroup, type PracticeSet } from '@/lib/learn/chapterPractice'
import { exerciseKey, isMastered, loadExerciseBests, saveExerciseBests, withAttempt, type ExerciseBests } from '@/lib/learn/exerciseMastery'
import { CHAPTER_GRAMMAR_TRACK } from '@/lib/learn/paths'
import type { TestQuestion } from '@/lib/testCenter/types'
import { ChapterQuiz } from './ChapterQuiz'

interface ChapterExerciseProps {
  level: string
  chapterId: number
  /** Best score so far, 0–100. */
  best?: number
  /** After an attempt is recorded (refresh the chapter's progress). */
  onRecorded?: () => void
}

const GROUPS: { id: PracticeGroup; line: string }[] = [
  { id: 'Vocabulary', line: 'Know the words: recognise them, read them, recall them, use them.' },
  { id: 'Grammar', line: 'Check you understood the grammar, then fix and recall it.' },
  { id: 'Listening', line: 'From a single word to writing what you hear.' },
  { id: 'Build sentences', line: 'Make sentences yourself.' },
  { id: 'Review', line: 'A bit of everything.' },
]

function BestLabel({ best }: { best?: number }) {
  if (best === undefined) return null
  if (isMastered(best)) {
    return (
      <span className="flex shrink-0 items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-on-surface">
        <Icon name="check_circle" filled className="text-sm text-success" />
        Mastered
      </span>
    )
  }
  return <span className="shrink-0 text-xs font-semibold tabular-nums text-on-surface-variant">Best {Math.round(best * 100)}%</span>
}

const PracticeCard = memo(function PracticeCard({ set, best, onStart }: { set: PracticeSet; best?: number; onStart: (set: PracticeSet) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onStart(set)}
        className="group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-3 text-left transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-outline/60 dark:bg-surface-container-low"
      >
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon name={set.icon} className="text-xl" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-on-surface">{set.title}</span>
          <span className="block text-xs text-on-surface-variant">{set.summary}</span>
        </span>
        <BestLabel best={best} />
        <Icon name="arrow_forward" className="shrink-0 text-lg text-on-surface-variant transition-colors group-hover:text-primary" />
      </button>
    </li>
  )
})

interface Run {
  set: PracticeSet
  questions: TestQuestion[]
  /** The size chosen for exercises that offer one. */
  count?: number
  /** Remounts the worksheet for each new attempt. */
  attempt: number
  /** A whole exercise, not just the missed questions: only these count towards a best score. */
  full: boolean
}

/**
 * A chapter's Exercise tab: every exercise can be started directly, in any
 * order, and none is locked behind another. Each lists all its questions on
 * one page, checked together. These run in the browser and aren't saved. The chapter test at the end is the one the server marks: its
 * answers are saved, its sentences join reviews, and passing can complete the
 * chapter (Settings → Learning).
 */
export function ChapterExercise({ level, chapterId, best, onRecorded }: ChapterExerciseProps) {
  const content = useChapterContent(level, chapterId)
  const sets = useMemo(() => (content.data ? chapterPracticeSets(content.data) : []), [content.data])
  const [run, setRun] = useState<Run | null>(null)
  const [testing, setTesting] = useState(false)
  const start = useMemo(() => (set: PracticeSet) => setRun({ set, questions: set.build(), count: set.sizes?.[0], attempt: 0, full: true }), [])
  const [bests, setBests] = useState<ExerciseBests>(loadExerciseBests)
  const bestOf = useCallback((set: PracticeSet) => bests[exerciseKey(level, chapterId, set.id)], [bests, level, chapterId])
  const record = useCallback(
    (set: PracticeSet, right: number, total: number) =>
      setBests((old) => {
        const next = withAttempt(old, exerciseKey(level, chapterId, set.id), right, total)
        if (next !== old) saveExerciseBests(next)
        return next
      }),
    [level, chapterId],
  )
  const mastered = sets.filter((set) => isMastered(bestOf(set))).length

  if (testing) {
    return (
      <PracticeShellBack.Provider value="Back">
        <ChapterQuiz
          track={CHAPTER_GRAMMAR_TRACK}
          chapterSlug={`ch${chapterId}`}
          title={`Chapter ${chapterId} test`}
          onExit={() => setTesting(false)}
          onRecorded={onRecorded}
        />
      </PracticeShellBack.Provider>
    )
  }

  if (run) {
    const again = (questions: TestQuestion[], full: boolean) => setRun({ ...run, questions, full, attempt: run.attempt + 1 })
    return (
      <PracticeShellFill.Provider value={false}>
        <PracticeShellBack.Provider value="Back">
          <div className="py-4">
            <TestWorksheet
              key={run.attempt}
              title={`${run.set.title} · Chapter ${chapterId}`}
              questions={run.questions}
              onExit={() => setRun(null)}
              onRetryMissed={(missed) => again(missed, false)}
              onAgain={() => again(run.set.build(undefined, run.count), true)}
              onChecked={(right, total) => run.full && record(run.set, right, total)}
              doneLabel="All exercises"
              wordBank={run.set.wordBank}
              sizes={run.set.sizes}
              count={run.count}
              onCount={(count) => setRun({ ...run, count, full: true, questions: run.set.build(undefined, count), attempt: run.attempt + 1 })}
            />
          </div>
        </PracticeShellBack.Provider>
      </PracticeShellFill.Provider>
    )
  }

  if (content.isLoading || (!content.data && !content.error)) return <LoadingState label="Loading exercises…" className="px-6 py-8 xl:px-10" />
  if (content.error) {
    return (
      <div className="px-6 py-10 xl:px-10">
        <ErrorState message="We couldn't load these exercises." onRetry={content.refetch} />
      </div>
    )
  }
  if (sets.length === 0) {
    return (
      <div className="px-6 py-10 xl:px-10">
        <EmptyState icon="checklist" title="No exercises here yet" description="Exercises for this chapter are being added." />
      </div>
    )
  }

  return (
    <div className="px-6 pb-4 pt-8 xl:px-10">
      <h1 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">Practise this chapter</h1>
      <p className="mt-1 max-w-prose text-sm text-on-surface-variant">
        {sets.length} ways to practise this chapter. Start with whichever you like; nothing is locked. Score 90% or more on an exercise to master it.
      </p>
      <div className="mt-4 max-w-sm">
        <p className="mb-1.5 flex justify-between text-xs font-semibold text-on-surface-variant">
          <span>{mastered} of {sets.length} mastered</span>
          <span className="tabular-nums">{Math.round((mastered / sets.length) * 100)}%</span>
        </p>
        <ProgressBar value={mastered} max={sets.length} label="Exercises mastered" valueText={`${mastered} of ${sets.length} exercises mastered`} tone={mastered === sets.length ? 'success' : 'primary'} />
      </div>

      <div className="mt-6 space-y-7">
        {GROUPS.map((group) => {
          const inGroup = sets.filter((s) => s.group === group.id)
          if (inGroup.length === 0) return null
          return (
            <section key={group.id} aria-labelledby={`practice-${group.id}`}>
              <h2 id={`practice-${group.id}`} className="font-headline text-lg font-bold text-on-surface">
                {group.id}
              </h2>
              <p className="text-sm text-on-surface-variant">{group.line}</p>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
                {inGroup.map((set) => (
                  <PracticeCard key={set.id} set={set} best={bestOf(set)} onStart={start} />
                ))}
              </ul>
            </section>
          )
        })}

        <section aria-labelledby="practice-test" className="rounded-2xl bg-surface-container-low p-4 sm:p-5">
          <h2 id="practice-test" className="font-headline text-lg font-bold text-on-surface">
            Chapter test
          </h2>
          <p className="mt-0.5 max-w-prose text-sm text-on-surface-variant">
            Your answers are saved, the sentences join your reviews, and passing can complete the chapter.
            {best !== undefined && ` Your best so far: ${best}%.`}
          </p>
          <div className="mt-3">
            <LearnerOnly prompt="inline">
              <Button onClick={() => setTesting(true)} className="flex min-h-11 items-center gap-2 !px-4 !py-2 text-sm">
                {level.toLowerCase() === 'n5' && best !== undefined ? 'Try again' : 'Start the test'}
                <Icon name="arrow_forward" className="text-lg" />
              </Button>
            </LearnerOnly>
          </div>
        </section>
      </div>
    </div>
  )
}
