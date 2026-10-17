import { ActionLink } from '@/components/learn/ActionLink'
import { Icon } from '@/components/ui/Icon'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { LEARNING_TRACKS, TRACK_LABEL, lessonPath, reviewPath } from '@/lib/learn/paths'
import { DueBadge } from './DueBadge'

/**
 * Dashboard "Today" card: Review all with its due count, today's goal, and a
 * lesson start per track. Falls back to plain links when the summary fails.
 */
export function TodayPanel() {
  const { summary } = useLearnSummary()
  const due = summary?.due_now ?? 0
  return (
    <section
      aria-labelledby="today-heading"
      className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 dark:border-outline/60 dark:bg-surface-container-low sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Today</p>
      <h2 id="today-heading" className="mt-1.5 font-headline text-xl font-bold text-on-surface md:text-2xl">
        {summary ? (due > 0 ? `${due} review${due === 1 ? '' : 's'} due` : 'No reviews due right now') : 'Reviews and lessons'}
      </h2>
      {summary && (
        <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
          {summary.goal.answers_today} of {summary.goal.goal_answers} answers today
          {summary.goal.met && ' · goal met'} · {summary.new_left_today} new left today
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionLink to={reviewPath()}>
          <Icon name="replay" className="text-xl" />
          Review all
          <DueBadge count={due} className="bg-on-primary text-primary" />
        </ActionLink>
        {LEARNING_TRACKS.map((track) => (
          <ActionLink key={track} to={lessonPath(track)} variant="outline">
            <Icon name="school" className="text-xl" />
            Learn {TRACK_LABEL[track]}
          </ActionLink>
        ))}
      </div>
    </section>
  )
}
