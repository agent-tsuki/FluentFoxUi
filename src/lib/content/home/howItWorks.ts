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
  label: string
  title: string
  body: string
  /** A short caveat under the body, e.g. what needs an account. */
  meta?: string
  links: readonly StepLink[]
  /** Heading of the "Try it" panel beside the step. */
  demoLabel: string
}

export const HOW_IT_WORKS_INTRO = {
  eyebrow: 'How FoxSensei works',
  title: 'Learn to read Japanese, one step at a time.',
  body: 'Start with the two kana alphabets, move into JLPT kanji and grammar, then keep it all with a few minutes of review a day.',
} as const

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    number: '01',
    label: 'Hiragana & katakana',
    title: 'Read the kana.',
    body: 'All 92 basic kana — hiragana and katakana — with charts and printable worksheets. Sign in free to practise and earn a certificate.',
    links: [
      { label: 'Start hiragana', to: '/kana/hiragana' },
      { label: 'Start katakana', to: '/kana/katakana' },
    ],
    demoLabel: 'Try it · Tap a sound',
  },
  {
    number: '02',
    label: 'Kanji · N5 → N4',
    title: 'Build up kanji, unit by unit.',
    body: '79 N5 and 166 N4 kanji. Each unit takes you through learn, write, practise and quiz, and a level test earns a certificate.',
    meta: 'N3–N1 coming soon.',
    links: [{ label: 'Browse kanji', to: '/kanji' }],
    demoLabel: 'Try it · Watch meaning grow',
  },
  {
    number: '03',
    label: 'N5 grammar',
    title: 'Put words into sentences.',
    body: '25 illustrated N5 grammar chapters. Each one explains a pattern with a picture and real example sentences.',
    links: [{ label: 'Read N5 grammar', to: '/grammar/n5' }],
    demoLabel: 'Try it · Say “I am a student.”',
  },
  {
    number: '04',
    label: 'Review & progress',
    title: 'Keep what you learn.',
    body: 'Short lessons turn new items into review cards that come back before you forget. You only answer; FoxSensei grades it and tracks your streak and progress.',
    meta: 'Review and the dashboard need a free account.',
    links: [{ label: 'How review works', to: HOW_GRADING_WORKS_PATH }],
    demoLabel: 'Try it · A review card',
  },
]

/** One quiet pointer to the curated course directory, between the steps and the closing. */
export const CLASS_DIRECTORY = {
  lead: 'Prefer video lessons?',
  link: { label: 'Browse hand-picked courses by JLPT level', to: '/classes' },
} as const

export const HOW_IT_WORKS_CLOSING = {
  title: 'Start reading Japanese today.',
  body: 'Open the hiragana chart and first unit now — no account needed. Sign up free when you want to practise and save progress.',
  cta: { label: 'Start hiragana', to: '/kana/hiragana' },
} as const
