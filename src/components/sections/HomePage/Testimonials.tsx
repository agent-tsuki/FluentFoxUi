import { FadeIn } from '@/components/ui/FadeIn'

interface Testimonial {
  stars: number
  text: string
  initials: string
  avatarBg: string
  avatarColor: string
  name: string
  level: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    stars: 5,
    text: '"I\'d tried three other apps before this. FluentFox is the first one that actually explains grammar clearly — not just throws cards at you. Passed N5 in 4 months!"',
    initials: 'AK', avatarBg: '#ffeaea', avatarColor: '#c9274a',
    name: 'Arjun K.', level: 'Passed JLPT N5 🎉',
  },
  {
    stars: 5,
    text: '"The dashboard is the game-changer. Knowing exactly which kanji trip me up means my study time is actually useful. Love the free courses section too."',
    initials: 'RN', avatarBg: '#e8eeff', avatarColor: '#1C2B4B',
    name: 'Rina N.', level: 'Anime fan → N4 learner',
  },
  {
    stars: 4,
    text: '"Being able to go from the flashcard to a full grammar chapter — without switching apps — is genius. My hiragana went from zero to fluent in 2 weeks."',
    initials: 'SM', avatarBg: '#e0faf3', avatarColor: '#0a8a60',
    name: 'Sam M.', level: 'Complete beginner → N5',
  },
]

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < count ? '#FFD166' : '#ccc', fontSize: 17 }}>★</span>
      ))}
    </div>
  )
}

function TestiCard({ t, delay }: { t: Testimonial; delay: number }) {
  return (
    <FadeIn delay={delay} className="bg-surface-container-lowest rounded-2xl p-7 border-[1.5px] border-outline-variant/40">
      <StarRow count={t.stars} />
      <p className="text-sm text-on-surface-variant leading-relaxed font-body italic mb-5">{t.text}</p>
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm font-label flex-shrink-0"
          style={{ background: t.avatarBg, color: t.avatarColor }}
        >
          {t.initials}
        </div>
        <div>
          <p className="text-sm font-extrabold text-on-surface font-headline">{t.name}</p>
          <p className="text-xs text-on-surface-variant font-body">{t.level}</p>
        </div>
      </div>
    </FadeIn>
  )
}

export function Testimonials() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24">
      <FadeIn className="text-center">
        <span className="inline-block bg-primary/10 text-primary text-[11px] font-extrabold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
          Learners Love It
        </span>
        <h2 className="font-headline text-4xl md:text-[2.8rem] font-extrabold text-on-surface leading-tight">
          Real Stories,<br />Real Progress
        </h2>
      </FadeIn>

      <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <TestiCard key={t.name} t={t} delay={i * 80} />
        ))}
      </div>
    </section>
  )
}
