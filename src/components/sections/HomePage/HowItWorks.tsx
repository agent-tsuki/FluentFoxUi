import { FadeIn } from '@/components/ui/FadeIn'

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
    <section className="relative z-10 py-20 px-6 md:px-10 bg-[#2f2521]">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center">
          <span className="inline-block bg-primary/20 text-primary text-[11px] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/30 mb-4">
            How It Works
          </span>
          <h2 className="font-headline text-3xl md:text-[2.4rem] font-extrabold leading-tight mb-3" style={{ color: 'white' }}>
            Three Simple Steps
          </h2>
          <p className="text-base max-w-lg mx-auto leading-relaxed font-body" style={{ color: 'rgba(255,255,255,0.7)' }}>
            A simple loop: pick your level, practice daily, and improve with feedback.
          </p>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
            {/* Dashed connector line */}
            <div
              className="absolute hidden md:block"
              style={{
                top: 36, left: 'calc(16.66% + 8px)', right: 'calc(16.66% + 8px)',
                height: 2, borderTop: '1px dashed rgba(255,255,255,0.18)',
              }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="text-center px-6 py-6 rounded-2xl bg-white/5 border border-white/10">
                {/* Number circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white font-headline mx-auto mb-5 relative z-10"
                  style={{
                    background: '#EA6B44',
                    boxShadow: '0 0 0 6px rgba(234,107,68,0.16)',
                  }}
                >
                  {s.num}
                </div>
                <h3 className="text-lg font-bold font-headline mb-2" style={{ color: 'white' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed font-body" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
