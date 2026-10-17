/** Copy for the home-page "Why it works" section (id="why"). */

export type WhyTone = 'primary' | 'info' | 'success'

export interface WhyPoint {
  id: string
  /** Material Symbols icon name. */
  icon: string
  tone: WhyTone
  title: string
  body: string
}

export const WHY_SECTION = {
  eyebrow: 'Why it works',
  title: 'Built on how memory actually works.',
} as const

export const WHY_POINTS: readonly WhyPoint[] = [
  {
    id: 'retrieval',
    icon: 'help',
    tone: 'primary',
    title: 'Quizzes over re-reading',
    body: "Pulling an answer from memory makes it stick far better than reading it again. That's why every lesson ends with a short quiz.",
  },
  {
    id: 'spaced',
    icon: 'calendar_month',
    tone: 'info',
    title: 'Spaced review, not cramming',
    body: "Flashcards come back just as you're about to forget them, so ten minutes a day beats an hour on Sunday.",
  },
  {
    id: 'next-step',
    icon: 'arrow_forward',
    tone: 'success',
    title: 'One clear next step',
    body: 'Lessons, flashcards and quizzes live in one place, so you never lose ten minutes deciding what to study.',
  },
]
