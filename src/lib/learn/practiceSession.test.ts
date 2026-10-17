import { describe, expect, it } from 'vitest'
import {
  cardKey,
  finalTestRequest,
  focusChars,
  kanaPracticeRequest,
  kanaQuizAnswer,
  kanjiPracticeRequest,
  kanjiQuestionType,
  kanjiQuizFacet,
  kanjiQuizKindOf,
  kanjiTrack,
  prioritise,
  skipTestRequest,
  testOutcome,
  unitQuizRequest,
  type KanjiQuizKind,
} from '@/lib/learn/practiceSession'
import type { LearnQuestion, QuestionType, SessionResult } from '@/types/learn'

function question(char: string, facet: LearnQuestion['facet'] = 'recognition', withChar = true): LearnQuestion {
  return {
    card_id: `card-${char}-${facet}`,
    item_type: facet === 'recognition' ? 'kana' : 'kanji',
    item_id: `item-${char}`,
    facet,
    question_type: 'kana_mcq_romaji',
    prompt: char,
    correct_answer: 'x',
    ...(withChar ? { char } : {}),
  }
}

function result(extra: Partial<SessionResult> = {}): SessionResult {
  return {
    session: { id: 's', kind: 'unit_quiz', track: 'hiragana', scope: 'ka', started_at: '', completed_at: '' },
    answer_count: 4,
    correct_count: 3,
    active_ms: 1000,
    counts: { strong: 0, good: 3, shaky: 0, missed: 1 },
    cards: [],
    ...extra,
  }
}

describe('kanaPracticeRequest', () => {
  it.each([
    ['listen', 'weak'],
    ['build', 'weak'],
    ['speed', 'speed'],
    ['lookalike', 'lookalike'],
    ['match', 'match'],
  ] as const)('practises the whole track in %s mode with the API mode %s', (mode, apiMode) => {
    expect(kanaPracticeRequest('katakana', mode)).toEqual({ track: 'katakana', mode: apiMode })
  })

  it('asks for the unit cards whatever the mode when a unit is given', () => {
    expect(kanaPracticeRequest('hiragana', 'speed', 'ka')).toEqual({ track: 'hiragana', mode: 'unit', unit: 'ka' })
    expect(kanaPracticeRequest('hiragana', 'listen', 'ka')).toEqual({ track: 'hiragana', mode: 'unit', unit: 'ka' })
  })
})

describe('kanjiPracticeRequest', () => {
  it('drills look-alikes with the lookalike mode and the rest with the weakest cards', () => {
    expect(kanjiPracticeRequest('kanji_n5', 'lookalikes')).toEqual({ track: 'kanji_n5', mode: 'lookalike' })
    expect(kanjiPracticeRequest('kanji_n5', 'meaning')).toEqual({ track: 'kanji_n5', mode: 'weak' })
  })

  it('asks for the unit cards when a unit is given', () => {
    expect(kanjiPracticeRequest('kanji_n5', 'reading', 'u01')).toEqual({ track: 'kanji_n5', mode: 'unit', unit: 'u01' })
  })

  it('drills one mix-up pair in the look-alike mode', () => {
    expect(kanjiPracticeRequest('kanji_n5', 'lookalikes', undefined, '日:目')).toEqual({ track: 'kanji_n5', mode: 'lookalike', pair: '日:目' })
  })

  it('ignores a pair outside the look-alike mode', () => {
    expect(kanjiPracticeRequest('kanji_n5', 'meaning', undefined, '日:目')).toEqual({ track: 'kanji_n5', mode: 'weak' })
  })
})

describe('kanaPracticeRequest with a pair', () => {
  it('sends the pair to the look-alike drill', () => {
    expect(kanaPracticeRequest('hiragana', 'lookalike', undefined, 'ぬ:め')).toEqual({ track: 'hiragana', mode: 'lookalike', pair: 'ぬ:め' })
  })

  it('prefers the unit over a pair', () => {
    expect(kanaPracticeRequest('hiragana', 'lookalike', 'na', 'ぬ:め')).toEqual({ track: 'hiragana', mode: 'unit', unit: 'na' })
  })
})

describe('kanjiTrack', () => {
  it('maps N5 to its track and other levels to none', () => {
    expect(kanjiTrack('n5')).toBe('kanji_n5')
    expect(kanjiTrack('n4')).toBeNull()
  })
})

describe('test requests', () => {
  it('scopes a unit quiz to the unit slug, a skip test to its group and the final test to everything', () => {
    expect(unitQuizRequest('hiragana', 'ka')).toEqual({ kind: 'unit_quiz', track: 'hiragana', scope: 'ka' })
    expect(skipTestRequest('katakana', 'dakuten')).toEqual({ kind: 'skip', track: 'katakana', scope: 'dakuten' })
    expect(finalTestRequest('kanji_n5')).toEqual({ kind: 'final', track: 'kanji_n5', scope: 'all' })
  })
})

describe('focusChars', () => {
  it('lists each item once in the server order, falling back to the prompt without char', () => {
    const qs = [question('日', 'meaning'), question('月', 'meaning'), question('日', 'reading'), question('か', 'recognition', false)]
    expect(focusChars(qs)).toEqual(['日', '月', 'か'])
  })
})

describe('prioritise', () => {
  it('keeps the focus order, drops ids outside the pool and duplicates, and stops at the limit', () => {
    expect(prioritise(['ki', 'zz', 'ka', 'ki', 'ku'], ['ka', 'ki', 'ku'], 2)).toEqual(['ki', 'ka'])
  })

  it('returns nothing when the server picked nothing', () => {
    expect(prioritise([], ['ka'], 10)).toEqual([])
  })
})

describe('cardKey', () => {
  it('tells the meaning and reading cards of a kanji apart', () => {
    expect(cardKey('日', 'meaning')).not.toBe(cardKey('日', 'reading'))
  })
})

describe('kanaQuizAnswer', () => {
  const ka = { character: 'か', romaji: 'ka' }
  const ki = { character: 'き', romaji: 'ki' }

  it('sends the romaji for a read question', () => {
    expect(kanaQuizAnswer('read', ki, [ka, ki])).toEqual({
      type: 'kana_mcq_romaji',
      given: { chosen_option: 'ki', options: ['ka', 'ki'] },
    })
  })

  it.each([
    ['find', 'kana_mcq_kana'],
    ['listen', 'kana_listen'],
  ] as const)('sends the kana for a %s question', (kind, type) => {
    expect(kanaQuizAnswer(kind, ka, [ka, ki])).toEqual({ type, given: { chosen_option: 'か', options: ['か', 'き'] } })
  })

  it('sends the mark itself for a right loanword answer and the picked spelling for a wrong one', () => {
    const word = { character: 'コーヒー', romaji: 'koohii' }
    const wrong = { character: 'コヒー', romaji: 'koohii' }
    expect(kanaQuizAnswer('find', word, [word, wrong], { char: 'ー', correct: true })).toEqual({
      type: 'kana_mcq_kana',
      given: { chosen_option: 'ー' },
    })
    expect(kanaQuizAnswer('find', wrong, [word, wrong], { char: 'ー', correct: false }).given).toEqual({ chosen_option: 'コヒー' })
  })
})

describe('kanji question types', () => {
  it.each<[KanjiQuizKind, boolean, QuestionType]>([
    ['meaning', false, 'kanji_meaning_mcq'],
    ['meaning', true, 'kanji_meaning_typed'],
    ['reading', false, 'kanji_reading_mcq'],
    ['reading', true, 'kanji_reading_typed'],
    ['listen', false, 'kanji_listen'],
    ['kanji', false, 'kanji_lookalike'],
  ])('maps %s (typed: %s) to %s and back', (kind, typed, type) => {
    expect(kanjiQuestionType(kind, typed)).toBe(type)
    expect(kanjiQuizKindOf(type)).toEqual({ kind, typed })
  })

  it('has no kanji kind for a kana question type', () => {
    expect(kanjiQuizKindOf('kana_mcq_kana')).toBeNull()
  })

  it('feeds listening and reading answers to the reading card, the rest to the meaning card', () => {
    expect(kanjiQuizFacet('reading')).toBe('reading')
    expect(kanjiQuizFacet('listen')).toBe('reading')
    expect(kanjiQuizFacet('meaning')).toBe('meaning')
    expect(kanjiQuizFacet('kanji')).toBe('meaning')
  })
})

describe('testOutcome', () => {
  it("uses the server's test score", () => {
    const outcome = testOutcome(result({ test: { kind: 'unit_quiz', score: 4, total: 5, passed: true, pass_mark: 0.8 } }), 0.9)
    expect(outcome).toEqual({ kind: 'unit_quiz', correct: 4, total: 5, score: 0.8, passed: true })
  })

  it('falls back to the answer counts over at least the question count without a test block', () => {
    const outcome = testOutcome(result(), 0.5, 6)
    expect(outcome).toEqual({ kind: null, correct: 3, total: 6, score: 0.5, passed: true })
  })

  it('never passes an empty test', () => {
    const outcome = testOutcome(result({ answer_count: 0, correct_count: 0 }), 0)
    expect(outcome.passed).toBe(false)
    expect(outcome.score).toBe(0)
  })
})
