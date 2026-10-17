import { toHiragana } from '@/lib/content/kanji/kanjiText'
import { romajiToHiragana } from '@/lib/content/kanji/romaji'
import type { KanjiAnswer, KanjiQuestion } from './types'

/** Reading answers compare as hiragana, ignoring spaces, dots and dashes. */
export function normaliseReading(text: string): string {
  return toHiragana(romajiToHiragana(text.trim())).replace(/[\s.\-ー・()]/g, '')
}

/** Meaning answers compare lowercased, without "to " (verbs), articles, punctuation or brackets. */
export function normaliseMeaning(text: string): string {
  return text
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/^\s*(to|a|an|the)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Levenshtein distance, capped (we only care about 0–2). */
function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

/**
 * Marks one answer. Choice: exact option. Typed reading: any reading of the
 * kanji. Typed meaning: any meaning, forgiving one typo in words of 5+ letters.
 */
export function markKanjiAnswer(question: KanjiQuestion, given: string): KanjiAnswer {
  if (question.answerKind === 'choice') {
    return { question, given, correct: given === question.answer }
  }
  if (question.kind === 'reading') {
    const typed = normaliseReading(given)
    const correct = question.accepted.includes(typed)
    return { question, given, correct, alternative: correct && typed !== normaliseReading(question.answer) }
  }
  const typed = normaliseMeaning(given)
  const exact = question.accepted.includes(typed)
  const close = !exact && typed.length >= 5 && question.accepted.some((m) => distance(m, typed) <= 1)
  const correct = exact || close
  return { question, given, correct, alternative: correct && typed !== normaliseMeaning(question.answer) }
}
