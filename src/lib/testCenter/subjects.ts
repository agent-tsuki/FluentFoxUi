import type { AnswerKind, TestFormatId, TestSubjectId } from './types'

/** A mini picture of a format on its card: the prompt, then what the learner does. */
export interface FormatPreview {
  prompt: string
  promptJa: boolean
  /** Choice / select: the options shown; text: the placeholder. */
  answer: string
  answerJa: boolean
}

export interface TestFormatDef {
  id: TestFormatId
  title: string
  summary: string
  answer: AnswerKind
  preview: FormatPreview
  /** Rough seconds per question (for the time estimate). */
  seconds: number
}

export interface TestSubjectDef {
  id: TestSubjectId
  title: string
  /** A single character that stands for the subject on its card. */
  glyph: string
  summary: string
  /** Two or three words under the title on a compact tile. */
  tagline: string
  /** What the level picker chooses: a kana script or a JLPT level. */
  levelLabel: string
  /** What one scope item is called, e.g. "row", "unit", "chapter". */
  scopeNoun: { one: string; many: string }
  formats: readonly TestFormatDef[]
}

export const ANSWER_LABEL: Record<AnswerKind, { label: string; icon: string }> = {
  choice: { label: 'Multiple choice', icon: 'checklist' },
  select: { label: 'Dropdown', icon: 'unfold_more' },
  text: { label: 'Typed', icon: 'edit' },
}

export const TEST_SUBJECTS: readonly TestSubjectDef[] = [
  {
    id: 'kana',
    title: 'Kana',
    tagline: 'Hiragana & katakana',
    glyph: 'あ',
    summary: 'Hiragana and katakana: read them and write the romaji.',
    levelLabel: 'Script',
    scopeNoun: { one: 'row', many: 'rows' },
    formats: [
      {
        id: 'kana-romaji',
        title: 'Read the kana',
        summary: 'See a kana, pick its romaji.',
        answer: 'choice',
        preview: { prompt: 'か', promptJa: true, answer: 'ka · ki · sa · ta', answerJa: false },
        seconds: 6,
      },
      {
        id: 'kana-pick',
        title: 'Find the kana',
        summary: 'See the romaji, pick the kana.',
        answer: 'choice',
        preview: { prompt: 'shi', promptJa: false, answer: 'し · つ · さ · ち', answerJa: true },
        seconds: 6,
      },
      {
        id: 'kana-typed',
        title: 'Type the romaji',
        summary: 'See a kana, type how it sounds.',
        answer: 'text',
        preview: { prompt: 'ふ', promptJa: true, answer: 'fu', answerJa: false },
        seconds: 9,
      },
    ],
  },
  {
    id: 'kanji',
    title: 'Kanji',
    tagline: 'Characters & meaning',
    glyph: '漢',
    summary: 'Meanings and readings of the kanji in your level.',
    levelLabel: 'Level',
    scopeNoun: { one: 'unit', many: 'units' },
    formats: [
      {
        id: 'kanji-meaning',
        title: 'Meaning',
        summary: 'See a kanji, pick its meaning.',
        answer: 'choice',
        preview: { prompt: '水', promptJa: true, answer: 'water · fire · tree', answerJa: false },
        seconds: 8,
      },
      {
        id: 'kanji-reading',
        title: 'Reading',
        summary: 'See a kanji, pick its reading.',
        answer: 'choice',
        preview: { prompt: '山', promptJa: true, answer: 'やま · かわ · た', answerJa: true },
        seconds: 8,
      },
      {
        id: 'kanji-pick',
        title: 'Find the kanji',
        summary: 'See a meaning, pick the kanji (look-alikes included).',
        answer: 'choice',
        preview: { prompt: 'person', promptJa: false, answer: '人 · 入 · 八', answerJa: true },
        seconds: 8,
      },
      {
        id: 'kanji-typed-meaning',
        title: 'Type the meaning',
        summary: 'See a kanji, type its meaning in English.',
        answer: 'text',
        preview: { prompt: '火', promptJa: true, answer: 'fire', answerJa: false },
        seconds: 12,
      },
      {
        id: 'kanji-typed-reading',
        title: 'Type the reading',
        summary: 'See a kanji, type a reading in romaji or kana.',
        answer: 'text',
        preview: { prompt: '月', promptJa: true, answer: 'tsuki', answerJa: false },
        seconds: 12,
      },
    ],
  },
  {
    id: 'vocab',
    title: 'Vocabulary',
    tagline: 'Words & readings',
    glyph: '語',
    summary: 'Words built from your level’s kanji.',
    levelLabel: 'Level',
    scopeNoun: { one: 'unit', many: 'units' },
    formats: [
      {
        id: 'vocab-meaning',
        title: 'Word → meaning',
        summary: 'See a word, pick what it means.',
        answer: 'choice',
        preview: { prompt: '学生', promptJa: true, answer: 'student · teacher', answerJa: false },
        seconds: 8,
      },
      {
        id: 'vocab-word',
        title: 'Meaning → word',
        summary: 'See the English, pick the Japanese word.',
        answer: 'choice',
        preview: { prompt: 'tomorrow', promptJa: false, answer: '明日 · 今日 · 昨日', answerJa: true },
        seconds: 8,
      },
      {
        id: 'vocab-typed-reading',
        title: 'Type the reading',
        summary: 'See a word, type its reading in romaji or kana.',
        answer: 'text',
        preview: { prompt: '先生', promptJa: true, answer: 'sensei', answerJa: false },
        seconds: 12,
      },
    ],
  },
  {
    id: 'grammar',
    title: 'Grammar',
    tagline: 'Rules & patterns',
    glyph: '文',
    summary: 'Particles, verb forms and patterns, in real sentences.',
    levelLabel: 'Level',
    scopeNoun: { one: 'chapter', many: 'chapters' },
    formats: [
      {
        id: 'grammar-gap',
        title: 'Fill the gap',
        summary: 'Pick the missing word from a dropdown in the sentence.',
        answer: 'select',
        preview: { prompt: 'わたし ＿ 学生です', promptJa: true, answer: 'は ▾', answerJa: true },
        seconds: 12,
      },
      {
        id: 'grammar-typed',
        title: 'Type the missing word',
        summary: 'Type the particle or ending yourself, in kana or romaji.',
        answer: 'text',
        preview: { prompt: '駅 ＿ 新聞を買います', promptJa: true, answer: 'de', answerJa: false },
        seconds: 16,
      },
      {
        id: 'grammar-meaning',
        title: 'What does it mean?',
        summary: 'Read a whole sentence, pick its English.',
        answer: 'choice',
        preview: { prompt: '雨が降っても行きます', promptJa: true, answer: 'Even if it rains…', answerJa: false },
        seconds: 15,
      },
    ],
  },
]

export function subjectDef(id: TestSubjectId): TestSubjectDef {
  const def = TEST_SUBJECTS.find((s) => s.id === id)
  if (!def) throw new Error(`Unknown test subject: ${id}`)
  return def
}

export function isTestSubject(value: string | null | undefined): value is TestSubjectId {
  return TEST_SUBJECTS.some((s) => s.id === value)
}

export function formatDef(id: TestFormatId): TestFormatDef {
  for (const s of TEST_SUBJECTS) {
    const f = s.formats.find((x) => x.id === id)
    if (f) return f
  }
  throw new Error(`Unknown test format: ${id}`)
}

/** Lengths offered on the setup page. */
export const TEST_LENGTHS = [10, 20, 30] as const

/** Grammar levels with practice questions (kept in step with GRAMMAR_QUESTION_BANK; a test checks). */
export const GRAMMAR_TEST_LEVELS: readonly string[] = ['n5']

export interface LevelOption {
  id: string
  label: string
  /** e.g. ひらがな under Hiragana. */
  native?: string
  available: boolean
}
