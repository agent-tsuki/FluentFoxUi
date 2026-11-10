import { useState, type ReactNode } from 'react'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { PracticeShellBack } from '@/components/practice/PracticeShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CHAPTER_GRAMMAR_TRACK } from '@/lib/learn/paths'
import { ChapterQuiz } from './ChapterQuiz'

interface ChapterExerciseProps {
  chapterId: number
  /** Best score so far, 0–100. */
  best?: number
  isCompleted: boolean
  /** After an attempt is recorded (refresh the chapter's progress). */
  onRecorded?: (passed: boolean) => void
  /** The step's ContinueBar, shown before and after an attempt. */
  footer?: ReactNode
}

const EXERCISE_TYPES = [
  { icon: 'unfold_more', label: 'Choose the word' },
  { icon: 'translate', label: 'What it means' },
  { icon: 'checklist', label: 'True or false' },
  { icon: 'tune', label: 'Change the form' },
  { icon: 'edit_note', label: 'Word in a sentence' },
  { icon: 'visibility', label: 'Look at a picture' },
  { icon: 'swap_horiz', label: 'Put in order' },
  { icon: 'headphones', label: 'Listen and choose' },
  { icon: 'forum', label: 'Choose the reply' },
  { icon: 'menu_book', label: 'Read and answer' },
]

const PERCENT = 100

/**
 * A chapter's Exercise step: one session mixing 10 kinds of exercise, up to 20
 * questions chosen and marked by the server, shown together on one sheet.
 * Answers are sent when the sheet is checked; the best score is kept, and passing completes the chapter.
 */
export function ChapterExercise({ chapterId, best, isCompleted, onRecorded, footer }: ChapterExerciseProps) {
  const [running, setRunning] = useState(false)

  if (running) {
    return (
      <PracticeShellBack.Provider value="Back">
        <ChapterQuiz
          track={CHAPTER_GRAMMAR_TRACK}
          chapterSlug={`ch${chapterId}`}
          title={`Chapter ${chapterId} exercise`}
          onExit={() => setRunning(false)}
          onRecorded={onRecorded}
          sheet
        />
      </PracticeShellBack.Provider>
    )
  }

  return (
    <div className="grid gap-12">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Practise this chapter</h1>
        <p className="mt-1 max-w-reading text-body text-ink-muted">20 questions in 10 kinds of exercise, all on one page. Answer them in any order, then check them together. Passing completes the chapter.</p>

        <section aria-label="Chapter exercise" className="mt-6 rounded-lg bg-surface-raised p-5 shadow-elevation-1 sm:p-6">
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {EXERCISE_TYPES.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-body text-ink">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary-ink">
                  <Icon name={item.icon} className="text-xl" />
                </span>
                {item.label}
              </li>
            ))}
          </ul>

          {(best !== undefined || isCompleted) && (
            <div className="mt-5 grid gap-1.5 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-label text-ink">{best !== undefined ? `Your best: ${best}%` : 'Chapter complete'}</p>
                {isCompleted && <Badge tone="done">Passed</Badge>}
              </div>
              {best !== undefined && <ProgressBar value={best} max={PERCENT} label="Best exercise score" valueText={`${best}%`} tone={isCompleted ? 'success' : 'primary'} size="md" />}
            </div>
          )}

          <div className="mt-5">
            <LearnerOnly prompt="inline">
              <Button size="lg" onClick={() => setRunning(true)}>
                {best !== undefined ? 'Try again' : 'Start exercise'}
                <Icon name="arrow_forward" className="text-xl" />
              </Button>
            </LearnerOnly>
          </div>
        </section>
      </div>
      {footer}
    </div>
  )
}
