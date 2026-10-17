import { Link } from 'react-router-dom'
import type { ProgressOverview } from '@/types/progress'
import { Icon } from '@/components/ui/Icon'

/** Today's answers against the daily goal, the streak and what is due. */
export function TodayCard({ overview }: { overview: ProgressOverview }) {
  const { today, streak } = overview
  return (
    <div className="rounded-xl bg-surface-container-low p-6 space-y-4">
      <h3 className="font-headline text-lg font-bold text-on-surface">Today</h3>
      <p className="flex items-baseline gap-2">
        <span className="font-headline text-4xl font-extrabold tabular-nums text-on-surface">{today.answers}</span>
        <span className="text-sm text-on-surface-variant">of {today.goal_answers} answers</span>
      </p>
      <p className={today.goal_met ? 'flex items-center gap-1.5 text-sm font-semibold text-success' : 'text-sm text-on-surface-variant'}>
        {today.goal_met && <Icon name="check_circle" className="text-base" />}
        {today.goal_met ? 'Daily goal met' : `${Math.max(today.goal_answers - today.answers, 0)} more to meet your goal`}
      </p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-on-surface-variant">Streak</dt>
          <dd className="font-semibold text-on-surface tabular-nums">{streak.current} days</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Longest</dt>
          <dd className="font-semibold text-on-surface tabular-nums">{streak.longest} days</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Due now</dt>
          <dd className="font-semibold text-on-surface tabular-nums">{today.due_now}</dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">New today</dt>
          <dd className="font-semibold text-on-surface tabular-nums">{today.new_learned}</dd>
        </div>
      </dl>
      <Link to="/profile?tab=learning" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4">
        <Icon name="tune" className="text-base" />
        Change daily goal
      </Link>
    </div>
  )
}
