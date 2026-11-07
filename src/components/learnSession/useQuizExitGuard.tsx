import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface QuizExitGuardOptions {
  /** The test session; a new one (a retake) starts over. */
  sessionId: string | undefined
  questionCount: number
  answered: number
  /** Every question answered. */
  done: boolean
  /** Completes the session on the API (useLearnTest's submit). */
  submit: (questionCount: number) => void
  onExit: () => void
  /** True while questions are being answered: the popup around the quiz then can't be dismissed. */
  onRunningChange?: (running: boolean) => void
}

export interface QuizExitGuard {
  /** Answered to the end, or left part way: show the result. */
  finished: boolean
  /** Left part way (the result says so). */
  quit: boolean
  /** The "Leave the quiz?" prompt is showing: pause the quiz's keys. */
  leaving: boolean
  /** For the quiz's ✕: asks first once something is answered, otherwise just leaves. */
  requestExit: () => void
  /** The prompt to render over the quiz (null when not asking). */
  prompt: ReactNode
}

/**
 * Keeps a graded quiz from being dropped whenever it goes badly. Leaving part
 * way asks first, then completes the attempt as it is (unanswered questions
 * count as wrong; the best score is kept). Reloading or closing the tab warns
 * first, and the API scores an attempt left that way when the next one
 * starts. Before any answer there is nothing to score, so ✕ just leaves.
 * Shared by the kana and kanji unit quizzes.
 */
export function useQuizExitGuard({
  sessionId,
  questionCount,
  answered,
  done,
  submit,
  onExit,
  onRunningChange,
}: QuizExitGuardOptions): QuizExitGuard {
  const [leaving, setLeaving] = useState(false)
  const [quit, setQuit] = useState(false)
  const finished = done || quit
  const running = Boolean(sessionId) && questionCount > 0 && !finished

  useEffect(() => {
    if (finished) submit(questionCount)
  }, [finished, questionCount, submit])

  // A retake starts over.
  useEffect(() => {
    setQuit(false)
    setLeaving(false)
  }, [sessionId])

  useEffect(() => {
    onRunningChange?.(running)
  }, [running, onRunningChange])
  useEffect(() => () => onRunningChange?.(false), [onRunningChange])

  useEffect(() => {
    if (!running || answered === 0) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [running, answered])

  const requestExit = useCallback(() => (running && answered > 0 ? setLeaving(true) : onExit()), [running, answered, onExit])

  const prompt = leaving ? (
    <LeaveQuizPrompt
      answered={answered}
      total={questionCount}
      onStay={() => setLeaving(false)}
      onLeave={() => {
        setLeaving(false)
        setQuit(true)
      }}
    />
  ) : null

  return { finished, quit, leaving, requestExit, prompt }
}

interface LeaveQuizPromptProps {
  answered: number
  total: number
  onStay: () => void
  onLeave: () => void
}

/** Asks before leaving a quiz part way, over the quiz inside its popup. */
function LeaveQuizPrompt({ answered, total, onStay, onLeave }: LeaveQuizPromptProps) {
  const titleId = useId()
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/85 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.stopPropagation()
          onStay()
        }}
        className="w-full max-w-sm rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-elevation-3"
      >
        <h2 id={titleId} className="font-headline text-lg font-bold text-on-surface">
          Leave the quiz?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          You’ve answered {answered} of {total}. Leaving now scores this attempt as it is, with the unanswered questions
          counted as wrong. Your best score stays.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button autoFocus onClick={onStay} className="min-h-11">
            Keep going
          </Button>
          <Button variant="outline" onClick={onLeave} className="min-h-11">
            Leave and score it
          </Button>
        </div>
      </div>
    </div>
  )
}
