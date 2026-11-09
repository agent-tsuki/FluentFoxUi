import { describe, expect, it } from 'vitest'
import { chapterPracticeSets } from './chapterPractice'
import { markTestAnswer } from '@/lib/testCenter/mark'
import type { TestQuestion, TilesQuestion } from '@/lib/testCenter/types'
import type { ChapterContent } from '@/types/grammar'

const word = (w: string, kana = w, meaning = `m-${w}`) => ({ word: w, kana, romaji: 'x', meaning })
const line = (text: string, translation: string, speaker = 0) => ({ speaker, text, translation })

const content: ChapterContent = {
  slug: 'ch1',
  number: 1,
  title: 't',
  sentences: [],
  words: [word('学生', 'がくせい'), word('先生', 'せんせい'), word('本', 'ほん'), word('車', 'くるま'), word('犬', 'いぬ'), word('～人', 'じん')],
  passages: [
    {
      kind: 'dialogue',
      title: 'p',
      speakers: ['ア', 'イ'],
      speaker_voices: ['f1', 'm1'],
      lines: [
        line('私[わたし] は 学生[がくせい] です。', 'I am a student.'),
        line('あれ は 本[ほん] です か。', 'Is that a book?', 1),
        line('はい、 本[ほん] です。 どうぞ。', 'Yes, a book. Here.'),
        line('犬[いぬ] が います。', 'There is a dog.', 1),
      ],
    },
  ],
  gaps: [{ sentence: 'わたし{}学生です。', answer: 'は', distractors: ['を', 'へ', 'で'], translation: 'I am a student.', explanation: 'e' }],
  true_false: [{ lines: ['A: a', 'B: b'], statement: 's', answer: false, explanation: 'e' }],
  transforms: [{ source: '学生です。', task: 'Make it negative.', sentence: '学生{}。', answer: 'じゃありません', also_accept: ['ではありません'], explanation: 'e' }],
  pictures: [{ image: '/exercises/a.jpg', alt: 'a', sentence: '箱の{}です。', answer: '上', options: ['上', '下', '中', '前'], translation: 't' }],
}

const seeded = () => {
  let x = 7
  return () => (x = (x * 16807) % 2147483647) / 2147483647
}
const set = (c: ChapterContent, id: string) => chapterPracticeSets(c).find((s) => s.id === id)
const build = (id: string): TestQuestion[] => {
  const found = set(content, id)
  if (!found) throw new Error(`no ${id}`)
  return found.build(seeded())
}

describe('chapterPracticeSets', () => {
  it('offers every exercise the chapter has material for', () => {
    expect(chapterPracticeSets(content).map((s) => s.id)).toEqual([
      'vocab-meaning', 'vocab-word', 'vocab-kana', 'vocab-type', 'vocab-context',
      'check', 'fix', 'gap-typed', 'true-false', 'read', 'picture',
      'hear-word', 'listen', 'listen-tiles', 'dictation',
      'say', 'tiles', 'change', 'write',
      'review',
    ])
  })

  it('leaves out what a chapter has no material for', () => {
    const bare = { ...content, pictures: [], passages: [], true_false: [] }
    const ids = chapterPracticeSets(bare).map((s) => s.id)
    expect(ids).not.toContain('picture')
    expect(ids).not.toContain('listen')
    expect(ids).not.toContain('tiles')
    expect(ids).not.toContain('true-false')
  })

  it('never asks a suffix like ～人 as a word', () => {
    expect(build('vocab-meaning').map((q) => q.answer)).not.toContain('m-～人')
    expect(build('vocab-word').map((q) => q.answer)).not.toContain('～人')
  })

  it('asks at least 10 words a round when the chapter has them, and offers larger rounds', () => {
    const many = { ...content, words: Array.from({ length: 16 }, (_, i) => word(`語${i}`, `ご${i}`)) }
    const round = set(many, 'vocab-meaning')
    expect(round?.build(seeded())).toHaveLength(10)
    expect(round?.sizes).toEqual([10, 15])
    expect(round?.build(seeded(), 15)).toHaveLength(15)
    expect(set(many, 'vocab-word')?.build(seeded())).toHaveLength(10)
  })

  it('uses the written sentences for the word bank, one question each', () => {
    const written = Array.from({ length: 10 }, (_, i) => ({ sentence: `これは{}${i}です。`, answer: `語${i}`, translation: `t${i}` }))
    const round = set({ ...content, word_sentences: written }, 'vocab-context')
    expect(round?.wordBank).toBe(true)
    const questions = round?.build(seeded()) ?? []
    expect(questions).toHaveLength(10)
    expect(new Set(questions.map((q) => q.answer)).size).toBe(10)
    expect(questions[0].prompt.type).toBe('gap')
  })

  it('still drags words into blanks when the API has no written sentences yet', () => {
    const round = set(content, 'vocab-context')
    expect(round?.wordBank).toBe(true)
    expect(round?.build(seeded()).filter((q) => q.kind === 'select').length).toBeGreaterThan(0)
  })

  it('gives four different options including the answer', () => {
    for (const q of build('vocab-meaning')) {
      if (q.kind !== 'choice') throw new Error('choice')
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.answer)
    }
  })

  it('blanks a word in a real sentence', () => {
    const q = build('vocab-context').find((x) => x.prompt.type === 'gap' && x.answer === '学生')
    expect(q?.prompt).toEqual({ type: 'gap', before: '私は', after: 'です。' })
  })

  it('keeps tiles to one plain sentence and marks the right order', () => {
    const questions = build('tiles') as TilesQuestion[]
    expect(questions.map((q) => q.answer)).not.toContain('はい、本です。どうぞ。')
    const q = questions.find((x) => x.answer === '私は学生です。')
    expect(q).toBeDefined()
    if (!q) return
    expect([...q.tiles].sort()).toEqual(['です', '学生', '私', 'は'].sort())
    expect(q.tiles.join('')).not.toBe('私は学生です')
    expect(markTestAnswer(q, '私は学生です').correct).toBe(true)
    expect(markTestAnswer(q, '学生は私です').correct).toBe(false)
  })

  it('accepts a written sentence in kana, kanji, romaji, or without 私は', () => {
    const q = build('write').find((x) => x.answer === '私は学生です。')
    if (!q) throw new Error('no question')
    for (const typed of ['私は学生です', 'わたしはがくせいです。', 'watashi wa gakusei desu', 'がくせいです']) {
      expect(markTestAnswer(q, typed).correct).toBe(true)
    }
    expect(markTestAnswer(q, 'せんせいです').correct).toBe(false)
  })

  it('speaks a line in its voice, using what it should say', () => {
    const c = { ...content, passages: [{ ...content.passages![0], lines: content.passages![0].lines.map((l) => ({ ...l, say: `say-${l.translation}` })) }] }
    const q = set(c, 'listen')?.build(seeded())[0]
    expect(q?.prompt.type).toBe('audio')
    if (q?.prompt.type === 'audio') {
      expect(q.prompt.text).toMatch(/^say-/)
      expect(['f1', 'm1']).toContain(q.prompt.voice)
    }
  })

  it('marks a change-the-form answer, with its other spelling', () => {
    const [q] = build('change')
    expect(q.source).toBe('学生です。')
    expect(markTestAnswer(q, 'ではありません').correct).toBe(true)
    expect(markTestAnswer(q, 'jaarimasen').correct).toBe(true)
    expect(markTestAnswer(q, 'です').correct).toBe(false)
  })

  it('mixes 5 to 10 questions of every kind in a review', () => {
    const questions = build('review')
    expect(questions.length).toBeGreaterThanOrEqual(5)
    expect(questions.length).toBeLessThanOrEqual(10)
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
    expect(new Set(questions.map((q) => q.label)).size).toBeGreaterThanOrEqual(5)
  })

  it('offers between 10 and 20 different exercises for a full chapter', () => {
    const n = chapterPracticeSets(content).filter((x) => x.id !== 'review').length
    expect(n).toBeGreaterThanOrEqual(10)
    expect(n).toBeLessThanOrEqual(20)
  })

  it('marks its own answer right in every exercise', () => {
    for (const s of chapterPracticeSets(content)) {
      for (const q of s.build(seeded())) {
        const given = q.kind === 'tiles' ? q.accepted[0] : q.answer
        expect(markTestAnswer(q, given).correct, `${s.id}: ${q.id}`).toBe(true)
        if (q.kind === 'choice' || q.kind === 'select') expect(q.options, `${s.id}: ${q.id}`).toContain(q.answer)
      }
    }
  })

  it('asks readings only of words written in kanji, and accepts them in romaji', () => {
    const qs = build('vocab-type')
    expect(qs.length).toBeGreaterThan(0)
    for (const q of qs) {
      expect(q.prompt.type === 'glyph' && q.prompt.text).not.toBe(q.answer)
    }
    const kana = build('vocab-kana')
    expect(kana.every((q) => q.kind === 'choice' && new Set(q.options).size === q.options.length)).toBe(true)
  })

  it('fixes a gap filled with a wrong option', () => {
    const [q] = build('fix')
    expect(q.prompt).toMatchObject({ type: 'sentence' })
    expect(q.prompt.type === 'sentence' && q.prompt.text).not.toContain('{}')
    expect(q.answer).toMatch(/→ は$/)
    expect(q.prompt.type === 'sentence' && q.prompt.text).not.toBe('わたしは学生です。')
  })

  it('types a gap without options', () => {
    const [q] = build('gap-typed')
    expect(q.kind).toBe('text')
    expect(markTestAnswer(q, 'wa').correct).toBe(true)
  })

  it('plays audio for the listening exercises', () => {
    for (const id of ['hear-word', 'listen-tiles', 'dictation']) {
      const qs = build(id)
      expect(qs.length, id).toBeGreaterThan(0)
      expect(qs.every((q) => q.prompt.type === 'audio'), id).toBe(true)
    }
  })

  it('accepts a dictation in hiragana', () => {
    const q = build('dictation').find((x) => x.answer === '私は学生です。')
    if (!q) return
    expect(markTestAnswer(q, 'わたしはがくせいです').correct).toBe(true)
  })

  describe('grammar gaps made from the sentences, when a chapter has none written', () => {
    const plain = { ...content, gaps: [], true_false: [], transforms: [], pictures: [] }
    const qs = (id: string) => set(plain, id)?.build(seeded()) ?? []

    it('still offers the grammar exercises', () => {
      const ids = chapterPracticeSets(plain).map((s) => s.id)
      expect(ids).toEqual(expect.arrayContaining(['check', 'fix', 'gap-typed']))
    })

    it('blanks a demonstrative and asks これ or この', () => {
      const fromLine = qs('check').filter((x) => x.translation === 'Is that a book?')
      expect(fromLine.map((x) => x.answer).sort()).toEqual(['あれ', 'は'].sort())
      const q = fromLine.find((x) => x.answer === 'あれ')
      expect(q?.kind === 'select' && [...q.options].sort()).toEqual(['あの', 'あれ'].sort())
    })

    it('never offers two particles that could both be right', () => {
      for (const q of qs('check')) {
        if (q.kind !== 'select') continue
        if (['は', 'が', 'も'].includes(q.answer)) expect(q.options.filter((o) => ['は', 'が', 'も'].includes(o))).toEqual([q.answer])
        if (['に', 'へ'].includes(q.answer)) expect(q.options.filter((o) => ['に', 'へ'].includes(o))).toEqual([q.answer])
      }
    })

    it('says why after answering, and marks its own answer right', () => {
      for (const id of ['check', 'fix', 'gap-typed']) {
        for (const q of qs(id)) {
          expect(q.explanation, id).toBeTruthy()
          expect(markTestAnswer(q, q.answer).correct, id).toBe(true)
        }
      }
    })
  })
})

