import type { ReactNode } from 'react'

/**
 * Course-agnostic quiz shapes (types only). Phase 1: Agent B makes
 * OptionGrid / QuizRunner / useQuizSession generic over these; the kana
 * builders keep producing the existing `QuizQuestion` (./types.ts), which is
 * the `'choice'` case with `T = KanaChar`. Agent D builds kanji questions
 * with `T = KanjiEntry` (or `KanjiIndexRow`).
 */

/** How the learner answers: pick one of the options, or type the answer. */
export type QuizAnswerKind = 'choice' | 'typed'

/**
 * Suggested kanji question kinds (Agent D may extend):
 * meaning — see 日, pick/type its meaning.
 * reading — see 日, pick/type its reading.
 * kanji   — see a meaning, pick the kanji.
 * listen  — hear a key word, pick the kanji.
 */
export type KanjiQuestionKind = 'meaning' | 'reading' | 'kanji' | 'listen'

interface GenericQuizQuestionBase<T, K extends string> {
  /** Unique within a quiz. */
  key: string
  kind: K
  target: T
  /** Overrides the kind's default question line. */
  prompt?: string
  /** A small line under the prompt. */
  hint?: string
}

export interface ChoiceQuizQuestion<T, K extends string = string> extends GenericQuizQuestionBase<T, K> {
  answerKind: 'choice'
  /** Options including `target`, already shuffled (usually 4). */
  options: T[]
}

export interface TypedQuizQuestion<T, K extends string = string> extends GenericQuizQuestionBase<T, K> {
  answerKind: 'typed'
  /** 'kana' → romaji is converted to kana live; 'english' → plain text. */
  input: 'kana' | 'english'
  /** Every accepted answer (readings, or meanings + synonyms). */
  accepted: string[]
  /** The answer we want; other accepted answers get the "right, but we want…" nudge. */
  preferred?: string
}

export type GenericQuizQuestion<T, K extends string = string> = ChoiceQuizQuestion<T, K> | TypedQuizQuestion<T, K>

export interface GenericQuizAnswer<T, K extends string = string> {
  question: GenericQuizQuestion<T, K>
  /** Choice: the chosen option's id. null when never answered (time ran out). */
  chosenId: string | null
  /** Typed: what the learner entered (normalised). */
  typed?: string
  correct: boolean
}

/** How the generic runner identifies and draws a `T` (passed alongside the questions). */
export interface QuizItemAdapter<T> {
  /** Stable id of an item (kana id, kanji char). */
  id(item: T): string
  /** Content of an option button. */
  renderOption(item: T, kind: string): ReactNode
  /** The big prompt for a question. */
  renderPrompt(question: GenericQuizQuestion<T>): ReactNode
  /** Text for TTS (listen questions / speaker buttons), if any. */
  speech?(item: T): string | undefined
}
