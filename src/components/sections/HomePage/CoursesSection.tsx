import { Link } from 'react-router-dom'
import { FadeIn } from '@/components/ui/FadeIn'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

interface Course {
  char: string
  thumbClass: string
  charClass: string
  badge: string
  badgeClass: string
  source: string
  title: string
  desc: string
  rating: string
  stars: number
}

// 3 representative picks — a mix of free/paid and JLPT level — with a link out to
// the full /classes directory instead of duplicating it (see UIUX_STANDARDS §11).
const COURSES: Course[] = [
  {
    char: 'あ', thumbClass: 'bg-gradient-to-br from-primary/10 to-primary/25', charClass: 'text-primary',
    badge: 'FREE', badgeClass: 'bg-success/15 text-success',
    source: 'NHK World', title: 'Easy Japanese for Beginners',
    desc: '48 audio lessons covering daily conversation for total beginners.',
    rating: '4.9', stars: 5,
  },
  {
    char: '文', thumbClass: 'bg-gradient-to-br from-tertiary/10 to-tertiary/25', charClass: 'text-tertiary',
    badge: 'N5', badgeClass: 'bg-tertiary/10 text-tertiary',
    source: 'Coursera', title: 'Japanese for Beginners (Keio Univ.)',
    desc: 'University-level course covering grammar, script, and speaking.',
    rating: '4.7', stars: 4,
  },
  {
    char: '能', thumbClass: 'bg-gradient-to-br from-secondary/10 to-secondary/25', charClass: 'text-secondary',
    badge: 'N3', badgeClass: 'bg-secondary/10 text-secondary',
    source: 'WaniKani', title: 'Kanji & Vocabulary SRS System',
    desc: 'Learn 2,000 kanji and 6,000 vocabulary with spaced repetition.',
    rating: '4.8', stars: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span className="text-primary" style={{ fontSize: 13 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function CourseCard({ c, delay }: { c: Course; delay: number }) {
  return (
    <FadeIn
      delay={delay}
      className="bg-surface-container-lowest rounded-2xl overflow-hidden border-[1.5px] border-outline-variant/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevation-2 cursor-pointer group"
    >
      {/* Thumb */}
      <div className={cn('h-32 flex items-center justify-center font-headline text-5xl font-bold relative overflow-hidden', c.thumbClass)}>
        <span className={cn('relative z-10 transition-colors', c.charClass)}>{c.char}</span>

        <span
          className={cn(
            'absolute top-3 right-3 text-[11px] font-extrabold px-3 py-1 rounded-full font-label z-10 transition-all duration-300',
            c.badgeClass,
          )}
        >
          {c.badge}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-[11px] font-extrabold text-primary uppercase tracking-wide font-label mb-1">{c.source}</p>
        <h3 className="text-sm font-extrabold text-on-surface font-headline mb-2 leading-tight">{c.title}</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed font-body mb-3">{c.desc}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Stars count={c.stars} />
            <span className="text-xs font-bold text-on-surface ml-1">{c.rating}</span>
          </div>
          <button className="text-xs font-extrabold text-primary border-[1.5px] border-primary rounded-lg px-3 py-1.5 transition-all hover:bg-primary hover:text-white font-label">
            Visit →
          </button>
        </div>
      </div>
    </FadeIn>
  )
}

export function CoursesSection() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24">
      <FadeIn>
        <Eyebrow variant="pill">Free Courses Hub</Eyebrow>
        <h2 className="font-headline text-display-md font-extrabold text-on-surface leading-tight mb-3">
          Top-Rated Courses,<br />All in One Place
        </h2>
        <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed font-body">
          We link the best Japanese learning resources from around the web. Free ones are free forever — paid ones redirect to the source.
        </p>
      </FadeIn>

      <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {COURSES.map((c, i) => (
          <CourseCard key={c.title} c={c} delay={i * 70} />
        ))}
      </div>

      <FadeIn delay={COURSES.length * 70} className="mt-10 text-center">
        <Link
          to="/classes"
          className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
        >
          Browse all courses <Icon name="arrow_forward" />
        </Link>
      </FadeIn>
    </section>
  )
}
