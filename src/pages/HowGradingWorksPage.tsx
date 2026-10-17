import type { ReactNode } from 'react'
import { GRADE_LABEL_TEXT } from '@/lib/learn/sessionResult'
import type { GradeLabel } from '@/types/learn'

const LABEL_MEANING: Record<GradeLabel, string> = {
  strong: 'Right and quicker than your usual time. Only typed or written answers can be Strong.',
  good: 'Right at about your usual speed. The best a multiple-choice answer can get.',
  shaky: 'Right, but slow for you, or after a hint or several replays of the sound.',
  missed: 'Wrong, or the answer was shown. The card comes back soon.',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-headline text-xl font-bold text-on-surface">{title}</h2>
      <div className="space-y-2 leading-relaxed text-on-surface-variant">{children}</div>
    </section>
  )
}

/** /learn/how-grading-works: a short, plain explanation of the grades on the result screen. */
export function HowGradingWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-nav">
      <div className="space-y-8 pt-8">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Learning</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface md:text-5xl">How grading works</h1>
          <p className="text-on-surface-variant">
            You only answer. We grade each answer and decide when you see the card again.
          </p>
        </div>

        <Section title="1. Right or wrong comes first">
          <p>
            A wrong answer, or one where you asked to see the answer, is always <strong>Missed</strong>, however fast it was.
            Time only matters once the answer is right.
          </p>
        </Section>

        <Section title="2. Time is compared with your own usual speed">
          <p>
            We compare how long you took with your usual time for that kind of question, not with anyone else. Time spent
            listening to the sound and time with the tab hidden are not counted. Answers that are much slower than usual are{' '}
            <strong>Shaky</strong>; clearly faster ones can be <strong>Strong</strong>.
          </p>
          <p>Until we have enough of your answers, we start from a typical time and move towards yours as you go.</p>
        </Section>

        <Section title="3. Some answers have a ceiling">
          <p>
            Multiple choice can be <strong>Good</strong> at most, because spotting the answer is easier than recalling it.
            Typed and written answers can be <strong>Strong</strong>. Hints, accepted typos and replaying the sound more than
            once lower the ceiling.
          </p>
        </Section>

        <Section title="What the grades mean">
          <ul className="space-y-2">
            {(Object.keys(LABEL_MEANING) as GradeLabel[]).map((label) => (
              <li key={label}>
                <strong className="text-on-surface">{GRADE_LABEL_TEXT[label]}</strong>: {LABEL_MEANING[label]}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  )
}
