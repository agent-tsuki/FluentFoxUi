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
    desc: 'Clear chapter-based lessons for particles, verbs, and sentence patterns from JLPT N5 to N1.',
    chips: ['て-form', 'Particles', 'N5-N1'],
  },
  {
    icon: '🃏', iconBg: '#f4e9dd', title: 'Smart Flashcards',
    desc: 'Spaced repetition for vocab and scripts, organized by chapter so revision stays focused.',
    chips: ['Hiragana', 'Katakana', 'Kanji'],
  },
  {
    icon: '✏️', iconBg: '#e0faf3', title: 'Quizzes & Tests',
    desc: 'Take chapter quizzes and JLPT-style mocks with instant feedback and weak-topic hints.',
    chips: ['MCQ', 'Fill-in', 'Listening'],
  },
  {
    icon: '🌐', iconBg: '#fff8e1', title: 'Free Courses Hub', wide: true,
    desc: 'Browse handpicked external resources from trusted platforms and jump directly to the original source.',
    chips: ['NHK World', 'Coursera', 'JapanesePod101', 'Tofugu'],
  },
  {
    icon: '📊', iconBg: '#f0eeff', title: 'Progress Dashboard',
    desc: 'Track progress, revisit weak topics, and keep your study streak consistent.',
    chips: ['Study streak', 'Weak spots'],
  },
]

function FeatureCard({ f, delay }: { f: Feature; delay: number }) {
  return (
    <FadeIn
      delay={delay}
      className={`group bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/35 transition-all duration-250 hover:-translate-y-0.5 hover:border-primary/30 relative overflow-hidden cursor-default ${f.wide ? 'md:col-span-2 flex gap-7 items-center' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${f.wide ? 'flex-shrink-0' : 'mb-5'}`}
        style={{ background: f.iconBg }}
      >
        {f.icon}
      </div>

      <div className={f.wide ? 'flex-1' : ''}>
        <h3 className="text-lg font-bold text-on-surface font-headline mb-2">{f.title}</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed font-body mb-4">{f.desc}</p>
        <div className="flex flex-wrap gap-2">
          {f.chips.map(c => (
            <span
              key={c}
              className="text-[11px] font-semibold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label"
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
    <section id="features-section" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20">
      <FadeIn>
        <span className="inline-block bg-primary/10 text-primary text-[11px] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
          Features
        </span>
        <h2 className="font-headline text-3xl md:text-[2.4rem] font-extrabold text-on-surface leading-tight mb-3">
          Learn Faster, With Less Clutter
        </h2>
        <p className="text-base text-on-surface-variant max-w-2xl leading-relaxed font-body">
          All core tools in one place: lessons, flashcards, quizzes, curated courses, and progress tracking.
        </p>
      </FadeIn>

      <div className="mt-10 grid md:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} f={f} delay={i * 70} />
        ))}
      </div>
    </section>
  )
}
