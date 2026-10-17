import type { KanjiCardFace, KanjiEntry } from '@/types/kanji'

/**
 * meaning — see 日, give its meaning.
 * reading — see 日, give a reading (any correct reading counts).
 * kanji   — see a meaning, pick the kanji.
 * listen  — hear the key word, pick the kanji.
 */
export type KanjiQuestionKind = 'meaning' | 'reading' | 'kanji' | 'listen'

/** How the learner answers meaning / reading questions (kanji / listen are always choice). */
export type KanjiAnswerMode = 'typed' | 'choice'

export interface KanjiQuestion {
  /** Unique within a quiz. */
  key: string
  kind: KanjiQuestionKind
  target: KanjiEntry
  answerKind: KanjiAnswerMode
  /** The SRS card this answer feeds. */
  face: KanjiCardFace
  /** Choice: option labels (meanings, readings or kanji), shuffled, including `answer`. */
  options: string[]
  /** The option we want (choice) / the answer we show (typed). */
  answer: string
  /** Typed: every accepted answer, normalised (see markKanjiAnswer). */
  accepted: string[]
}

export interface KanjiAnswer {
  question: KanjiQuestion
  /** What the learner chose or typed; null when never answered (time ran out). */
  given: string | null
  correct: boolean
  /** Typed and accepted, but not the answer we show (e.g. another reading). */
  alternative?: boolean
}
