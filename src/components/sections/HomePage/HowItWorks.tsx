import { FadeIn } from '@/components/ui/FadeIn'
import { Eyebrow } from '@/components/ui/SectionHeader'

const STEPS = [
  {
    num: 1,
    title: 'Choose Your Level',
    desc: 'Start at your level and get a clear path for daily progress.',
  },
  {
    num: 2,
    title: 'Study & Practice',
    desc: 'Learn with lessons, flashcards, and quizzes without switching apps.',
  },
  {
    num: 3,
    title: 'Track & Improve',
    desc: 'Use your dashboard to review weak areas and build consistency.',
  },
]

export function HowItWorks() {
  return (
    <section className="relative z-10 py-20 px-6 md:px-10 bg-surface-inverse">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center">
          <Eyebrow variant="pill">How It Works</Eyebrow>
          <h2 className="font-headline text-display-md font-extrabold leading-tight mb-3 text-on-surface-inverse">
            Three Simple Steps
          </h2>
          <p className="text-base max-w-lg mx-auto leading-relaxed font-body text-on-surface-inverse-variant">
            A simple loop: pick your level, practice daily, and improve with feedback.
          </p>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
            {/* Dashed connector line */}
            <div
              className="absolute hidden md:block border-t border-dashed border-on-surface-inverse/20"
              style={{
                top: 36, left: 'calc(16.66% + 8px)', right: 'calc(16.66% + 8px)',
                height: 2,
              }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="text-center px-6 py-6 rounded-2xl bg-on-surface-inverse/5 border border-on-surface-inverse/10">
                {/* Number circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-on-primary font-headline mx-auto mb-5 relative z-10 bg-primary"
                  style={{
                    boxShadow: '0 0 0 6px rgb(var(--primary) / 0.16)',
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-lg font-bold font-headline mb-2 text-on-surface-inverse">{s.title}</h3>
                <p className="text-sm leading-relaxed font-body text-on-surface-inverse-variant">{s.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
