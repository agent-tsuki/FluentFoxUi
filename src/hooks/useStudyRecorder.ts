import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { answerQueue } from '@/api/answerQueue'
import { learnService } from '@/api/services/learnService'
import { invalidateLearnSummary } from '@/hooks/useLearnSummary'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import type { AnswerDetails } from '@/lib/learn/answerTimer'
import type { GivenAnswer } from '@/lib/learn/practiceSession'
import { StudyRecorder, type StudyRecorderSnapshot } from '@/lib/learn/studyRecorder'
import type { CardFacet, LearnQuestion, QuestionType, SessionResult, SessionStart } from '@/types/learn'

/** What answering needs from a question's timer: the payload builder. */
export type AnswerBuilder = Pick<AnswerTimerControls, 'buildAnswer'>

export interface StudyRecorderControls extends StudyRecorderSnapshot {
  /** The card this run has for an item (any of its sessions). */
  card: (char: string, facet: CardFacet) => LearnQuestion | undefined
  /**
   * Times and queues one answer for the item's card. Items without a card in
   * the session (never learned) are not saved. Returns whether it was queued.
   */
  answer: (char: string, facet: CardFacet, type: QuestionType, given: GivenAnswer, timer: AnswerBuilder) => boolean
  /** Queues an answer to a known card. */
  answerCard: (card: LearnQuestion, type: QuestionType, given: GivenAnswer, timer: AnswerBuilder) => void
  /** Flushes and completes the session; null when nothing was answered. */
  finish: () => Promise<SessionResult | null>
  /** Starts a fresh session (a test's Retry). */
  restart: () => void
  /** After 'start-error' or 'finish-error'. */
  retry: () => void
}

function buildDetails(card: LearnQuestion, type: QuestionType, given: GivenAnswer): AnswerDetails {
  return { card_id: card.card_id, question_type: type, ...given }
}

/**
 * Runs a practice round or a test on the learn API (see StudyRecorder): opens
 * the session on mount, queues answers through the answer queue and completes
 * the session on `finish`. `start` is read once per open, so it may change freely.
 */
export function useStudyRecorder(start: () => Promise<SessionStart>): StudyRecorderControls {
  const startRef = useRef(start)
  useLayoutEffect(() => {
    startRef.current = start
  })

  const [recorder] = useState(
    () =>
      new StudyRecorder({
        start: () => startRef.current(),
        enqueue: (sessionId, answer) => answerQueue.enqueue(sessionId, answer),
        flush: (sessionId) => answerQueue.flush(sessionId),
        complete: async (sessionId) => {
          const result = await learnService.completeSession(sessionId)
          invalidateLearnSummary()
          return result
        },
      }),
  )
  const snapshot = useSyncExternalStore(recorder.subscribe, recorder.getSnapshot)

  // StrictMode runs this twice; open() reuses the request already on its way.
  useEffect(() => {
    recorder.open().catch(() => undefined)
  }, [recorder])

  const card = useCallback((char: string, facet: CardFacet) => recorder.card(char, facet), [recorder])

  const answerCard = useCallback(
    (target: LearnQuestion, type: QuestionType, given: GivenAnswer, timer: AnswerBuilder) => {
      recorder.record(timer.buildAnswer(buildDetails(target, type, given)))
    },
    [recorder],
  )

  const answer = useCallback(
    (char: string, facet: CardFacet, type: QuestionType, given: GivenAnswer, timer: AnswerBuilder) => {
      const target = recorder.card(char, facet)
      if (!target) return false
      answerCard(target, type, given, timer)
      return true
    },
    [recorder, answerCard],
  )

  const finish = useCallback(() => recorder.finish(), [recorder])
  const restart = useCallback(() => {
    recorder.restart().catch(() => undefined)
  }, [recorder])
  const retry = useCallback(() => {
    if (recorder.getSnapshot().status === 'finish-error') recorder.finish().catch(() => undefined)
    else recorder.open().catch(() => undefined)
  }, [recorder])

  return useMemo(
    () => ({ ...snapshot, card, answer, answerCard, finish, restart, retry }),
    [snapshot, card, answer, answerCard, finish, restart, retry],
  )
}
