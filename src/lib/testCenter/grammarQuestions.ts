import type { GrammarBankItem } from '@/lib/content/grammar/questionBank'
import { shuffle } from '@/lib/pdf/shared'
import { pickDistractors, planQuestions } from './plan'
import type { TestFormatId, TestQuestion } from './types'

const GAP = '{}'

/** The sentence around the gap. */
export function splitGap(sentence: string): { before: string; after: string } {
  const at = sentence.indexOf(GAP)
  return at === -1 ? { before: sentence, after: '' } : { before: sentence.slice(0, at), after: sentence.slice(at + GAP.length) }
}

interface GrammarQuestionInput {
  /** The items of the chosen chapters. */
  items: readonly GrammarBankItem[]
  /** Every item of the level (wrong translations). */
  pool: readonly GrammarBankItem[]
  formats: readonly TestFormatId[]
  count: number
  random?: () => number
}

const keyOf = (item: GrammarBankItem) => item.sentence

/**
 * Grammar questions from the question bank: the gap as a dropdown, the gap
 * typed, or the whole sentence to translate (form drills are skipped there).
 */
export function grammarQuestions({ items, pool, formats, count, random = Math.random }: GrammarQuestionInput): TestQuestion[] {
  // Form drills ("the te-form of …") have no translation to ask, so the
  // meaning format gets its fair share from the other items, and the gap
  // formats fill the rest of the test.
  const gapFormats = formats.filter((f) => f !== 'grammar-meaning')
  const fairShare = gapFormats.length === formats.length ? 0 : gapFormats.length ? Math.round(count / formats.length) : count
  const translatable = items.filter((i) => !i.noMeaning)
  const meaningPlan = planQuestions(translatable, ['grammar-meaning' as const], fairShare, keyOf, random)
  const gapPlan = planQuestions(items, gapFormats, count - meaningPlan.length, keyOf, random)
  const ordered = spread(shuffle([...gapPlan, ...meaningPlan], random))

  return ordered.map(({ target, format }, i): TestQuestion => {
    const id = `${format}-${target.chapter}-${i}`
    const { before, after } = splitGap(target.sentence)
    const base = { id, format, answer: target.answer, translation: target.translation, explanation: target.explanation }

    if (format === 'grammar-meaning') {
      const wrong = pickDistractors(
        pool.filter((p) => !p.noMeaning).map((p) => p.translation),
        (t) => t === target.translation,
        3,
        random,
        // Sentences from the same chapter make closer (harder) wrong answers.
        pool.filter((p) => p.chapter === target.chapter && !p.noMeaning).map((p) => p.translation),
      )
      return {
        ...base,
        kind: 'choice',
        instruction: 'What does this sentence mean?',
        prompt: { type: 'sentence', text: before + target.answer + after },
        answer: target.translation,
        translation: undefined,
        options: shuffle([target.translation, ...wrong], random),
        optionsJa: false,
      }
    }
    if (format === 'grammar-typed') {
      return {
        ...base,
        kind: 'text',
        instruction: 'Type the missing word (kana or romaji)',
        prompt: { type: 'gap', before, after },
        compare: 'japanese',
        accepted: [target.answer, ...(target.alsoAccept ?? [])],
        romaji: target.romaji,
        placeholder: 'kana or romaji',
      }
    }
    return {
      ...base,
      kind: 'select',
      instruction: 'Choose the word that fills the gap',
      prompt: { type: 'gap', before, after },
      options: shuffle([target.answer, ...target.distractors], random),
    }
  })
}

/** Reorders so the same sentence rarely comes twice in a row. */
function spread<T extends { target: GrammarBankItem }>(list: T[]): T[] {
  const out: T[] = []
  const rest = [...list]
  while (rest.length) {
    const prev = out[out.length - 1]?.target.sentence
    const i = rest.findIndex((p) => p.target.sentence !== prev)
    out.push(...rest.splice(i === -1 ? 0 : i, 1))
  }
  return out
}
