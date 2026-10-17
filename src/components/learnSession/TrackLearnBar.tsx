import { ActionLink } from '@/components/learn/ActionLink'
import { Icon } from '@/components/ui/Icon'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { TRACK_LABEL, lessonPath, reviewPath } from '@/lib/learn/paths'
import { cn } from '@/lib/cn'
import type { LearningTrack } from '@/types/learn'

interface TrackLearnBarProps {
  track: LearningTrack
  className?: string
}

/**
 * One track's reviews due and new items left today, with Review and Learn
 * actions. Signed-in learners only: renders nothing until the summary loads.
 */
export function TrackLearnBar({ track, className }: TrackLearnBarProps) {
  const { summary } = useLearnSummary(track)
  if (!summary) return null
  const due = summary.due_now
  return (
    <section
      aria-label={`${TRACK_LABEL[track]} reviews and lessons`}
      className={cn('flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 sm:flex-row sm:items-center', className)}
    >
      <p className="flex-1 text-sm tabular-nums text-on-surface-variant">
        <strong className="text-on-surface">{due > 0 ? `${due} review${due === 1 ? '' : 's'} due` : 'No reviews due'}</strong>
        {' · '}
        {summary.new_left_today} new left today
      </p>
      <div className="flex gap-2">
        {due > 0 && (
          <ActionLink to={reviewPath(track)} className="flex-1 sm:flex-none">
            <Icon name="replay" className="text-xl" /> Review
          </ActionLink>
        )}
        {summary.new_left_today > 0 && (
          <ActionLink to={lessonPath(track)} variant={due > 0 ? 'outline' : 'primary'} className="flex-1 sm:flex-none">
            <Icon name="school" className="text-xl" /> Learn new
          </ActionLink>
        )}
      </div>
    </section>
  )
}
