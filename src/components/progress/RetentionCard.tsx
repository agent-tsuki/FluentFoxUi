import type { RetentionInfo } from '@/types/progress'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { cn } from '@/lib/cn'
import { formatShare } from '@/lib/learn/progressShape'

const PERCENT = 100

/**
 * "Your recall vs target": the share of reviews recalled in the last 30 days
 * against the learner's target retention. Hidden by the caller when the
 * learner turned retention off (the API then leaves it out).
 */
export function RetentionCard({ retention, className }: { retention: RetentionInfo; className?: string }) {
  const { actual, target } = retention
  const below = actual !== null && actual < target
  return (
    <section aria-label="Your recall vs target" className={cn('rounded-xl bg-surface-container-low p-6 space-y-4', className)}>
      <div>
        <Eyebrow variant="plain">Retention</Eyebrow>
        <h2 className="font-headline text-xl font-extrabold tracking-tight text-on-surface">Your recall vs target</h2>
      </div>
      {actual === null ? (
        <p className="text-sm text-on-surface-variant">No reviews in the last 30 days yet. Your recall shows here after your first reviews.</p>
      ) : (
        <>
          <p className="flex items-baseline gap-2">
            <span className={cn('font-headline text-4xl font-extrabold tabular-nums', below ? 'text-warning' : 'text-success')}>{formatShare(actual)}</span>
            <span className="text-sm text-on-surface-variant">recalled · target {formatShare(target)}</span>
          </p>
          <div className="relative h-2.5 w-full rounded-full bg-surface-container-high" role="img" aria-label={`Recall ${formatShare(actual)}, target ${formatShare(target)}`}>
            <span className={cn('absolute inset-y-0 left-0 rounded-full', below ? 'bg-warning' : 'bg-success')} style={{ width: `${actual * PERCENT}%` }} />
            <span aria-hidden className="absolute -inset-y-1 w-0.5 rounded-full bg-on-surface" style={{ left: `${target * PERCENT}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant">
            {below
              ? 'A little under target: reviews will come back a bit sooner until recall catches up.'
              : 'On target. Change the target or hide this under Settings → Learning.'}
          </p>
        </>
      )}
    </section>
  )
}
