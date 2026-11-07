import { useCallback, useMemo } from 'react'
import { useReviewGate } from '@/hooks/useReviewGate'
import { Link, useSearchParams } from 'react-router-dom'
import type { LearningTrack } from '@/types/learn'
import { useProgressForecast, useProgressOverview } from '@/hooks/useProgress'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { BarList } from '@/components/charts/BarList'
import { ColumnChart, type ColumnDatum } from '@/components/charts/ColumnChart'
import { AsyncBlock, DashboardPageHeader, Panel, Segmented, StatTile } from '@/components/dashboard/DashboardBits'
import { RetentionCard } from '@/components/progress'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { forecastSummary, formatShortDate } from '@/lib/dashboard/analytics'
import { TRACK_FILL, TRACK_SERIES } from '@/lib/dashboard/trackSeries'
import { MASTERY_HINT, MASTERY_LABEL, MASTERY_LEVELS, MASTERY_TONE } from '@/lib/learn/mastery'
import { LEARNING_TRACKS, TRACK_LABEL, reviewPath } from '@/lib/learn/paths'
import { formatShare } from '@/lib/learn/progressShape'
import type { ProgressForecast, ProgressOverview } from '@/types/progress'

const WINDOWS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
] as const
type Window = (typeof WINDOWS)[number]['value']
const DEFAULT_WINDOW: Window = 14
const isWindow = (n: number): n is Window => WINDOWS.some((w) => w.value === n)

function ForecastBody({ forecast, windowDays }: { forecast: ProgressForecast; windowDays: Window }) {
  const summary = useMemo(() => forecastSummary(forecast.days), [forecast.days])
  const data = useMemo<ColumnDatum<LearningTrack>[]>(
    () =>
      forecast.days.map((d, i) => ({
        key: d.date,
        label: i === 0 ? 'Today' : String(Number(d.date.slice(8))),
        title: i === 0 ? `Today, ${formatShortDate(d.date)} (overdue included)` : formatShortDate(d.date),
        values: Object.fromEntries(LEARNING_TRACKS.map((t) => [t, d.by_track[t] ?? 0])) as Record<LearningTrack, number>,
      })),
    [forecast.days],
  )
  if (summary.total === 0) {
    return <EmptyState icon="event_available" title="No reviews scheduled" description="Learn something new and its reviews appear here." className="rounded-xl bg-surface-container-low" />
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile icon="reviews" label={`Next ${windowDays} days`} value={summary.total} hint="reviews due" />
        <StatTile icon="calendar_today" label="Today" value={summary.dueToday} hint="overdue included" />
        <StatTile icon="calendar_month" label="Per day" value={summary.avgPerDay.toFixed(1)} hint="on average" />
        <StatTile icon="bolt" label="Busiest day" value={summary.peak?.total ?? '–'} hint={summary.peak ? formatShortDate(summary.peak.date) : undefined} />
      </div>
      <Panel title="Review forecast" description="Cards due each day, by track. A steady load means you are learning at a sustainable pace.">
        <ColumnChart title={`Reviews due per day, next ${windowDays} days`} data={data} series={TRACK_SERIES} unit="reviews" maxXLabels={windowDays <= 14 ? 14 : 10} />
      </Panel>
      <Panel title="Where the load comes from" description={`Share of the next ${windowDays} days' reviews per track.`}>
        <BarList
          label="Reviews by track"
          rows={LEARNING_TRACKS.map((t) => ({
            key: t,
            label: TRACK_LABEL[t],
            share: summary.byTrack[t] / summary.total,
            display: `${summary.byTrack[t]} · ${formatShare(summary.byTrack[t] / summary.total)}`,
            fill: TRACK_FILL[t],
          }))}
        />
      </Panel>
    </div>
  )
}

/** All items across tracks by level: the pipeline cards move through. */
function CardPipeline({ overview }: { overview: ProgressOverview }) {
  const totals = MASTERY_LEVELS.map((level) => ({ level, count: overview.tracks.reduce((n, t) => n + t.items_per_level[level], 0) }))
  const all = totals.reduce((n, t) => n + t.count, 0)
  return (
    <Panel title="Card pipeline" description="Every item across tracks, by how long you hold it. Reviews move cards down this list.">
      <BarList
        label="Items by mastery level"
        rows={totals.map(({ level, count }) => ({
          key: level,
          label: MASTERY_LABEL[level],
          note: MASTERY_HINT[level],
          share: all > 0 ? count / all : 0,
          display: count.toLocaleString(),
          fill: MASTERY_TONE[level].fill,
        }))}
      />
    </Panel>
  )
}

/** Recall per track over the last 30 days. */
function RecallByTrack({ overview }: { overview: ProgressOverview }) {
  return (
    <Panel title="Recall by track" description="Share of reviews you remembered in the last 30 days.">
      <BarList
        label="Recall by track"
        rows={overview.tracks.map((t) => ({
          key: t.track,
          label: TRACK_LABEL[t.track],
          share: t.retention_30d,
          display: formatShare(t.retention_30d),
          fill: TRACK_FILL[t.track],
        }))}
      />
    </Panel>
  )
}

/** /dashboard/review: what is due, how well you remember, and the load ahead. */
export function ReviewInsightsPage() {
  useDashboardTitle('Review')
  const [params, setParams] = useSearchParams()
  const raw = Number(params.get('days'))
  const windowDays: Window = isWindow(raw) ? raw : DEFAULT_WINDOW
  const setWindow = useCallback(
    (next: Window) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        p.set('days', String(next))
        return p
      }, { replace: true }),
    [setParams],
  )
  const forecast = useProgressForecast(windowDays)
  const overview = useProgressOverview()
  const gateReview = useReviewGate()
  const dueNow = overview.data?.today.due_now ?? 0

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        eyebrow="Review"
        title="Reviews & recall"
        description="Spaced repetition brings each card back just before you'd forget it. Here's the load ahead and how well it's sticking."
        actions={<Segmented label="Forecast window" value={windowDays} options={WINDOWS} onChange={setWindow} />}
      />

      <Link
        to={reviewPath()}
        onClick={gateReview()}
        className="flex items-center justify-between gap-4 rounded-xl bg-primary p-5 text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span>
          <span className="block font-headline text-2xl font-extrabold tabular-nums">{dueNow} due now</span>
          <span className="block text-sm opacity-90">{dueNow > 0 ? 'Clear them to keep recall on target.' : 'All caught up. Nice!'}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold">
          Start review <Icon name="arrow_forward" className="text-lg" />
        </span>
      </Link>

      <AsyncBlock state={forecast} what="your review forecast" skeletonClassName="h-96">
        {(f) => <ForecastBody forecast={f} windowDays={windowDays} />}
      </AsyncBlock>

      <AsyncBlock state={overview} what="your recall">
        {(o) => (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {o.retention ? <RetentionCard retention={o.retention} /> : <RecallByTrack overview={o} />}
            {o.retention ? <RecallByTrack overview={o} /> : null}
            <div className="xl:col-span-2">
              <CardPipeline overview={o} />
            </div>
          </div>
        )}
      </AsyncBlock>
    </div>
  )
}
