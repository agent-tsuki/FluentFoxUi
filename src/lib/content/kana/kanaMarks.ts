import type { KanaChar } from '@/types'

/**
 * Katakana's two marks, ー (long vowel, id 'long', romaji '-') and small ッ
 * (pause, id 'sokuon', romaji '(pause)'), have no sound or romaji of their
 * own. They can't be typed, heard alone or used as an answer tile, so quizzes,
 * Listen & tap and Speed round leave them out (as targets and as distractors).
 * They're taught on the unit page and the character sheet instead, and the
 * unit quiz checks them through loanwords (see kanaQuiz/markQuestions.ts).
 */
export const KANA_MARK_IDS: ReadonlySet<string> = new Set(['long', 'sokuon'])

/** True for ー and small ッ. */
export function isKanaMark(k: Pick<KanaChar, 'id'>): boolean {
  return KANA_MARK_IDS.has(k.id)
}

/** Kana whose answer is a plain romaji syllable (everything except the marks). */
export function isTypeableKana(k: Pick<KanaChar, 'romaji'>): boolean {
  return /^[a-z]+$/.test(k.romaji)
}

/** A reading label for UI that would otherwise print '-' or '(pause)'; `short` fits a chart tile. */
export function kanaReadingLabel(k: Pick<KanaChar, 'id' | 'romaji'>, short = false): string {
  if (k.id === 'long') return short ? 'long' : 'long vowel'
  if (k.id === 'sokuon') return 'pause'
  return k.romaji
}

/**
 * What to say aloud for a chart character: the character itself, or for ー/ッ
 * (silent on their own) their example word's kana, e.g. コーヒー.
 */
export function kanaSpeechText(
  k: Pick<KanaChar, 'id' | 'character'>,
  sampleWords: Readonly<Record<string, { word: string }>>,
): string {
  if (!isKanaMark(k)) return k.character
  const sample = sampleWords[k.id]?.word
  return sample?.replace(/\s*\(.*\)\s*$/, '') ?? k.character
}
