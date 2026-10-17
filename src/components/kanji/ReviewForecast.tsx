import { cn } from '@/lib/cn'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * ReviewForecast — reviews due over the next 7 days as small bars, with the
 * count and day under each bar (the text carries the numbers, the bars are
 * decorative). Day 0 includes anything overdue.
 */
export function ReviewForecast({ counts, className }: { counts: number[]; className?: string }) {
  const today = new Date().getDay()
  const max = Math.max(1, ...counts)
  return (
    <div className={className}>
      <h3 className="text-xs font-semibold text-on-surface-variant">Next 7 days</h3>
      <ol className="mt-2 grid max-w-md grid-cols-7 gap-1.5">
        {counts.map((n, i) => (
          <li key={i} className="flex flex-col items-center gap-1">
            <span className="flex h-12 w-full items-end justify-center">
              <span
                aria-hidden
                className={cn('w-full max-w-8 rounded-t-md', i === 0 ? 'bg-primary' : 'bg-primary/30')}
                style={{ height: `${Math.max(n > 0 ? 10 : 3, (n / max) * 100)}%` }}
              />
            </span>
            <span className="text-xs font-semibold tabular-nums text-on-surface">{n}</span>
            <span className="text-2xs text-on-surface-variant">{i === 0 ? 'Today' : DAY_NAMES[(today + i) % 7]}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
