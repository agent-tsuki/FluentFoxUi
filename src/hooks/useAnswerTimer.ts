import { useEffect, useMemo, useRef } from 'react'
import { AnswerTimer, type AnswerDetails } from '@/lib/learn/answerTimer'
import type { AnswerRequestItem } from '@/types/learn'

export interface AnswerTimerControls {
  /** First keystroke, tap or tile move. */
  markInput: () => void
  /** Wrap speech playback: `audioStart()` before `speak`, `audioStop()` in `onend` / `onerror`. */
  audioStart: () => void
  audioStop: () => void
  /** One submitted try (the final answer included). */
  attempt: () => void
  hint: () => void
  reveal: () => void
  /** Restart timing for the same question key (e.g. a requeued card shown again). */
  restart: () => void
  /** The answer payload for the answer queue. Same question → same `client_event_id`. */
  buildAnswer: (details: AnswerDetails) => AnswerRequestItem
}

function isDocumentHidden(): boolean {
  return typeof document !== 'undefined' && document.hidden
}

/**
 * Timing and effort signals for one question at a time. Timing restarts
 * whenever `questionKey` changes (use the card id plus its position in the
 * session). Hidden-tab time is tracked as idle via the Page Visibility API.
 * The returned controls are stable and never cause a re-render.
 */
export function useAnswerTimer(questionKey: string | number): AnswerTimerControls {
  const timerRef = useRef<AnswerTimer | null>(null)
  if (timerRef.current === null) timerRef.current = new AnswerTimer()
  const timer = timerRef.current

  useEffect(() => {
    timer.start(isDocumentHidden())
  }, [timer, questionKey])

  useEffect(() => {
    const onVisibility = () => timer.setHidden(isDocumentHidden())
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [timer])

  return useMemo(
    () => ({
      markInput: () => timer.markInput(),
      audioStart: () => timer.audioStart(),
      audioStop: () => timer.audioStop(),
      attempt: () => timer.attempt(),
      hint: () => timer.hint(),
      reveal: () => timer.reveal(),
      restart: () => timer.start(isDocumentHidden()),
      buildAnswer: (details: AnswerDetails) => timer.build(details),
    }),
    [timer],
  )
}
