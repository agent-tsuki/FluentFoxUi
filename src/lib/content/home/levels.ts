/**
 * Copy for the homepage "Start where you are" level picker (LevelPicker section).
 * Edit freely — the component renders whatever is here. Japanese characters inside
 * any string are automatically wrapped in `lang="ja"` spans by the component.
 */

export type LevelId = 'zero' | 'kana' | 'n4'

export interface LevelOption {
  id: LevelId
  /** Large Japanese glyph shown on the card (decorative). */
  glyph: string
  title: string
  sub: string
}

export interface PlanDay {
  /** Short label, e.g. "Day 1–2". Must be unique within a plan (used as the list key). */
  when: string
  what: string
}

export interface FirstWeekPlan {
  heading: string
  note: string
  cta: string
  days: readonly PlanDay[]
}

export interface LevelPickerCopy {
  eyebrow: string
  title: string
  description: string
  groupLabel: string
  panelEyebrow: string
}

export const LEVEL_PICKER_COPY: LevelPickerCopy = {
  eyebrow: 'Start where you are',
  title: 'Where are you with Japanese right now?',
  description: "Pick one. We'll show you exactly what your first week looks like.",
  groupLabel: 'Choose your level',
  panelEyebrow: 'Your first week',
}

export const DEFAULT_LEVEL: LevelId = 'zero'

export const LEVEL_OPTIONS: readonly LevelOption[] = [
  {
    id: 'zero',
    glyph: 'あ',
    title: "I can't read Japanese yet",
    sub: 'Start with hiragana, with audio for every character.',
  },
  {
    id: 'kana',
    glyph: 'です',
    title: 'I can read hiragana & katakana',
    sub: 'Jump into N5 grammar, vocabulary and your first kanji.',
  },
  {
    id: 'n4',
    glyph: '能',
    title: "I've finished N5",
    sub: 'Check your gaps, then move on to N4.',
  },
]

export const FIRST_WEEK_PLANS: Record<LevelId, FirstWeekPlan> = {
  zero: {
    heading: 'Read all of hiragana by the end of week one.',
    note: 'A few short sessions — each ends with a quick quiz so it sticks.',
    cta: 'Start hiragana — free',
    days: [
      { when: 'Day 1–2', what: 'Rows あ to そ, with native audio and stroke guides.' },
      { when: 'Day 3–4', what: 'Rows た to ほ, plus a 3-minute daily review of what you learned.' },
      { when: 'Day 5–7', what: 'Finish the chart and read your first real words and short phrases.' },
    ],
  },
  kana: {
    heading: 'Say your first full sentences this week.',
    note: 'N5 chapter 1, with flashcards that come back right before you forget them.',
    cta: 'Start N5 — free',
    days: [
      { when: 'Day 1', what: 'です and は — introduce yourself in a full sentence.' },
      { when: 'Day 2–4', what: 'Chapter 1 vocabulary as flashcards, plus your first kanji.' },
      { when: 'Day 5–7', what: 'Chapter 1 grammar quiz, then review whatever your dashboard flags.' },
    ],
  },
  n4: {
    heading: 'Find your N5 gaps, then start N4.',
    note: 'A short check quiz first, so you never re-study what you already know.',
    cta: 'Take the N5 check — free',
    days: [
      { when: 'Day 1', what: 'N5 check quiz — your dashboard lists the topics to revisit.' },
      { when: 'Day 2–4', what: 'Patch the weak spots, then N4 chapter 1 grammar and kanji.' },
      { when: 'Day 5–7', what: 'Chapter 1 quiz and a spaced review of everything so far.' },
    ],
  },
}
