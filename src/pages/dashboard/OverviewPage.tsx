import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useProgressCalendar, useProgressDashboard, useProgressOverview } from '@/hooks/useProgress'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { AsyncBlock, DashboardPageHeader, Panel, StatTile } from '@/components/dashboard/DashboardBits'
import { MasteryBars, RetentionCard } from '@/components/progress'
import { LearningBalance, MilestoneList } from '@/components/sections/Dashboard'
import { TodayPanel } from '@/components/learnSession/TodayPanel'
import { formatSeconds, formatShortDate, lastDays } from '@/lib/dashboard/analytics'
import { formatMinutes } from '@/lib/learn/progressShape'
import type { ProgressOverview } from '@/types/progress'
import { TextLink } from '@/components/ui/TextLink'

const RECENT_DAYS = 30
const WEEK = 7
const MS_PER_MINUTE = 60_000

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Mean answer time across tracks that have one, weighted by item count. */
function meanAnswerMs(overview: ProgressOverview): number | null {
  let weight = 0
  let sum = 0
  for (const t of overview.tracks) {
    if (t.avg_answer_ms === null) continue
    weight += t.total_items
    sum += t.avg_answer_ms * t.total_items
  }
  return weight > 0 ? sum / weight : null
}

/** /dashboard: today, headline numbers, the last month and where each track stands. */
export function OverviewPage() {
  useDashboardTitle('Overview')
  const { user } = useAuth()
  const overview = useProgressOverview()
  const calendar = useProgressCalendar()
  const dashboard = useProgressDashboard()

  const recent = useMemo(() => (calendar.data ? lastDays(calendar.data.days, RECENT_DAYS) : []), [calendar.data])
  const weekMinutes = useMemo(() => lastDays(recent, WEEK).reduce((n, d) => n + d.minutes, 0), [recent])
  const recentData = useMemo(
    () => recent.map((d) => ({ key: d.date, label: String(Number(d.date.slice(8))), title: formatShortDate(d.date), values: { answers: d.answers } })),
    [recent],
  )
  const jlpt = dashboard.data?.stats

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Overview"
        title={`${greeting()}, ${user?.firstName ?? 'learner'}.`}
        description={
          jlpt ? (
            <>
              You are <span className="font-semibold text-on-surface">{Math.round(jlpt.jlptProgress)}%</span> of the way to JLPT {jlpt.targetLevel}. Here is how today and the last month went.
            </>
          ) : (
            'Here is how today and the last month went.'
          )
        }
      />

      <AsyncBlock state={overview} what="your progress" skeletonClassName="h-28">
        {(o) => (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatTile icon="local_fire_department" label="Streak" value={`${o.streak.current} d`} hint={`Longest ${o.streak.longest} days`} />
            <StatTile
              icon="task_alt"
              label="Today's goal"
              value={`${o.today.answers}/${o.today.goal_answers}`}
              hint={o.today.goal_met ? 'Goal met. Nice work!' : `${Math.max(0, o.today.goal_answers - o.today.answers)} answers to go`}
            />
            <StatTile icon="reviews" label="Due now" value={o.today.due_now} hint={`${formatMinutes(Math.round(o.today.active_ms / MS_PER_MINUTE))} studied today`} />
            <StatTile
              icon="timer"
              label="Avg answer"
              value={formatSeconds(meanAnswerMs(o))}
              hint={calendar.data ? `${formatMinutes(weekMinutes)} this week` : 'Correct answers, 30 days'}
            />
          </div>
        )}
      </AsyncBlock>

      <TodayPanel />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Answers, last 30 days"
          description="Every card you answered, per day. Today is in orange."
          actions={
            <TextLink to="/dashboard/activity">Full activity</TextLink>
          }
        >
          <AsyncBlock state={calendar} what="your activity" skeletonClassName="h-48">
            {() => <ColumnChart title="Answers per day, last 30 days" data={recentData} series={[{ key: 'answers', label: 'Answers', fill: 'bg-chart-1' }]} unit="answers" highlight={recentData.length - 1} />}
          </AsyncBlock>
        </Panel>
        <AsyncBlock state={overview} what="your recall">
          {(o) =>
            o.retention ? (
              <RetentionCard retention={o.retention} />
            ) : (
              <Panel title="Retention" description="Hidden in your settings.">
                <p className="text-sm text-on-surface-variant">Turn it on under Profile → Learning to compare recall with your target.</p>
              </Panel>
            )
          }
        </AsyncBlock>
      </div>

      <Panel title="Where each track stands" description="Items per track by mastery level, with 30-day recall.">
        <AsyncBlock state={overview} what="your mastery">
          {(o) => <MasteryBars tracks={o.tracks} />}
        </AsyncBlock>
      </Panel>

      <AsyncBlock state={dashboard} what="your skills and milestones">
        {(d) => (
          <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2">
            <LearningBalance balance={d.skillBalance} />
            <MilestoneList milestones={d.milestones} />
          </div>
        )}
      </AsyncBlock>
    </div>
  )
}
