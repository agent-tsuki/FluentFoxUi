import { distance, normaliseMeaning, normaliseReading } from '@/components/kanjiQuiz/markKanjiAnswer'
import { hasLatin } from '@/lib/content/kanji/romaji'
import type { TestAnswer, TestQuestion, TextQuestion } from './types'

/** Kana or kanji anywhere in the text (sets lang="ja" and the Japanese font). */
export function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(text)
}

/** Lower-cased, trimmed, inner spaces dropped: "Ja Arimasen" → "jaarimasen". */
function plain(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '')
}

/** Japanese text compared as hiragana (romaji is converted), ignoring spaces and punctuation. */
function japanese(text: string): string {
  return normaliseReading(text).replace(/[。、！？!?「」]/g, '')
}

/** How kana reads aloud where particles differ from their spelling: では → でわ, を → お, へ → え. */
function spoken(text: string): string {
  return text.replace(/は/g, 'わ').replace(/へ/g, 'え').replace(/を/g, 'お')
}

/**
 * Typed Japanese matches. In a sentence (`particles`), romaji matches the
 * sound, so "dewa" fits では; a word's reading is spelled exactly (はな is not "wana").
 */
function sameJapanese(answer: string, given: string, particles: boolean): boolean {
  const want = japanese(answer)
  const typed = japanese(given)
  return want === typed || (particles && hasLatin(given) && spoken(want) === typed)
}

function markText(question: TextQuestion, given: string): boolean {
  const typed = plain(given)
  if (!typed) return false
  if (question.romaji?.some((r) => plain(r) === typed)) return true

  switch (question.compare) {
    case 'meaning': {
      const meaning = normaliseMeaning(given)
      return question.accepted.some((a) => {
        const want = normaliseMeaning(a)
        return want === meaning || (meaning.length >= 5 && distance(want, meaning) <= 1)
      })
    }
    case 'romaji':
      // "shi" and "si" both turn into し; the kana itself is accepted too.
      return question.accepted.some((a) => plain(a) === typed || japanese(a) === japanese(given))
    case 'reading':
    case 'japanese':
      return question.accepted.some((a) => sameJapanese(a, given, question.compare === 'japanese'))
  }
}

/** Marks one answer: choice and dropdown match the option exactly; typed answers are normalised. */
export function markTestAnswer(question: TestQuestion, given: string): TestAnswer {
  const correct = question.kind === 'text' ? markText(question, given) : given === question.answer
  return { question, given, correct }
}
