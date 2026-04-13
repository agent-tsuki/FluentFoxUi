import { FadeIn } from '@/components/ui/FadeIn'

interface Feature {
  icon: string
  title: string
  desc: string
  chips: string[]
  wide?: boolean
  iconBg: string
}

const FEATURES: Feature[] = [
  {
    icon: '📖', iconBg: '#fff0ea', title: 'Grammar Lessons',
    desc: 'Structured chapter-by-chapter grammar lessons covering particles, verb conjugations, sentence patterns, and JLPT levels from N5 to N1.',
    chips: ['て-form', 'は vs が', 'N5→N1'],
  },
  {
    icon: '🃏', iconBg: '#edf0f8', title: 'Smart Flashcards',
    desc: 'Spaced-repetition cards for vocabulary, kanji, hiragana, and katakana — sorted by grammar chapter so learning feels connected, not random.',
    chips: ['ひらがな', 'カタカナ', '漢字'],
  },
  {
    icon: '✏️', iconBg: '#e0faf3', title: 'Quizzes & Tests',
    desc: 'Chapter-linked quizzes, full JLPT-style mock tests, and instant feedback so you know exactly where to focus next.',
    chips: ['MCQ', 'Fill-in', 'Listening'],
  },
  {
    icon: '🌐', iconBg: '#fff8e1', title: 'Free Courses Hub', wide: true,
    desc: "We've curated the best free and paid Japanese courses from across the web — Coursera, NHK World, JapanesePod101, and more. Browse, compare, and head directly to the source.",
    chips: ['NHK World', 'Coursera', 'JapanesePod101', 'Tofugu'],
  },
  {
    icon: '📊', iconBg: '#f0eeff', title: 'Progress Dashboard',
    desc: 'Track quiz history, spot weak topics automatically, and watch your improvement over time with visual stats.',
    chips: ['Streak tracking', 'Weak spots'],
  },
  {
    icon: '🎯', iconBg: '#ffe8f0', title: 'JLPT Prep Mode',
    desc: 'Dedicated JLPT N5–N1 practice sets, timed sections, and score prediction to get you ready for exam day.',
    chips: ['N5', 'N4', 'N3', 'N2', 'N1'],
  },
]

function FeatureCard({ f, delay }: { f: Feature; delay: number }) {
  return (
    <FadeIn
      delay={delay}
      className={`group bg-surface-container-lowest rounded-2xl p-8 border-[1.5px] border-outline-variant/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 relative overflow-hidden cursor-default ${f.wide ? 'md:col-span-2 flex gap-8 items-center' : ''}`}
    >
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-b-2xl" />

      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${f.wide ? 'flex-shrink-0' : 'mb-5'}`}
        style={{ background: f.iconBg }}
      >
        {f.icon}
      </div>

      <div className={f.wide ? 'flex-1' : ''}>
        <h3 className="text-lg font-extrabold text-on-surface font-headline mb-2">{f.title}</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed font-body mb-4">{f.desc}</p>
        <div className="flex flex-wrap gap-2">
          {f.chips.map(c => (
            <span
              key={c}
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

export function FeaturesSection() {
  return (
    <section id="features-section" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24">
      <FadeIn>
        <span className="inline-block bg-primary/10 text-primary text-[11px] font-extrabold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
          Core Features
        </span>
        <h2 className="font-headline text-4xl md:text-[2.8rem] font-extrabold text-on-surface leading-tight mb-3">
          Everything You Need to<br />Master Japanese
        </h2>
        <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed font-body">
          One platform for grammar, vocabulary, kanji, quizzes, and a curated library of free external courses.
        </p>
      </FadeIn>

      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} f={f} delay={i * 70} />
        ))}
      </div>
    </section>
  )
}
