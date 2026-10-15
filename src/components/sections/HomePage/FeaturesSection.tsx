import { SectionHeader } from '@/components/ui/SectionHeader'
import { FadeIn } from '@/components/ui/FadeIn'
import { Icon } from '@/components/ui/Icon'

interface Feature {
  title: string
  desc: string
  icon: string
  iconBg: string
  wide: boolean
}

const FEATURES: Feature[] = [
  {
    title:  'Daily Quizzes',
    desc:   'Quick, personalized review sessions tailored to what you need to study next.',
    icon:   'quiz',
    iconBg: 'bg-primary/10 text-primary',
    wide:   false,
  },
  {
    title:  'Interactive Lessons',
    desc:   'Clear grammar explanations with interactive examples you can tap to read.',
    icon:   'menu_book',
    iconBg: 'bg-tertiary/10 text-tertiary',
    wide:   false,
  },
  {
    title:  'Hiragana Chart',
    desc:   'Master the alphabet with native pronunciation audio and writing guidance.',
    icon:   'grid_view',
    iconBg: 'bg-secondary/10 text-secondary',
    wide:   false,
  },
  {
    title:  'N5/N4 Courses',
    desc:   'A curated curriculum from zero to JLPT N4. Chapter-by-chapter vocabulary, grammar, and kanji exercises designed to fit your busy schedule.',
    icon:   'schema',
    iconBg: 'bg-success/10 text-success',
    wide:   true,
  },
  {
    title:  'Kanji & Flashcards',
    desc:   'Review cards with active study loops. Write-in quizzes and consistency dashboards.',
    icon:   'view_carousel',
    iconBg: 'bg-primary/10 text-primary',
    wide:   false,
  },
]

function FeatureCard({ f, delay }: { f: Feature; delay: number }) {
  return (
    <FadeIn
      delay={delay}
      className={`group bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/35 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 relative overflow-hidden cursor-default ${f.wide ? 'md:col-span-2 flex gap-7 items-center' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex gap-4 items-start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.iconBg} group-hover:scale-110 transition-transform flex-shrink-0`}>
          <Icon name={f.icon} className="text-2xl" />
        </div>
        <div>
          <h4 className="font-headline text-lg font-bold text-on-surface mb-2">{f.title}</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed font-body">{f.desc}</p>
        </div>
      </div>
    </FadeIn>
  )
}

export function FeaturesSection() {
  return (
    <section id="features-section" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20">
      <SectionHeader
        eyebrow="Features"
        title="Learn Faster, With Less Clutter"
        description="All core tools in one place: lessons, flashcards, quizzes, curated courses, and progress tracking."
        eyebrowVariant="pill"
        className="mb-10 text-left"
        align="left"
      />

      <div className="mt-10 grid md:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} f={f} delay={i * 70} />
        ))}
      </div>
    </section>
  )
}
