/**
 * How a server-built question (`LearnQuestion`) is shown: the question line,
 * whether the prompt is a big glyph, a big romaji/English word or a sound,
 * and whether the learner picks an option or types. Pure.
 */
import type { LearnQuestion, QuestionType } from '@/types/learn'

export type PromptDisplay = 'japanese' | 'latin' | 'audio'
export type AnswerInput = 'choice' | 'typed'

export interface QuestionView {
  ask: string
  display: PromptDisplay
  input: AnswerInput
  /** Typed answers in Japanese: the field converts romaji to kana as you type. */
  typesKana: boolean
  /** Options are Japanese text (kana or kanji) rather than romaji / English. */
  optionsJapanese: boolean
}

const JAPANESE = /[぀-ヿㇰ-ㇿ㐀-鿿豈-﫿]/

export function isJapaneseText(text: string): boolean {
  return JAPANESE.test(text)
}

const LISTEN_TYPES: ReadonlySet<QuestionType> = new Set(['kana_listen', 'kanji_listen'])
const TYPED_TYPES: ReadonlySet<QuestionType> = new Set(['kana_typed', 'kanji_meaning_typed', 'kanji_reading_typed'])

const ASK: Partial<Record<QuestionType, string>> = {
  kana_mcq_romaji: 'How do you read this kana?',
  kana_mcq_kana: 'Which kana is this?',
  kana_typed: 'Type the reading of this kana',
  kana_listen: 'Which kana did you hear?',
  kana_lookalike: 'Which kana is this? Careful, some look alike.',
  kanji_meaning_mcq: 'What does this kanji mean?',
  kanji_meaning_typed: 'Type the meaning of this kanji',
  kanji_reading_mcq: 'How do you read this kanji?',
  kanji_reading_typed: 'Type a reading of this kanji',
  kanji_listen: 'Which kanji is in the word you heard?',
  kanji_lookalike: 'Which kanji means this? Careful, some look alike.',
}

export function questionView(question: LearnQuestion): QuestionView {
  const { question_type: type, prompt, correct_answer: answer } = question
  const hasOptions = (question.options?.length ?? 0) > 0
  const input: AnswerInput = TYPED_TYPES.has(type) || !hasOptions ? 'typed' : 'choice'
  return {
    ask: ASK[type] ?? (input === 'typed' ? 'Type the answer' : 'Pick the answer'),
    display: LISTEN_TYPES.has(type) ? 'audio' : isJapaneseText(prompt) ? 'japanese' : 'latin',
    input,
    typesKana: input === 'typed' && isJapaneseText(answer),
    optionsJapanese: isJapaneseText(answer),
  }
}

const SINGLE_KANJI = /^[\u3400-\u9fff\uf900-\ufaff]$/u

/**
 * The kana or kanji a question is about. Uses `char` when the server sends it;
 * otherwise whichever of prompt and answer is the item itself (the prompt can
 * be romaji, an English meaning or a spoken word).
 */
export function cardChar(question: LearnQuestion): string {
  if (question.char) return question.char
  const { prompt, correct_answer: answer } = question
  if (question.item_type === 'kanji') return [prompt, answer].find((t) => SINGLE_KANJI.test(t)) ?? prompt
  return [answer, prompt].find(isJapaneseText) ?? prompt
}
