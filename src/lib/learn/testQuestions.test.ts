import { describe, expect, it } from 'vitest'
import type { KanaChar } from '@/types'
import type { KanjiEntry } from '@/types/kanji'
import type { AnswerRequestItem, LearnQuestion, QuestionType, SessionStart } from '@/types/learn'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import type { GivenAnswer } from '@/lib/learn/practiceSession'
import { kanaTestQuestions, saveKanaTestAnswer } from '@/components/kanaQuiz/testQuestions'
import { kanjiTestQuestions, saveKanjiTestAnswer } from '@/components/kanjiQuiz/testQuestions'

const KANA: KanaChar[] = [
  { id: 'a', character: 'あ', romaji: 'a', type: 'basic' },
  { id: 'i', character: 'い', romaji: 'i', type: 'basic' },
  { id: 'u', character: 'う', romaji: 'u', type: 'basic' },
  { id: 'e', character: 'え', romaji: 'e', type: 'basic' },
  { id: 'o', character: 'お', romaji: 'o', type: 'basic' },
]

function entry(char: string, meaning: string, on: string): KanjiEntry {
  return {
    char,
    jlpt: 'n5',
    unitId: 'u01',
    meanings: [meaning],
    on: [on],
    kun: [],
    keyReading: { type: 'on', kana: on },
    parts: [],
    vocab: [],
    strokes: 4,
  }
}

const KANJI = [entry('日', 'day', 'ニチ'), entry('月', 'moon', 'ゲツ'), entry('火', 'fire', 'カ'), entry('水', 'water', 'スイ')]
const BY_CHAR = new Map(KANJI.map((e) => [e.char, e]))

function q(char: string, facet: LearnQuestion['facet'], type: QuestionType): LearnQuestion {
  return {
    card_id: `card-${char}-${facet}`,
    item_type: facet === 'recognition' ? 'kana' : 'kanji',
    item_id: `item-${char}`,
    facet,
    question_type: type,
    prompt: char,
    correct_answer: char,
    char,
  }
}

function session(questions: LearnQuestion[]): SessionStart {
  return { session: { id: 's1', kind: 'unit_quiz', track: 'hiragana', scope: 'a', started_at: '' }, questions }
}

/** A timer stand-in whose payload carries what the caller gave it. */
const timer = {
  buildAnswer: (d: { card_id: string; question_type: QuestionType } & GivenAnswer) => ({ ...d }) as unknown as AnswerRequestItem,
} as AnswerTimerControls

type Saved = { card: string; type: QuestionType; given: GivenAnswer }

function collector() {
  const saved: Saved[] = []
  const answerCard = (card: LearnQuestion, type: QuestionType, given: GivenAnswer) => {
    saved.push({ card: card.card_id, type, given })
  }
  return { saved, answerCard }
}

describe('kanaTestQuestions', () => {
  it('asks each kana the server asks once, in its order, and skips kana the chart lacks', () => {
    const built = kanaTestQuestions(
      session([q('う', 'recognition', 'kana_mcq_romaji'), q('あ', 'recognition', 'kana_mcq_kana'), q('ゐ', 'recognition', 'kana_mcq_kana'), q('う', 'recognition', 'kana_mcq_kana')]),
      KANA,
      { speech: false },
    )
    expect(built.questions.map((x) => x.target.id)).toEqual(['u', 'a'])
    expect(built.cards.get('u')?.card_id).toBe('card-う-recognition')
  })

  it('saves an answer on the card of the question, as the type it was shown as', () => {
    const built = kanaTestQuestions(session([q('あ', 'recognition', 'kana_mcq_romaji')]), KANA, { speech: false })
    const question = built.questions[0]!
    const picked = question.options.find((o) => o.id !== 'a')!
    const { saved, answerCard } = collector()
    saveKanaTestAnswer(answerCard, built.cards, question, picked, timer)
    const value = question.kind === 'read' ? picked.romaji : picked.character
    expect(saved).toEqual([
      {
        card: 'card-あ-recognition',
        type: question.kind === 'read' ? 'kana_mcq_romaji' : 'kana_mcq_kana',
        given: { chosen_option: value, options: question.options.map((o) => (question.kind === 'read' ? o.romaji : o.character)) },
      },
    ])
  })
})

describe('kanjiTestQuestions', () => {
  it("builds one question per server question, shown as the server's type", () => {
    const built = kanjiTestQuestions(
      session([q('日', 'meaning', 'kanji_meaning_typed'), q('日', 'reading', 'kanji_reading_mcq'), q('月', 'reading', 'kanji_listen'), q('龍', 'meaning', 'kanji_meaning_mcq')]),
      BY_CHAR,
      KANJI,
    )
    expect(built.questions.map((x) => [x.target.char, x.kind, x.answerKind])).toEqual([
      ['日', 'meaning', 'typed'],
      ['日', 'reading', 'choice'],
      ['月', 'listen', 'choice'],
    ])
    expect(built.cards.size).toBe(3)
  })

  it("applies the learner's typed / choice choice to meaning and reading questions only", () => {
    const built = kanjiTestQuestions(session([q('日', 'meaning', 'kanji_meaning_mcq'), q('火', 'meaning', 'kanji_lookalike')]), BY_CHAR, KANJI, 'typed')
    expect(built.questions.map((x) => x.answerKind)).toEqual(['typed', 'choice'])
  })

  it('saves a typed answer as text and a choice as the picked option', () => {
    const built = kanjiTestQuestions(session([q('日', 'meaning', 'kanji_meaning_typed'), q('水', 'reading', 'kanji_reading_mcq')]), BY_CHAR, KANJI)
    const [typed, choice] = built.questions
    const { saved, answerCard } = collector()
    saveKanjiTestAnswer(answerCard, built.cards, typed!, 'sun', timer)
    saveKanjiTestAnswer(answerCard, built.cards, choice!, 'スイ', timer)
    expect(saved).toEqual([
      { card: 'card-日-meaning', type: 'kanji_meaning_typed', given: { answer_text: 'sun' } },
      { card: 'card-水-reading', type: 'kanji_reading_mcq', given: { chosen_option: 'スイ', options: choice!.options } },
    ])
  })
})
