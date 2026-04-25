import { useEffect, useRef, useState } from 'react'

interface StatItem {
  target: number
  suffix: string
  label: string
  format: (n: number) => string
}

const STATS: StatItem[] = [
  { target: 52000, suffix: '+', label: 'Active Learners',       format: n => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}` },
  { target: 380,   suffix: '+', label: 'Grammar Lessons',       format: n => `${n}` },
  { target: 1200,  suffix: '+', label: 'Flashcards',            format: n => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}` },
  { target: 60,    suffix: '+', label: 'Free Courses Listed',   format: n => `${n}` },
]

function useCounter(target: number, duration = 1800, active: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

function StatCell({ stat, active }: { stat: StatItem; active: boolean }) {
  const val = useCounter(stat.target, 1800, active)
  return (
    <div className="flex-1 text-center py-6 px-4 border-r border-white/10 last:border-r-0">
      <div className="text-2xl md:text-3xl font-black font-headline text-white">
        {stat.format(val)}{stat.suffix}
      </div>
      <div className="text-[11px] font-semibold mt-1 font-label tracking-wide" style={{ color: 'rgba(255,255,255,0.62)' }}>
        {stat.label}
      </div>
    </div>
  )
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative z-10 flex justify-center rounded-2xl mx-4 md:mx-10 overflow-hidden bg-[#2f2521]">
      {STATS.map(s => <StatCell key={s.label} stat={s} active={active} />)}
    </div>
  )
}
