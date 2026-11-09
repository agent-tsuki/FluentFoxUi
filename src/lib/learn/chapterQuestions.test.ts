import { describe, expect, it } from 'vitest'
import { chapterAnswer, chapterTestQuestions } from '@/lib/learn/chapterQuestions'
import type { LearnQuestion, QuestionType, SessionStart } from '@/types/learn'

function q(type: QuestionType, prompt: string, answer: string, extra: Partial<LearnQuestion> = {}): LearnQuestion {
  return {
    card_id: `card-${type}`,
    item_type: 'grammar_sentence',
    item_id: 'i',
    facet: 'recognition',
    question_type: type,
    prompt,
    correct_answer: answer,
    ...extra,
  }
}

function session(questions: LearnQuestion[]): SessionStart {
  return { session: { id: 's1' }, questions } as unknown as SessionStart
}

describe('chapterTestQuestions', () => {
  const built = chapterTestQuestions(
    session([
      q('vocab_meaning_mcq', '駅', 'station', { options: ['station', 'train'] }),
      q('grammar_gap_mcq', '電車{}行きます。', 'で', {
        options: ['で', 'を'],
        sentence: { filled: '電車で行きます。', translation: 'I go by train.', explanation: 'で marks the means.' },
      }),
      q('grammar_gap_typed', 'わたし{}学生です。', 'は', { accepted_answers: [] }),
      q('grammar_translate_mcq', 'わたしは学生です。', 'I am a student.', { options: ['I am a student.', 'I go.'] }),
      q('kana_mcq_romaji', 'か', 'ka'),
    ]),
  )

  it('keeps the chapter questions and skips any other type', () => {
    expect(built.questions.map((x) => x.kind)).toEqual(['choice', 'select', 'text', 'choice'])
    expect(built.cards.size).toBe(4)
  })

  it('puts the dropdown in the sentence, with the English and the why', () => {
    const gap = built.questions[1]
    expect(gap.prompt).toEqual({ type: 'gap', before: '電車', after: '行きます。' })
    expect(gap.translation).toBe('I go by train.')
    expect(gap.explanation).toBe('で marks the means.')
  })

  it('maps each runner question back to its server card', () => {
    for (const question of built.questions) expect(built.cards.get(question.id)?.correct_answer).toBe(question.answer)
  })

  it('sends typed romaji for a gap as kana, the way the server compares it', () => {
    expect(chapterAnswer(built.questions[2], 'wa')).toEqual({ answer_text: 'わ' })
    expect(chapterAnswer(built.questions[2], 'は')).toEqual({ answer_text: 'は' })
  })

  it('sends a choice with the options shown', () => {
    expect(chapterAnswer(built.questions[0], 'station')).toEqual({ chosen_option: 'station', options: ['station', 'train'] })
  })
})
