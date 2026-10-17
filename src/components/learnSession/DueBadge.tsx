import { cn } from '@/lib/cn'

interface DueBadgeProps {
  count: number
  className?: string
}

const MAX_SHOWN = 99

/** Small count pill for due reviews; renders nothing at zero. */
export function DueBadge({ count, className }: DueBadgeProps) {
  if (count <= 0) return null
  return (
    <span
      className={cn('inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-2xs font-bold leading-5 text-on-primary tabular-nums', className)}
    >
      {count > MAX_SHOWN ? `${MAX_SHOWN}+` : count}
      <span className="sr-only"> due</span>
    </span>
  )
}
