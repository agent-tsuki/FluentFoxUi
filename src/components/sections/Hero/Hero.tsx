import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { useModal } from '@/context/ModalContext'
import { HeroVisual } from './HeroVisual'

function TrustAvatars() {
  const avatars = [
    { initials: 'AK', bg: '#ffeaea', color: '#c9274a' },
    { initials: 'RN', bg: '#f4e9dd', color: '#5c3b2e' },
    { initials: 'SM', bg: '#e0faf3', color: '#0a8a60' },
    { initials: 'YT', bg: '#fff8d6', color: '#a07000' },
  ]
  return (
    <div className="flex items-center gap-4">
      <div className="flex">
        {avatars.map((a, i) => (
          <span
            key={i}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold font-label"
            style={{
              background: a.bg,
              color: a.color,
              marginLeft: i === 0 ? 0 : -8,
              boxShadow: '0 0 0 2px white',
            }}
          >
            {a.initials}
          </span>
        ))}
      </div>
      <p className="text-sm text-on-surface-variant font-body">
        Joined by <span className="font-bold text-on-surface">50,000+</span> learners this month
      </p>
    </div>
  )
}

export function Hero() {
  const { openModal } = useModal()
  const heroTextRef = useRef<HTMLDivElement>(null)

  // Trigger entrance animation on mount
  useEffect(() => {
    const el = heroTextRef.current
    if (!el) return
    const t = setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 120)
    return () => clearTimeout(t)
  }, [])

  const scrollToLearn = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-16 items-center overflow-hidden">
      {/* Radial glow (balanced so it is not pushed too far right) */}
      <div
        className="absolute pointer-events-none -z-10"
        style={{
          top: -180, right: -80,
          width: 680, height: 680,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,107,68,0.1) 0%, transparent 72%)',
        }}
      />

      {/* Left — Copy */}
      <div
        ref={heroTextRef}
        className="space-y-6"
        style={{ opacity: 0, transform: 'translateY(28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-label text-[0.7rem] font-semibold uppercase tracking-widest border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
              style={{ animation: 'ping 1.8s ease-in-out infinite' }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          50,000+ Active Learners
        </div>

        {/* Headline */}
        <h1 className="font-headline text-4xl md:text-[3.3rem] font-extrabold tracking-tight text-on-surface leading-[1.1]">
          Learn Japanese,
          <br />
          <span className="text-primary italic">Without the Chaos</span>
        </h1>

        {/* Sub */}
        <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-[520px] font-body">
          Follow a focused learning path for grammar, kanji, and vocabulary with clear daily progress.
          Free to start, easy to continue.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="primary"
            className="px-8 py-3.5 rounded-xl text-base font-bold shadow-md shadow-primary/20"
            onClick={() => openModal('signup')}
          >
            Start for Free
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold"
            onClick={scrollToLearn}
          >
            See How It Works
          </Button>
        </div>

        {/* Trust line */}
        <TrustAvatars />
      </div>

      {/* Right — Character card visual */}
      <HeroVisual />
    </section>
  )
}
