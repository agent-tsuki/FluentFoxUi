import { memo, useMemo, useState } from 'react'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { PracticeShellBack, PracticeShellFill } from '@/components/practice/PracticeShell'
import { TestWorksheet } from '@/components/testCenter/TestWorksheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { useChapterContent } from '@/hooks/useChapterContent'
import { chapterPracticeSets, type PracticeGroup, type PracticeSet } from '@/lib/learn/chapterPractice'
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
  { id: 'Vocabulary', line: 'Know the words.' },
  { id: 'Confirm', line: 'Check you understood the grammar.' },
  { id: 'Construct', line: 'Make sentences yourself.' },
  { id: 'Review', line: 'A bit of everything.' },
]

const PracticeCard = memo(function PracticeCard({ set, onStart }: { set: PracticeSet; onStart: (set: PracticeSet) => void }) {
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
  const start = useMemo(() => (set: PracticeSet) => setRun({ set, questions: set.build(), count: set.sizes?.[0], attempt: 0 }), [])

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
    const again = (questions: TestQuestion[]) => setRun({ ...run, questions, attempt: run.attempt + 1 })
    return (
      <PracticeShellFill.Provider value={false}>
        <PracticeShellBack.Provider value="Back">
          <div className="py-4">
            <TestWorksheet
              key={run.attempt}
              title={`${run.set.title} · Chapter ${chapterId}`}
              questions={run.questions}
              onExit={() => setRun(null)}
              onRetryMissed={again}
              onAgain={() => again(run.set.build(undefined, run.count))}
              doneLabel="All exercises"
              wordBank={run.set.wordBank}
              sizes={run.set.sizes}
              count={run.count}
              onCount={(count) => setRun({ ...run, count, questions: run.set.build(undefined, count), attempt: run.attempt + 1 })}
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
      <p className="mt-1 max-w-prose text-sm text-on-surface-variant">Start with whichever you like; nothing is locked.</p>

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
                  <PracticeCard key={set.id} set={set} onStart={start} />
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
