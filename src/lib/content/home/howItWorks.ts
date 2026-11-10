/**
 * Copy for the home page "How FoxSensei works" section (HowItWorks).
 * Every number here is checked against the course data; update both together.
 * Do not promise vocabulary courses, the quiz page or a placement test: none exist yet.
 */
import { HOW_GRADING_WORKS_PATH } from '@/lib/learn/paths'

export interface StepLink {
  label: string
  to: string
}

export interface HowItWorksStep {
  number: string
  /** The kana or kanji in the step's circle on the path. */
  glyph: string
  title: string
  body: string
  link: StepLink
}

export const HOW_IT_WORKS_INTRO = {
  eyebrow: 'How FoxSensei works',
  title: 'One clear path, from your first kana to real sentences.',
} as const

/** The numbers band under the hero. */
export const HOME_STATS: readonly { value: string; label: string }[] = [
  { value: '92', label: 'kana, with audio' },
  { value: '245', label: 'JLPT N5 & N4 kanji' },
  { value: '25', label: 'N5 grammar chapters' },
  { value: '10', label: 'kinds of exercise per chapter' },
  { value: 'Free', label: 'kana, kanji and grammar' },
]

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    number: '1',
    glyph: 'あ',
    title: 'Read the kana',
    body: 'All 92 hiragana and katakana, with audio, charts and printable worksheets.',
    link: { label: 'Start hiragana', to: '/kana/hiragana' },
  },
  {
    number: '2',
    glyph: '木',
    title: 'Build up kanji',
    body: '79 N5 and 166 N4 kanji, unit by unit, with a test for each level.',
    link: { label: 'Browse kanji', to: '/kanji' },
  },
  {
    number: '3',
    glyph: 'の',
    title: 'Put words into sentences',
    body: '25 illustrated N5 grammar chapters, each with vocabulary, listening and a 20-question exercise.',
    link: { label: 'Read N5 grammar', to: '/grammar/n5' },
  },
  {
    number: '4',
    glyph: '復',
    title: 'Keep what you learn',
    body: 'Short reviews bring words back just before you’d forget them. Needs a free account.',
    link: { label: 'How review works', to: HOW_GRADING_WORKS_PATH },
  },
]

/** Hand-picked video courses near the end of the page (the /classes directory). */
export const HOME_CLASSES = {
  eyebrow: 'Classes',
  title: 'Prefer video lessons?',
  body: 'Hand-picked N5 courses from teachers we trust, to watch alongside the path.',
  level: 'N5',
  /** How many courses the carousel holds. */
  count: 10,
  link: { label: 'Browse all classes', to: '/classes' },
} as const

export const HOW_IT_WORKS_CLOSING = {
  title: 'Start reading Japanese today.',
  body: 'Open the hiragana chart and first unit now — no account needed. Sign up free when you want to practise and save progress.',
  cta: { label: 'Start hiragana', to: '/kana/hiragana' },
} as const
