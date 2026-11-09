/**
 * Practice tests (the /quiz page): one question shape for every subject, so a
 * single runner can ask kana, kanji, vocabulary and grammar questions in
 * whichever answer formats fit them (choice, a dropdown in a sentence, typing).
 */

export type TestSubjectId = 'kana' | 'kanji' | 'vocab' | 'grammar'

export type TestFormatId =
  | 'kana-romaji'
  | 'kana-pick'
  | 'kana-typed'
  | 'kanji-meaning'
  | 'kanji-reading'
  | 'kanji-pick'
  | 'kanji-typed-meaning'
  | 'kanji-typed-reading'
  | 'vocab-meaning'
  | 'vocab-word'
  | 'vocab-typed-reading'
  | 'grammar-gap'
  | 'grammar-typed'
  | 'grammar-meaning'

/** How the learner answers: tap one of four, pick from a dropdown in the sentence, or type. */
export type AnswerKind = 'choice' | 'select' | 'text'

/**
 * What a question shows.
 * glyph    — one big item: あ, 日, 学生, "water".
 * sentence — a Japanese sentence, read in full.
 * gap      — a Japanese sentence with one blank (the dropdown or text box sits in it).
 */
export type TestPrompt =
  | { type: 'glyph'; text: string; ja: boolean }
  | { type: 'sentence'; text: string }
  | { type: 'gap'; before: string; after: string }

/** How a typed answer is compared. */
export type TypedAnswer =
  /** Romaji for a kana (or the kana itself). */
  | 'romaji'
  /** A Japanese reading, typed in romaji or kana. */
  | 'reading'
  /** An English meaning, forgiving one typo. */
  | 'meaning'
  /** A Japanese word or ending, typed in kana, kanji or romaji. */
  | 'japanese'

interface QuestionBase {
  /** Unique within a test. */
  id: string
  format: TestFormatId
  /** The line above the prompt, e.g. "What does this mean?". */
  instruction: string
  prompt: TestPrompt
  /** The answer shown when the learner is wrong. */
  answer: string
  /** The English of a sentence, shown under it. */
  translation?: string
  /** One line on why, shown after answering. */
  explanation?: string
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice'
  /** Four labels, shuffled, including `answer`. */
  options: string[]
  /** The options are Japanese (set lang and the Japanese font). */
  optionsJa: boolean
}

export interface SelectQuestion extends QuestionBase {
  kind: 'select'
  prompt: Extract<TestPrompt, { type: 'gap' }>
  options: string[]
}

export interface TextQuestion extends QuestionBase {
  kind: 'text'
  compare: TypedAnswer
  /** Every accepted answer (raw; marking normalises both sides). */
  accepted: string[]
  /** Extra exact strings accepted as typed, e.g. "wa" for the particle は. */
  romaji?: string[]
  /** Placeholder for the text box. */
  placeholder: string
}

export type TestQuestion = ChoiceQuestion | SelectQuestion | TextQuestion

export interface TestAnswer {
  question: TestQuestion
  given: string
  correct: boolean
}

/** What to test, as chosen on the setup page. */
export interface TestSetup {
  subject: TestSubjectId
  /** Kana: the script id; others: the JLPT level. */
  level: string
  /** Unit / chapter ids to draw from (as strings). */
  scope: string[]
  formats: TestFormatId[]
  count: number
}
