import type { KanjiEntry, KanjiVocab } from '@/types/kanji'
import { shuffle } from '@/lib/pdf/shared'
import { readingsOf } from '@/lib/content/kanji/kanjiText'
import { buildKanjiQuestion, keyReadingLabel } from '@/components/kanjiQuiz/buildKanjiQuestions'
import { normaliseMeaning } from '@/components/kanjiQuiz/markKanjiAnswer'
import { pickDistractors, planQuestions } from './plan'
import type { TestFormatId, TestQuestion } from './types'

const OPTIONS = 4

interface KanjiQuestionInput {
  /** The kanji to ask about (the chosen units). */
  entries: readonly KanjiEntry[]
  /** Every kanji of the level (wrong options). */
  pool: readonly KanjiEntry[]
  formats: readonly TestFormatId[]
  count: number
  random?: () => number
}

function kanjiNote(entry: KanjiEntry): string {
  return `${entry.char}: ${entry.meanings.slice(0, 3).join(', ')} · ${readingsOf(entry).slice(0, 4).join('、')}`
}

/** Kanji questions on the kanji quiz's own builder: meaning, reading or the kanji, by choice or typed. */
export function kanjiQuestions({ entries, pool, formats, count, random = Math.random }: KanjiQuestionInput): TestQuestion[] {
  return planQuestions(entries, formats, count, (e) => e.char, random).map(({ target, format }, i): TestQuestion => {
    const id = `${format}-${target.char}-${i}`
    const explanation = kanjiNote(target)
    switch (format) {
      case 'kanji-reading': {
        const q = buildKanjiQuestion(target, 'reading', pool, 'choice', id)
        return {
          id,
          format,
          kind: 'choice',
          instruction: 'Pick a reading of this kanji',
          prompt: { type: 'glyph', text: target.char, ja: true },
          answer: q.answer,
          options: q.options,
          optionsJa: true,
          explanation,
        }
      }
      case 'kanji-pick': {
        const q = buildKanjiQuestion(target, 'kanji', pool, 'choice', id)
        return {
          id,
          format,
          kind: 'choice',
          instruction: 'Which kanji means this?',
          prompt: { type: 'glyph', text: target.meanings[0], ja: false },
          answer: q.answer,
          options: q.options,
          optionsJa: true,
          explanation,
        }
      }
      case 'kanji-typed-meaning': {
        const q = buildKanjiQuestion(target, 'meaning', pool, 'typed', id)
        return {
          id,
          format,
          kind: 'text',
          instruction: 'Type the meaning in English',
          prompt: { type: 'glyph', text: target.char, ja: true },
          answer: q.answer,
          compare: 'meaning',
          accepted: q.accepted,
          placeholder: 'e.g. water',
          explanation,
        }
      }
      case 'kanji-typed-reading': {
        const q = buildKanjiQuestion(target, 'reading', pool, 'typed', id)
        return {
          id,
          format,
          kind: 'text',
          instruction: 'Type a reading (romaji or kana)',
          prompt: { type: 'glyph', text: target.char, ja: true },
          answer: keyReadingLabel(target),
          compare: 'reading',
          accepted: q.accepted,
          placeholder: 'e.g. mizu',
          explanation,
        }
      }
      default: {
        const q = buildKanjiQuestion(target, 'meaning', pool, 'choice', id)
        return {
          id,
          format,
          kind: 'choice',
          instruction: 'What does this kanji mean?',
          prompt: { type: 'glyph', text: target.char, ja: true },
          answer: q.answer,
          options: q.options,
          optionsJa: false,
          explanation,
        }
      }
    }
  })
}

/** Every word of these kanji, each once (a word can be listed under two kanji). */
export function vocabOf(entries: readonly KanjiEntry[]): KanjiVocab[] {
  const seen = new Map<string, KanjiVocab>()
  for (const e of entries) for (const v of e.vocab) if (!seen.has(v.word)) seen.set(v.word, v)
  return [...seen.values()]
}

interface VocabQuestionInput {
  words: readonly KanjiVocab[]
  /** Every word of the level (wrong options). */
  pool: readonly KanjiVocab[]
  formats: readonly TestFormatId[]
  count: number
  random?: () => number
}

/** Vocabulary questions: word → meaning, meaning → word, or type the reading. */
export function vocabQuestions({ words, pool, formats, count, random = Math.random }: VocabQuestionInput): TestQuestion[] {
  return planQuestions(words, formats, count, (w) => w.word, random).map(({ target, format }, i): TestQuestion => {
    const id = `${format}-${target.word}-${i}`
    const explanation = `${target.word}（${target.reading}）: ${target.meaning}`
    const meaning = normaliseMeaning(target.meaning)
    // Words that mean the same (or read the same) would make two right answers.
    const others = pool.filter((w) => w.word !== target.word && normaliseMeaning(w.meaning) !== meaning)

    if (format === 'vocab-word') {
      const wrong = pickDistractors(
        others.map((w) => w.word),
        (w) => w === target.word,
        OPTIONS - 1,
        random,
      )
      return {
        id,
        format,
        kind: 'choice',
        instruction: 'Which word means this?',
        prompt: { type: 'glyph', text: target.meaning, ja: false },
        answer: target.word,
        options: shuffle([target.word, ...wrong], random),
        optionsJa: true,
        explanation,
      }
    }
    if (format === 'vocab-typed-reading') {
      return {
        id,
        format,
        kind: 'text',
        instruction: 'Type the reading (romaji or kana)',
        prompt: { type: 'glyph', text: target.word, ja: true },
        answer: target.reading,
        compare: 'reading',
        accepted: [target.reading],
        placeholder: 'e.g. gakusei',
        explanation,
      }
    }
    const wrong = pickDistractors(
      others.map((w) => w.meaning),
      (m) => normaliseMeaning(m) === meaning,
      OPTIONS - 1,
      random,
    )
    return {
      id,
      format,
      kind: 'choice',
      instruction: 'What does this word mean?',
      prompt: { type: 'glyph', text: target.word, ja: true },
      answer: target.meaning,
      options: shuffle([target.meaning, ...wrong], random),
      optionsJa: false,
      explanation,
    }
  })
}
