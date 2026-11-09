import type { KanaChar } from '@/types'
import { shuffle } from '@/lib/pdf/shared'
import { isKanaMark, isTypeableKana } from '@/lib/content/kana/kanaMarks'
import { pickDistractors, planQuestions } from './plan'
import type { TestFormatId, TestQuestion } from './types'

const OPTIONS = 4

export interface KanaQuestionInput {
  /** The kana to ask about (the chosen rows). */
  kana: readonly KanaChar[]
  /** Every kana of the script (wrong options). */
  all: readonly KanaChar[]
  /** Look-alike characters per character, asked first as wrong options. */
  lookAlikes: Readonly<Record<string, readonly string[]>>
  formats: readonly TestFormatId[]
  count: number
  random?: () => number
}

/** Kana questions: read it (pick the romaji), find it (pick the kana), or type the romaji. */
export function kanaQuestions({ kana, all, lookAlikes, formats, count, random = Math.random }: KanaQuestionInput): TestQuestion[] {
  // ー and small ッ have no romaji of their own, so they can't be asked this way.
  const targets = kana.filter((k) => !k.isEmpty && !isKanaMark(k) && isTypeableKana(k))
  const pool = all.filter((k) => !k.isEmpty && !isKanaMark(k) && isTypeableKana(k))
  const plan = planQuestions(targets, formats, count, (k) => k.id, random)

  return plan.map(({ target, format }, i) => {
    const id = `${format}-${target.id}-${i}`
    const others = pool.filter((k) => k.romaji !== target.romaji)
    const explanation = `${target.character} is read “${target.romaji}”.`

    if (format === 'kana-pick') {
      const similar = (lookAlikes[target.character] ?? []).filter((c) => others.some((k) => k.character === c))
      const wrong = pickDistractors(
        others.map((k) => k.character),
        (c) => c === target.character,
        OPTIONS - 1,
        random,
        similar.slice(0, 2),
      )
      return {
        id,
        format,
        kind: 'choice',
        instruction: 'Which kana is this?',
        prompt: { type: 'glyph', text: target.romaji, ja: false },
        answer: target.character,
        options: shuffle([target.character, ...wrong], random),
        optionsJa: true,
        explanation,
      }
    }
    if (format === 'kana-typed') {
      return {
        id,
        format,
        kind: 'text',
        instruction: 'Type the romaji',
        prompt: { type: 'glyph', text: target.character, ja: true },
        answer: target.romaji,
        compare: 'romaji',
        accepted: [target.romaji, target.character],
        placeholder: 'e.g. ka',
        explanation,
      }
    }
    const wrong = pickDistractors(
      others.map((k) => k.romaji),
      (r) => r === target.romaji,
      OPTIONS - 1,
      random,
    )
    return {
      id,
      format,
      kind: 'choice',
      instruction: 'How do you read this?',
      prompt: { type: 'glyph', text: target.character, ja: true },
      answer: target.romaji,
      options: shuffle([target.romaji, ...wrong], random),
      optionsJa: false,
      explanation,
    }
  })
}
