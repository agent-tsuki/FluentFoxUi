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
    expect(built.questions.map((x) => x.kind)).toEqual(['choice', 'choice', 'text', 'choice'])
    expect(built.cards.size).toBe(4)
  })

  it('shows the gap in the sentence, with the English and the why', () => {
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

describe('chapter exercise questions', () => {
  const built = chapterTestQuestions(
    session([
      q('exercise_true_false', 'Ana is a student.', 'True', {
        item_type: 'grammar_exercise',
        options: ['False', 'True'],
        exercise: { lines: ['A: 学生ですか。', 'B: はい。'] },
        sentence: { filled: 'Ana is a student.', explanation: 'はい means yes.' },
      }),
      q('exercise_transform', 'わたしは学生{}。', 'じゃありません', {
        item_type: 'grammar_exercise',
        accepted_answers: ['ではありません'],
        exercise: { source: 'わたしは学生です。', task: 'Make it negative.' },
      }),
      q('exercise_word_choice', '{}を読みます。', '本', { item_type: 'grammar_exercise', options: ['本', '水', '駅', '山'] }),
    ]),
  )

  it('asks true/false about the exchange, with True always first', () => {
    const [question] = built.questions
    expect(question.prompt).toEqual({ type: 'exchange', lines: ['A: 学生ですか。', 'B: はい。'], statement: 'Ana is a student.' })
    expect(question.kind === 'choice' && question.options).toEqual(['True', 'False'])
    expect(question.explanation).toBe('はい means yes.')
  })

  it('types the changed form, accepting every spelling the server does', () => {
    const question = built.questions[1]
    expect(question.source).toBe('わたしは学生です。')
    expect(question.instruction).toBe('Make it negative.')
    expect(question.kind === 'text' && question.accepted).toEqual(['じゃありません', 'ではありません'])
  })

  it('offers the word exercise as Japanese choices around the gap', () => {
    const question = built.questions[2]
    expect(question.prompt).toEqual({ type: 'gap', before: '', after: 'を読みます。' })
    expect(question.kind === 'choice' && question.optionsJa).toBe(true)
  })

  it('sends a true/false answer as the option picked', () => {
    expect(chapterAnswer(built.questions[0], 'False')).toEqual({ chosen_option: 'False', options: ['True', 'False'] })
  })

  const more = chapterTestQuestions(
    session([
      q('exercise_order', 'This is a book.', 'これは本です', { item_type: 'grammar_exercise', exercise: { tiles: ['本', 'は', 'これ', 'です'] } }),
      q('exercise_listen', '私[わたし] は 学生[がくせい] です。', 'I am a student.', { item_type: 'grammar_exercise', options: ['I am a student.', 'No.'], exercise: { voice: 'f1' } }),
      q('exercise_reply', 'これは何ですか。', 'それは本です。', { item_type: 'grammar_exercise', options: ['それは本です。', 'はい。'], sentence: { filled: '', explanation: 'That is a book.' } }),
      q('exercise_reading', 'What does Lin do?', 'A student', { item_type: 'grammar_exercise', options: ['A student', 'A doctor'], exercise: { lines: ['リンです。', '学生です。'] } }),
    ]),
  )

  it('builds word tiles and sends the joined order as typed text', () => {
    const [order] = more.questions
    expect(order.kind === 'tiles' && order.tiles).toEqual(['本', 'は', 'これ', 'です'])
    expect(chapterAnswer(order, 'これは本です')).toEqual({ answer_text: 'これは本です' })
  })

  it('plays the listening line in its voice, without the reading marks', () => {
    const prompt = more.questions[1].prompt
    expect(prompt.type).toBe('audio')
    expect(prompt.type === 'audio' && prompt.voice).toBe('f1')
    expect(prompt.type === 'audio' && prompt.text).not.toContain('[')
  })

  it('asks a reply in Japanese and a reading question about its passage', () => {
    expect(more.questions[2].prompt).toEqual({ type: 'sentence', text: 'これは何ですか。' })
    expect(more.questions[3].prompt).toEqual({ type: 'exchange', lines: ['リンです。', '学生です。'], statement: 'What does Lin do?' })
  })
})
