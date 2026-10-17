import { describe, expect, it } from 'vitest'
import { markLearnAnswer } from '@/components/learnSession/markLearnAnswer'
import { cardChar, questionView } from '@/lib/learn/questionView'
import type { LearnQuestion, QuestionType } from '@/types/learn'

function q(type: QuestionType, prompt: string, answer: string, extra: Partial<LearnQuestion> = {}): LearnQuestion {
  return {
    card_id: 'c1',
    item_type: type.startsWith('kanji') ? 'kanji' : 'kana',
    item_id: 'i1',
    facet: 'recognition',
    question_type: type,
    prompt,
    correct_answer: answer,
    ...extra,
  }
}

describe('questionView', () => {
  it.each([
    ['kana MCQ with romaji options', q('kana_mcq_romaji', 'か', 'ka', { options: ['ka', 'ki'] }), { display: 'japanese', input: 'choice', optionsJapanese: false }],
    ['kana MCQ with kana options', q('kana_mcq_kana', 'ka', 'か', { options: ['か', 'き'] }), { display: 'latin', input: 'choice', optionsJapanese: true }],
    ['a listening question', q('kana_listen', 'か', 'か', { options: ['か', 'き'] }), { display: 'audio', input: 'choice' }],
    ['a typed kanji reading', q('kanji_reading_typed', '日', 'にち'), { display: 'japanese', input: 'typed', typesKana: true }],
    ['a typed kanji meaning', q('kanji_meaning_typed', '日', 'day'), { input: 'typed', typesKana: false }],
    ['a choice type sent without options', q('kanji_meaning_mcq', '日', 'day'), { input: 'typed' }],
  ])('shows %s', (_name, question, expected) => {
    expect(questionView(question)).toMatchObject(expected)
  })
})

describe('markLearnAnswer', () => {
  it.each([
    ['the right option', q('kana_mcq_romaji', 'か', 'ka', { options: ['ka', 'ki'] }), 'ka', true],
    ['a wrong option', q('kana_mcq_romaji', 'か', 'ka', { options: ['ka', 'ki'] }), 'ki', false],
    ['a reading typed in romaji', q('kanji_reading_typed', '日', 'にち'), 'nichi', true],
    ['a reading typed in katakana', q('kanji_reading_typed', '日', 'にち'), 'ニチ', true],
    ['another accepted reading', q('kanji_reading_typed', '日', 'にち', { accepted_answers: ['ひ', 'じつ'] }), 'hi', true],
    ['a wrong reading', q('kanji_reading_typed', '日', 'にち'), 'tsuki', false],
    ['a meaning in another case', q('kanji_meaning_typed', '日', 'day'), ' Day ', true],
    ['an accepted synonym', q('kanji_meaning_typed', '日', 'day', { accepted_answers: ['sun'] }), 'the sun', true],
    ['an empty answer', q('kanji_meaning_typed', '日', 'day'), '   ', false],
  ])('marks %s', (_name, question, given, correct) => {
    expect(markLearnAnswer(question, given)).toBe(correct)
  })
})

describe('cardChar', () => {
  it.each([
    ['the server char when sent', q('kana_mcq_kana', 'ka', 'か', { char: 'カ' }), 'カ'],
    ['the kana answer of a romaji prompt', q('kana_mcq_kana', 'ka', 'か'), 'か'],
    ['the kana prompt of a romaji answer', q('kana_mcq_romaji', 'か', 'ka'), 'か'],
    ['the kanji prompt of a meaning question', q('kanji_meaning_mcq', '日', 'day'), '日'],
    ['the kanji answer of a listening question', q('kanji_listen', 'にほん', '日'), '日'],
  ])('finds %s', (_name, question, char) => {
    expect(cardChar(question)).toBe(char)
  })
})
