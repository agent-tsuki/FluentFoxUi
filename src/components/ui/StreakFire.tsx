import { cn } from '@/lib/cn'

interface StreakFireProps {
  /** A live streak burns; 0 shows a dim, still ember. */
  lit?: boolean
  className?: string
}

/**
 * StreakFire — the animated flame next to the streak count. Pure CSS
 * (`.streak-fire` in index.css): three flame tongues that sway, rising sparks
 * and a glowing base. It is sized in em, so set its size with a text-* class
 * (text-2xl ≈ 24px). Decorative: the streak number next to it carries the meaning.
 */
export function StreakFire({ lit = true, className }: StreakFireProps) {
  return (
    <span aria-hidden="true" className={cn('streak-fire', !lit && 'streak-fire--out', className)}>
      <span className="streak-fire__part streak-fire__left">
        <span className="streak-fire__flame" />
        <span className="streak-fire__spark" />
      </span>
      <span className="streak-fire__part streak-fire__center">
        <span className="streak-fire__flame" />
        <span className="streak-fire__heart" />
        <span className="streak-fire__spark" />
      </span>
      <span className="streak-fire__part streak-fire__right">
        <span className="streak-fire__flame" />
        <span className="streak-fire__spark" />
      </span>
      <span className="streak-fire__part streak-fire__bottom">
        <span className="streak-fire__flame" />
      </span>
    </span>
  )
}
