import type { KanaChar } from '@/types'

/**
 * read   — see a kana, pick its romaji.
 * find   — see a romaji, pick the kana.
 * listen — hear a kana, pick the kana.
 */
export type QuestionKind = 'read' | 'find' | 'listen'

export interface QuizQuestion {
  /** Unique within a quiz (the same kana can appear twice in a short unit). */
  key: string
  kind: QuestionKind
  target: KanaChar
  /** Four options including `target`, already shuffled. */
  options: KanaChar[]
  /** Overrides the kind's default question line (e.g. "How do you read this word?"). */
  prompt?: string
  /** A small line under the prompt, e.g. a loanword's picture and meaning. */
  hint?: string
}

export interface QuizAnswer {
  question: QuizQuestion
  /** null when the question was never answered (time ran out). */
  chosenId: string | null
  correct: boolean
}
