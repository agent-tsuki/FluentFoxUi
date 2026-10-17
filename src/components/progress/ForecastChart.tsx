import { useMemo } from 'react'
import type { LearningTrack } from '@/types/learn'
import type { ForecastDay } from '@/types/progress'
import { cn } from '@/lib/cn'
import { forecastBars, forecastTotal } from '@/lib/learn/progressShape'

/** Smallest visible bar for a day with any reviews. */
const MIN_BAR_PCT = 4

interface ForecastChartProps {
  days: readonly ForecastDay[]
  /** One track's reviews, or every track's when omitted. */
  track?: LearningTrack
  className?: string
}

/** Reviews due per day as a bar chart, today first (overdue reviews count today). */
export function ForecastChart({ days, track, className }: ForecastChartProps) {
  const bars = useMemo(() => forecastBars(days, track), [days, track])
  const total = forecastTotal(bars)
  return (
    <figure className={cn('space-y-3', className)}>
      <figcaption className="text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface tabular-nums">{total}</span> reviews over the next {bars.length} days · today in orange, overdue included
      </figcaption>
      <ol className="grid h-40 items-end gap-1 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}>
        {bars.map((b, i) => (
          <li key={b.date} className="flex h-full flex-col items-center justify-end gap-1" aria-label={`${b.label} ${b.dayOfMonth}: ${b.count} reviews`}>
            <span aria-hidden className="text-2xs font-semibold tabular-nums text-on-surface-variant">{b.count > 0 ? b.count : ''}</span>
            <span aria-hidden className="flex w-full flex-1 items-end">
              <span
                className={cn('block w-full rounded-t-md', b.count === 0 ? 'bg-outline-variant/50' : i === 0 ? 'bg-primary' : 'bg-primary/45')}
                style={{ height: b.count === 0 ? '2px' : `${Math.max(b.pct, MIN_BAR_PCT)}%` }}
              />
            </span>
            <span aria-hidden className={cn('text-2xs tabular-nums', i === 0 ? 'font-bold text-primary' : 'text-on-surface-variant')}>{b.dayOfMonth}</span>
          </li>
        ))}
      </ol>
    </figure>
  )
}
