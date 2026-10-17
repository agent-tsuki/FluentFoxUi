import type { KanaChar } from '@/types'
import type { AnswerBuilder } from '@/hooks/useStudyRecorder'
import type { GivenAnswer } from '@/lib/learn/practiceSession'
import type { QuestionType } from '@/types/learn'

/**
 * Saves one answer about `target` (a kana of the current script) to the
 * practice session. `timer` is the question's useAnswerTimer (or a builder
 * wrapping it); kana without a card in the session are not saved.
 */
export type PracticeAnswerFn = (target: KanaChar, type: QuestionType, given: GivenAnswer, timer: AnswerBuilder) => void

/** Every practice mode receives the same inputs from KanaPracticePage. */
export interface PracticeModeProps {
  /** All playable kana (no empty grid slots), in chart order. */
  kana: KanaChar[]
  /** Kana ids the learn API picked for this round (weakest first); modes ask these first. */
  focusIds: readonly string[]
  onAnswer: PracticeAnswerFn
  /** Called when the learner leaves the mode (e.g. "Back to chart"). */
  onExit: () => void
  /** Call once when a session reaches its results screen (completes the session, ticks the unit's Practise step). */
  onComplete?: () => void
}

export type PracticeModeId = 'review' | 'listen' | 'build' | 'speed' | 'lookalike' | 'match'
