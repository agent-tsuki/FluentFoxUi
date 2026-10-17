/**
 * Copy + sample lesson data for the homepage hero (HomeHero) and its
 * "Try it · 60-second lesson" widget (TryLessonCard).
 * Edit freely — the components render whatever is here. Japanese strings are
 * kept in their own fields so the components can mark them `lang="ja"`.
 */

export interface HeroCopy {
  eyebrow: string
  /** First line of the h1. */
  titleLead: string
  /** Italic accent line of the h1. */
  titleAccent: string
  description: string
  primaryCta: string
  secondaryCta: string
  /** In-page section id the secondary CTA scrolls to (without '#'). */
  secondaryCtaTarget: string
  note: string
}

export const HERO_COPY: HeroCopy = {
  eyebrow: 'Free to start · First kana to JLPT N4',
  titleLead: 'Learn Japanese,',
  titleAccent: 'without the chaos.',
  description:
    'One path instead of ten open tabs. Lessons, flashcards and quizzes that know what you should study next.',
  primaryCta: 'Start learning free',
  secondaryCta: 'See the path',
  secondaryCtaTarget: 'path',
  note: 'No card needed. Or try the 60-second lesson first — no sign-up.',
}

/** One "learn this character" card (steps 0 and 1). */
export interface LessonCard {
  label: string
  kana: string
  romaji: string
  tip: string
  cta: string
}

export interface LessonQuiz {
  label: string
  /** The word to read — built from the cards above. */
  word: string
  groupLabel: string
  options: readonly string[]
  answer: string
  /** Shown before the per-character breakdown, e.g. "す (su) + し (shi)." */
  hintLead: string
}

export interface LessonDone {
  title: string
  /** Rendered as `<word> = <meaning>` + `rest`. */
  word: string
  meaning: string
  rest: string
  progressLabel: string
  learned: number
  total: number
  /** Rendered as `${learned} ${progressOf} ${total}`. */
  progressOf: string
  nextBefore: string
  nextKana: string
  nextAfter: string
  cta: string
  restart: string
}

export interface TryLessonCopy {
  title: string
  cards: readonly [LessonCard, LessonCard]
  quiz: LessonQuiz
  done: LessonDone
}

export const TRY_LESSON: TryLessonCopy = {
  title: 'Try it · 60-second lesson',
  cards: [
    {
      label: 'Character 1 of 2',
      kana: 'す',
      romaji: 'su',
      tip: 'Sounds like the "su" in sushi.',
      cta: 'Got it — next',
    },
    {
      label: 'Character 2 of 2',
      kana: 'し',
      romaji: 'shi',
      tip: 'Sounds like "she". Notice the single curved hook.',
      cta: 'Now read a real word',
    },
  ],
  quiz: {
    label: 'Your turn — read this word',
    word: 'すし',
    groupLabel: 'Answer options',
    options: ['shisu', 'sushi', 'susu'],
    answer: 'sushi',
    hintLead: 'Close! Read left to right:',
  },
  done: {
    title: 'You just read Japanese.',
    word: 'すし',
    meaning: 'sushi',
    rest: ". That's your first word.",
    progressLabel: 'Hiragana learned',
    learned: 2,
    total: 46,
    progressOf: 'of',
    nextBefore: 'The next five (',
    nextKana: 'あ い う え お',
    nextAfter: ') take about two minutes.',
    cta: 'Keep going — save my progress',
    restart: 'Start over',
  },
}
