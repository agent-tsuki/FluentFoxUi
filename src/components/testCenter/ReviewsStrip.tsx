import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { useReviewGate } from '@/hooks/useReviewGate'
import { reviewPath } from '@/lib/learn/paths'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Spaced reviews on the Quiz page (they used to be a navbar link): how many
 * cards are due, and Review now, which starts the session like every Review
 * link (useReviewGate: a toast instead of an empty session when nothing is due).
 * Signed-in learners only.
 */
export function ReviewsStrip({ className }: { className?: string }) {
  const { user } = useAuth()
  const gateReview = useReviewGate()
  const summary = useLearnSummary().summary
  if (!user) return null
  const due = summary?.due_now ?? 0
  const later = summary?.due_today ?? 0

  return (
    <section
      aria-label="Reviews"
      className={cn(
        'flex items-center gap-3 rounded-xl border border-line bg-surface-raised/90 px-4 py-3 shadow-elevation-1 backdrop-blur-md/90',
        className,
      )}
    >
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon name="schedule" className="text-xl" />
      </span>
      <p className="min-w-0 flex-1 text-sm">
        <span className="block font-bold text-ink">{due > 0 ? `${due} review${due === 1 ? '' : 's'} due` : 'Reviews'}</span>
        <span className="block truncate text-ink-muted">
          {due > 0
            ? 'Cards from what you’ve learned, at the right time to remember them.'
            : later > 0
              ? `Nothing due right now; ${later} more later today.`
              : 'Nothing due right now. Learn new items and they come back here.'}
        </span>
      </p>
      <Link
        to={reviewPath()}
        onClick={gateReview()}
        className={cn(
          'inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          due > 0 ? 'bg-primary text-on-primary hover:bg-primary/90' : 'text-primary hover:bg-primary/10',
        )}
      >
        Review<span className="hidden sm:inline">&nbsp;now</span>
        <Icon name="arrow_forward" className="text-lg" />
      </Link>
    </section>
  )
}
