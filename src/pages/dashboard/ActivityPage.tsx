import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProgressCalendar, useProgressDashboard } from '@/hooks/useProgress'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { ColumnChart, type ColumnDatum } from '@/components/charts/ColumnChart'
import { LineChart } from '@/components/charts/LineChart'
import { AsyncBlock, DashboardPageHeader, Panel, Segmented, StatTile, trendOf } from '@/components/dashboard/DashboardBits'
import { StreakCalendar, StudyLog } from '@/components/sections/Dashboard'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  RANGE_OPTIONS,
  activitySummary,
  formatPointChange,
  formatShortDate,
  isRangeDays,
  lastDays,
  rollingAccuracy,
  weekdayPattern,
  weeklyTotals,
  type RangeDays,
} from '@/lib/dashboard/analytics'
import { formatMinutes, formatShare, streakCalendarFrom } from '@/lib/learn/progressShape'
import type { CalendarDay } from '@/types/progress'

const DEFAULT_RANGE: RangeDays = 90
/** Above this many days, answers are drawn per week instead of per day. */
const DAILY_LIMIT = 90
const ROLLING_WINDOW = 7

const dayLabel = (date: string) => String(Number(date.slice(8)))

function ActivityCharts({ days, range }: { days: CalendarDay[]; range: RangeDays }) {
  const summary = useMemo(() => activitySummary(days), [days])
  const weeks = useMemo(() => weeklyTotals(days), [days])
  const weekly = range > DAILY_LIMIT

  const answers = useMemo<ColumnDatum<'answers'>[]>(
    () =>
      weekly
        ? weeks.map((w) => ({ key: w.start, label: formatShortDate(w.start), title: `${formatShortDate(w.start)} – ${formatShortDate(w.end)}`, values: { answers: w.answers } }))
        : days.map((d) => ({ key: d.date, label: dayLabel(d.date), title: formatShortDate(d.date), values: { answers: d.answers } })),
    [days, weeks, weekly],
  )
  const accuracy = useMemo(() => {
    const rolling = rollingAccuracy(days, ROLLING_WINDOW)
    return days.map((d, i) => ({ key: d.date, label: weekly ? formatShortDate(d.date) : dayLabel(d.date), title: `${formatShortDate(d.date)} · last 7 days`, value: rolling[i] }))
  }, [days, weekly])
  // Zoom the accuracy axis to the data's band (in 10-point steps) so the trend is visible.
  const accuracyFloor = useMemo(() => {
    const seen = accuracy.flatMap((p) => (p.value === null ? [] : [p.value]))
    const STEP = 10
    return seen.length === 0 ? 0 : Math.max(0, Math.floor(Math.min(...seen) * STEP) / STEP - 1 / STEP)
  }, [accuracy])
  const minutes = useMemo<ColumnDatum<'minutes'>[]>(
    () => weeks.map((w) => ({ key: w.start, label: formatShortDate(w.start), title: `${formatShortDate(w.start)} – ${formatShortDate(w.end)}`, values: { minutes: w.minutes } })),
    [weeks],
  )
  const weekdays = useMemo(() => weekdayPattern(days), [days])
  const weekdayData = useMemo<ColumnDatum<'avg'>[]>(
    () => weekdays.map((w) => ({ key: w.label, label: w.label, title: `${w.label} · active ${formatShare(w.activeShare)} of weeks`, values: { avg: Math.round(w.avgAnswers) } })),
    [weekdays],
  )
  const bestWeekday = weekdays.reduce((best, w) => (w.avgAnswers > best.avgAnswers ? w : best), weekdays[0])
  const change = formatPointChange(summary.accuracyChange)

  if (summary.activeDays === 0) {
    return (
      <EmptyState
        icon="insights"
        title="No study in this window yet"
        description="Answer a few cards in a lesson or review and your habits, time and accuracy appear here."
        className="rounded-md bg-surface-sunken"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile icon="calendar_month" label="Active days" value={`${summary.activeDays}/${summary.days}`} hint={`${formatShare(summary.consistency)} consistency`} />
        <StatTile icon="task_alt" label="Goal hit rate" value={formatShare(summary.goalRate)} hint="Days with the daily goal met" />
        <StatTile
          icon="schedule"
          label="Study time"
          value={formatMinutes(summary.minutes)}
          hint={summary.minutesPerActiveDay === null ? undefined : `${Math.round(summary.minutesPerActiveDay)} min per active day`}
        />
        <StatTile
          icon="verified"
          label="Accuracy"
          value={formatShare(summary.accuracy)}
          change={change ? { label: `${change} vs first half`, trend: trendOf(summary.accuracyChange) } : null}
        />
        <StatTile icon="quiz" label="Answers" value={summary.answers.toLocaleString()} hint={summary.answersPerMinute === null ? undefined : `${summary.answersPerMinute.toFixed(1)} per minute`} />
        <StatTile icon="emoji_events" label="Best day" value={summary.bestDay?.answers ?? '–'} hint={summary.bestDay ? `answers on ${formatShortDate(summary.bestDay.date)}` : undefined} />
        <StatTile icon="event_available" label="Strongest weekday" value={bestWeekday.label} hint={`${Math.round(bestWeekday.avgAnswers)} answers on average`} />
        <StatTile icon="bolt" label="Avg per active day" value={Math.round(summary.answers / summary.activeDays)} hint="answers" />
      </div>

      <Panel title={weekly ? 'Answers per week' : 'Answers per day'} description="Every lesson, review and quiz answer counts.">
        <ColumnChart title={weekly ? 'Answers per week' : 'Answers per day'} data={answers} series={[{ key: 'answers', label: 'Answers', fill: 'bg-chart-1' }]} unit="answers" highlight={answers.length - 1} />
      </Panel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Accuracy trend" description="Share answered right over the trailing 7 days. Gaps are weeks off.">
          <LineChart title="Accuracy, 7-day rolling" points={accuracy} seriesLabel="Accuracy" format={(v) => formatShare(v)} max={1} min={accuracyFloor} colorClass="text-chart-3" />
        </Panel>
        <Panel title="Study time per week" description="Minutes of active study, 7 days at a time.">
          <ColumnChart title="Study minutes per week" data={minutes} series={[{ key: 'minutes', label: 'Minutes', fill: 'bg-chart-3' }]} unit="min" />
        </Panel>
      </div>

      <Panel title="Your week" description="Average answers on each weekday in this window, quiet days included.">
        <ColumnChart title="Average answers by weekday" data={weekdayData} series={[{ key: 'avg', label: 'Avg answers', fill: 'bg-chart-1' }]} unit="answers" heightClass="h-36" />
      </Panel>
    </div>
  )
}

/** /dashboard/activity: habits, time and accuracy over a chosen window. */
export function ActivityPage() {
  useDashboardTitle('Activity')
  const [params, setParams] = useSearchParams()
  const rawRange = Number(params.get('range'))
  const range: RangeDays = isRangeDays(rawRange) ? rawRange : DEFAULT_RANGE
  const setRange = useCallback(
    (next: RangeDays) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        p.set('range', String(next))
        return p
      }, { replace: true }),
    [setParams],
  )
  const calendar = useProgressCalendar()
  const dashboard = useProgressDashboard()
  const days = useMemo(() => (calendar.data ? lastDays(calendar.data.days, range) : []), [calendar.data, range])
  const heatmap = useMemo(() => (calendar.data ? streakCalendarFrom(calendar.data) : undefined), [calendar.data])

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Activity"
        title="Your study habits"
        description="How often, how long and how accurately you study. Pick a window to compare."
        actions={<Segmented label="Time range" value={range} options={RANGE_OPTIONS.map((o) => ({ value: o.days, label: o.label }))} onChange={setRange} />}
      />

      <AsyncBlock state={calendar} what="your activity" skeletonClassName="h-96">
        {() => <ActivityCharts days={days} range={range} />}
      </AsyncBlock>

      {heatmap && <StreakCalendar data={heatmap} />}

      {dashboard.data && dashboard.data.studyLog.length > 0 && <StudyLog entries={dashboard.data.studyLog} />}
    </div>
  )
}
