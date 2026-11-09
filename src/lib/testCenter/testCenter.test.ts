import { describe, expect, it } from 'vitest'
import type { KanaChar } from '@/types'
import { GRAMMAR_QUESTION_BANK } from '@/lib/content/grammar/questionBank'
import { GRAMMAR_TEST_LEVELS } from './subjects'
import { planQuestions } from './plan'
import { markTestAnswer } from './mark'
import { kanaQuestions } from './kanaQuestions'
import { grammarQuestions, splitGap } from './grammarQuestions'
import type { TestQuestion, TextQuestion } from './types'

/** A seeded random, so the tests are repeatable. */
function seeded(seed = 1): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const kana = (id: string, character: string, romaji: string): KanaChar => ({ id, character, romaji, type: 'hiragana' as KanaChar['type'] })
const KANA: KanaChar[] = [
  kana('a', 'あ', 'a'),
  kana('i', 'い', 'i'),
  kana('u', 'う', 'u'),
  kana('e', 'え', 'e'),
  kana('o', 'お', 'o'),
  kana('shi', 'し', 'shi'),
  kana('ji', 'じ', 'ji'),
  kana('di', 'ぢ', 'ji'),
  kana('tsu', 'つ', 'tsu'),
  kana('long', 'ー', '-'),
]

function text(partial: Partial<TextQuestion> & Pick<TextQuestion, 'compare' | 'accepted'>): TextQuestion {
  return {
    id: 'q',
    format: 'kana-typed',
    kind: 'text',
    instruction: '',
    prompt: { type: 'glyph', text: '', ja: true },
    answer: partial.accepted[0],
    placeholder: '',
    ...partial,
  }
}

describe('grammar question bank', () => {
  const levels = Object.keys(GRAMMAR_QUESTION_BANK)

  it('lists the same levels as the setup page', () => {
    expect([...levels].sort()).toEqual([...GRAMMAR_TEST_LEVELS].sort())
  })

  for (const level of levels) {
    for (const item of GRAMMAR_QUESTION_BANK[level]) {
      it(`${level} ch${item.chapter}: ${item.sentence}`, () => {
        expect(item.sentence.split('{}')).toHaveLength(2)
        expect(item.distractors).not.toContain(item.answer)
        expect(new Set(item.distractors).size).toBe(3)
        expect(item.translation.trim()).not.toBe('')
        expect(item.explanation.trim()).not.toBe('')
        // The answer typed in kana (or one of the listed forms) must mark as right.
        const typed = grammarQuestions({ items: [item], pool: [item], formats: ['grammar-typed'], count: 1, random: seeded() })[0]
        expect(markTestAnswer(typed, item.answer).correct).toBe(true)
        for (const d of item.distractors) expect(markTestAnswer(typed, d).correct).toBe(false)
      })
    }
  }
})

describe('planQuestions', () => {
  const items = ['a', 'b', 'c', 'd', 'e']

  it('caps at items × formats and never repeats a pair', () => {
    const plan = planQuestions(items, ['x', 'y'], 50, (t) => t, seeded())
    expect(plan).toHaveLength(10)
    expect(new Set(plan.map((p) => `${p.target}${p.format}`)).size).toBe(10)
  })

  it('takes turns between formats and avoids the same item twice in a row', () => {
    const plan = planQuestions(items, ['x', 'y'], 8, (t) => t, seeded(7))
    expect(plan.filter((p) => p.format === 'x')).toHaveLength(4)
    for (let i = 1; i < plan.length; i++) expect(plan[i].target).not.toBe(plan[i - 1].target)
  })

  it('covers different items before repeating one', () => {
    const plan = planQuestions(items, ['x', 'y'], 5, (t) => t, seeded(3))
    expect(new Set(plan.map((p) => p.target)).size).toBe(5)
  })
})

describe('markTestAnswer', () => {
  it('accepts either romaji spelling of a kana, or the kana itself', () => {
    const q = text({ compare: 'romaji', accepted: ['shi', 'し'] })
    expect(markTestAnswer(q, 'shi').correct).toBe(true)
    expect(markTestAnswer(q, ' SI ').correct).toBe(true)
    expect(markTestAnswer(q, 'し').correct).toBe(true)
    expect(markTestAnswer(q, 'su').correct).toBe(false)
    expect(markTestAnswer(q, '').correct).toBe(false)
  })

  it('accepts the romaji of a particle and Japanese typed in romaji', () => {
    const wa = text({ compare: 'japanese', accepted: ['は'], romaji: ['wa'] })
    expect(markTestAnswer(wa, 'wa').correct).toBe(true)
    expect(markTestAnswer(wa, 'は').correct).toBe(true)
    expect(markTestAnswer(wa, 'ga').correct).toBe(false)
    const neg = text({ compare: 'japanese', accepted: ['じゃありません', 'ではありません'] })
    expect(markTestAnswer(neg, 'ja arimasen').correct).toBe(true)
    expect(markTestAnswer(neg, 'dewa arimasen').correct).toBe(true)
  })

  it('reads katakana and hiragana alike for readings', () => {
    const q = text({ compare: 'reading', accepted: ['にち'] })
    expect(markTestAnswer(q, 'ニチ').correct).toBe(true)
    expect(markTestAnswer(q, 'nichi').correct).toBe(true)
  })

  it('forgives one typo in a longer English meaning', () => {
    const q = text({ compare: 'meaning', accepted: ['mountain'] })
    expect(markTestAnswer(q, 'Mountian').correct).toBe(false)
    expect(markTestAnswer(q, 'mountin').correct).toBe(true)
    expect(markTestAnswer(q, 'a mountain').correct).toBe(true)
  })

  it('matches choice answers exactly', () => {
    const q: TestQuestion = {
      id: 'q',
      format: 'kana-romaji',
      kind: 'choice',
      instruction: '',
      prompt: { type: 'glyph', text: 'あ', ja: true },
      answer: 'a',
      options: ['a', 'i', 'u', 'e'],
      optionsJa: false,
    }
    expect(markTestAnswer(q, 'a').correct).toBe(true)
    expect(markTestAnswer(q, 'i').correct).toBe(false)
  })
})

describe('kanaQuestions', () => {
  const questions = kanaQuestions({
    kana: KANA,
    all: KANA,
    lookAlikes: {},
    formats: ['kana-romaji', 'kana-pick', 'kana-typed'],
    count: 30,
    random: seeded(5),
  })

  it('never asks the marks, which have no romaji', () => {
    expect(questions.some((q) => q.prompt.type === 'glyph' && q.prompt.text === 'ー')).toBe(false)
    expect(questions).toHaveLength(27)
  })

  it('offers four different options with one right answer', () => {
    for (const q of questions) {
      if (q.kind !== 'choice') continue
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.answer)
    }
  })

  it('never offers two kana that read the same (じ and ぢ)', () => {
    for (const q of questions) {
      if (q.kind === 'choice' && q.format === 'kana-pick' && q.answer === 'じ') expect(q.options).not.toContain('ぢ')
      if (q.kind === 'choice' && q.format === 'kana-romaji') expect(q.options.filter((o) => o === q.answer)).toHaveLength(1)
    }
  })
})

describe('grammarQuestions', () => {
  const pool = GRAMMAR_QUESTION_BANK.n5

  it('builds a dropdown with the answer among four options', () => {
    const qs = grammarQuestions({ items: pool, pool, formats: ['grammar-gap'], count: 10, random: seeded() })
    expect(qs).toHaveLength(10)
    for (const q of qs) {
      expect(q.kind).toBe('select')
      if (q.kind === 'select') {
        expect(q.options).toHaveLength(4)
        expect(q.options).toContain(q.answer)
      }
    }
  })

  it('never asks a form drill as a translation', () => {
    const drills = pool.filter((i) => i.noMeaning)
    const qs = grammarQuestions({ items: drills, pool, formats: ['grammar-meaning'], count: 10, random: seeded() })
    expect(qs).toHaveLength(0)
  })

  it('mixes formats to the requested length', () => {
    const qs = grammarQuestions({
      items: pool,
      pool,
      formats: ['grammar-gap', 'grammar-typed', 'grammar-meaning'],
      count: 21,
      random: seeded(9),
    })
    expect(qs).toHaveLength(21)
    expect(qs.filter((q) => q.format === 'grammar-meaning')).toHaveLength(7)
    for (const q of qs) if (q.format === 'grammar-meaning' && q.kind === 'choice') expect(new Set(q.options).size).toBe(4)
  })

  it('splits a sentence at its gap', () => {
    expect(splitGap('わたし{}学生です。')).toEqual({ before: 'わたし', after: '学生です。' })
  })
})

describe('markTestAnswer readings', () => {
  it('spells a reading exactly: はな is not "wana"', () => {
    const q = text({ compare: 'reading', accepted: ['はな'] })
    expect(markTestAnswer(q, 'hana').correct).toBe(true)
    expect(markTestAnswer(q, 'wana').correct).toBe(false)
  })
})
