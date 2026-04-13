import { FadeIn } from '@/components/ui/FadeIn'

const STEPS = [
  {
    num: 1,
    title: 'Choose Your Level',
    desc: "Beginner? Intermediate? Pick your starting point — complete beginner, anime-fan, or JLPT exam hunter. We'll tailor your path.",
  },
  {
    num: 2,
    title: 'Study & Practice',
    desc: 'Work through grammar chapters, drill flashcards, and take chapter quizzes — all in one place. Zero app-switching needed.',
  },
  {
    num: 3,
    title: 'Track & Improve',
    desc: "Your dashboard flags exactly which topics trip you up and recommends daily review so you never forget what you've learned.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative z-10 py-24 px-6 md:px-10" style={{ background: '#1C2B4B' }}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center">
          <span className="inline-block bg-primary/20 text-primary text-[11px] font-extrabold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/30 mb-4">
            How It Works
          </span>
          <h2 className="font-headline text-4xl md:text-[2.8rem] font-extrabold leading-tight mb-3" style={{ color: 'white' }}>
            Three Steps to Fluency
          </h2>
          <p className="text-lg max-w-md mx-auto leading-relaxed font-body" style={{ color: 'rgba(255,255,255,0.6)' }}>
            We built a loop that keeps you learning: study, test, review, repeat.
          </p>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="mt-16 grid md:grid-cols-3 gap-0 relative">
            {/* Dashed connector line */}
            <div
              className="absolute hidden md:block"
              style={{
                top: 36, left: 'calc(16.66% + 8px)', right: 'calc(16.66% + 8px)',
                height: 2, borderTop: '2px dashed rgba(255,255,255,0.2)',
              }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="text-center px-8">
                {/* Number circle */}
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-black text-white font-headline mx-auto mb-6 relative z-10"
                  style={{
                    background: '#EA6B44',
                    boxShadow: '0 0 0 8px rgba(234,107,68,0.2)',
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-xl font-extrabold font-headline mb-3" style={{ color: 'white' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed font-body" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
