import { describe, expect, it } from 'vitest'
import type { KanaChar } from '@/types'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { kanaUnitQuizQuestions } from './testQuestions'

const kana = (id: string, character: string): KanaChar => ({ id, character, romaji: id, type: 'basic' }) as KanaChar
const ALL = [kana('a', 'あ'), kana('i', 'い'), kana('u', 'う'), kana('e', 'え'), kana('o', 'お'), kana('ka', 'か')]

const question = (char: string, type: LearnQuestion['question_type']): LearnQuestion => ({
  card_id: `card-${char}`,
  item_type: 'kana',
  item_id: `item-${char}`,
  facet: 'recognition',
  question_type: type,
  prompt: char,
  correct_answer: char,
  char,
})

const session = (questions: LearnQuestion[]) => ({ session: { id: 's1' }, questions }) as unknown as SessionStart

describe('kanaUnitQuizQuestions', () => {
  it('keeps every question the server asks, repeats included, in its order and direction', () => {
    const built = kanaUnitQuizQuestions(
      session([
        question('あ', 'kana_mcq_romaji'),
        question('い', 'kana_mcq_kana'),
        question('あ', 'kana_mcq_kana'),
        question('い', 'kana_mcq_romaji'),
      ]),
      ALL,
      { speech: true },
    )
    expect(built.questions.map((q) => [q.target.id, q.kind])).toEqual([
      ['a', 'read'],
      ['i', 'find'],
      ['a', 'find'],
      ['i', 'read'],
    ])
    expect(new Set(built.questions.map((q) => q.key)).size).toBe(4)
    expect(built.cards.get('a')?.card_id).toBe('card-あ')
    for (const q of built.questions) {
      expect(q.options).toHaveLength(4)
      expect(q.options.some((o) => o.id === q.target.id)).toBe(true)
    }
  })

  it('skips kana the chart does not have', () => {
    const built = kanaUnitQuizQuestions(session([question('ゑ', 'kana_mcq_romaji'), question('お', 'kana_mcq_kana')]), ALL, {
      speech: true,
    })
    expect(built.questions.map((q) => q.target.id)).toEqual(['o'])
  })
})
