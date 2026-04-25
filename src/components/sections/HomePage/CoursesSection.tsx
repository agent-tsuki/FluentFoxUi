import { FadeIn } from '@/components/ui/FadeIn'

interface Course {
  char: string
  thumbGradient: [string, string]
  charColor: string
  badge: string
  badgeColor: string
  badgeText: string
  source: string
  title: string
  desc: string
  rating: string
  stars: number
}

const COURSES: Course[] = [
  {
    char: 'あ', thumbGradient: ['#ffeaea', '#ffccd7'], charColor: '#EA6B44',
    badge: 'FREE', badgeColor: '#e0faf3', badgeText: '#0a8a60',
    source: 'NHK World', title: 'Easy Japanese for Beginners',
    desc: '48 audio lessons covering daily conversation for total beginners.',
    rating: '4.9', stars: 5,
  },
  {
    char: '文', thumbGradient: ['#f4e9dd', '#e8d4c2'], charColor: '#5c3b2e',
    badge: 'N5', badgeColor: '#f4e9dd', badgeText: '#5c3b2e',
    source: 'Coursera', title: 'Japanese for Beginners (Keio Univ.)',
    desc: 'University-level course covering grammar, script, and speaking.',
    rating: '4.7', stars: 4,
  },
  {
    char: '語', thumbGradient: ['#e0faf3', '#b3f0da'], charColor: '#0a8a60',
    badge: 'FREE', badgeColor: '#e0faf3', badgeText: '#0a8a60',
    source: 'Tofugu', title: 'Learn Hiragana: The Ultimate Guide',
    desc: 'Master all 46 hiragana characters in a single, visual guide.',
    rating: '5.0', stars: 5,
  },
  {
    char: '漢', thumbGradient: ['#fff8d6', '#ffe9a0'], charColor: '#a07000',
    badge: 'N4', badgeColor: '#fff8d6', badgeText: '#7a5800',
    source: 'JapanesePod101', title: 'Intermediate Japanese Path',
    desc: '500+ audio and video lessons with PDF transcripts.',
    rating: '4.6', stars: 4,
  },
  {
    char: '能', thumbGradient: ['#f0e8ff', '#dcc8ff'], charColor: '#6a0dad',
    badge: 'N3', badgeColor: '#ffe8f0', badgeText: '#c00050',
    source: 'WaniKani', title: 'Kanji & Vocabulary SRS System',
    desc: 'Learn 2,000 kanji and 6,000 vocabulary with spaced repetition.',
    rating: '4.8', stars: 5,
  },
  {
    char: '話', thumbGradient: ['#ffe8f0', '#ffc2d1'], charColor: '#c00050',
    badge: 'FREE', badgeColor: '#e0faf3', badgeText: '#0a8a60',
    source: 'Duolingo', title: 'Japanese Course (Gamified)',
    desc: 'Bite-sized daily lessons with a game-like streak system.',
    rating: '4.4', stars: 4,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <span style={{ color: '#FFD166', fontSize: 13 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

function CourseCard({ c, delay }: { c: Course; delay: number }) {
  return (
    <FadeIn
      delay={delay}
      className="bg-surface-container-lowest rounded-2xl overflow-hidden border-[1.5px] border-outline-variant/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer group"
    >
      {/* Thumb */}
      <div
        className="h-32 flex items-center justify-center font-headline text-5xl font-bold relative"
        style={{ background: `linear-gradient(135deg, ${c.thumbGradient[0]}, ${c.thumbGradient[1]})`, color: c.charColor }}
      >
        <span>{c.char}</span>
        <span
          className="absolute top-3 right-3 text-[11px] font-extrabold px-3 py-1 rounded-full font-label"
          style={{ background: c.badgeColor, color: c.badgeText }}
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
        <span className="inline-block bg-primary/10 text-primary text-[11px] font-extrabold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
          Free Courses Hub
        </span>
        <h2 className="font-headline text-4xl md:text-[2.8rem] font-extrabold text-on-surface leading-tight mb-3">
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
    </section>
  )
}
