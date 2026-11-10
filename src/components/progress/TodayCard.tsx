import type { ProgressOverview } from '@/types/progress'
import { Icon } from '@/components/ui/Icon'
import { TextLink } from '@/components/ui/TextLink'

/** Today's answers against the daily goal, the streak and what is due. */
export function TodayCard({ overview }: { overview: ProgressOverview }) {
  const { today, streak } = overview
  return (
    <div className="rounded-md bg-surface-sunken p-6 space-y-4">
      <h3 className="font-display text-lg font-bold text-ink">Today</h3>
      <p className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold tabular-nums text-ink">{today.answers}</span>
        <span className="text-sm text-ink-muted">of {today.goal_answers} answers</span>
      </p>
      <p className={today.goal_met ? 'flex items-center gap-1.5 text-sm font-semibold text-success' : 'text-sm text-ink-muted'}>
        {today.goal_met && <Icon name="check_circle" className="text-base" />}
        {today.goal_met ? 'Daily goal met' : `${Math.max(today.goal_answers - today.answers, 0)} more to meet your goal`}
      </p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-muted">Streak</dt>
          <dd className="font-semibold text-ink tabular-nums">{streak.current} days</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Longest</dt>
          <dd className="font-semibold text-ink tabular-nums">{streak.longest} days</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Due now</dt>
          <dd className="font-semibold text-ink tabular-nums">{today.due_now}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">New today</dt>
          <dd className="font-semibold text-ink tabular-nums">{today.new_learned}</dd>
        </div>
      </dl>
      <TextLink to="/profile?tab=learning" leadingIcon="tune" trailingIcon={null}>
        Change daily goal
      </TextLink>
    </div>
  )
}
