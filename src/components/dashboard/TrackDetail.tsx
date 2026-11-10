import { useMemo, type ReactNode } from 'react'
import { useReviewGate } from '@/hooks/useReviewGate'
import { Link } from 'react-router-dom'
import type { LearningTrack } from '@/types/learn'
import { useConfusions, useProgressForecast, useProgressOverview, useWeakItems } from '@/hooks/useProgress'
import { ColumnChart, type ColumnDatum } from '@/components/charts/ColumnChart'
import { ConfusionList, TrackMasteryBar, WeakItemsList } from '@/components/progress'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { formatSeconds, formatShortDate } from '@/lib/dashboard/analytics'
import { TRACK_FILL } from '@/lib/dashboard/trackSeries'
import { startedCount } from '@/lib/learn/mastery'
import { TRACK_LABEL, lessonPath, reviewPath } from '@/lib/learn/paths'
import { formatShare } from '@/lib/learn/progressShape'
import { AsyncBlock, Panel, StatTile } from './DashboardBits'
import { CharacterMosaic } from './CharacterMosaic'

const FORECAST_DAYS = 30
const WEAK_LIMIT = 8
const CONFUSION_LIMIT = 6

interface TrackDetailProps {
  track: LearningTrack
  /** Extra panels for this track (kanji skill split), shown after the mosaic. */
  children?: ReactNode
}

/**
 * Everything about one learning track: headline numbers, every character by
 * level, the level breakdown, the next month of reviews, and the cards and
 * look-alike pairs that trip the learner up.
 */
export function TrackDetail({ track, children }: TrackDetailProps) {
  const overview = useProgressOverview()
  const gateReview = useReviewGate()
  const forecast = useProgressForecast(FORECAST_DAYS)
  const weak = useWeakItems(track, WEAK_LIMIT)
  const confusions = useConfusions(track, CONFUSION_LIMIT)
  const label = TRACK_LABEL[track]
  const data = overview.data?.tracks.find((t) => t.track === track)

  const upcoming = useMemo<ColumnDatum<LearningTrack>[]>(
    () =>
      (forecast.data?.days ?? []).map((d) => ({
        key: d.date,
        label: String(Number(d.date.slice(8))),
        title: formatShortDate(d.date),
        values: { [track]: d.by_track[track] ?? 0 } as Record<LearningTrack, number>,
      })),
    [forecast.data, track],
  )
  const upcomingTotal = upcoming.reduce((n, d) => n + (d.values[track] ?? 0), 0)

  return (
    <div className="space-y-6">
      <AsyncBlock state={overview} what={`your ${label} progress`} skeletonClassName="h-28">
        {() =>
          data ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <StatTile icon="workspace_premium" label="Mastered" value={`${data.items_per_level.mastered}/${data.total_items}`} hint={`${Math.round(data.mastered_pct)}% of ${label}`} />
              <StatTile icon="school" label="Started" value={startedCount(data.items_per_level)} hint={`${data.items_per_level.new} still new`} />
              <StatTile icon="verified" label="30-day recall" value={formatShare(data.retention_30d)} hint="Reviews remembered" />
              <StatTile icon="timer" label="Avg answer" value={formatSeconds(data.avg_answer_ms)} hint="Correct answers, last 30 days" />
            </div>
          ) : (
            <EmptyState icon="school" title={`${label} not started`} description="Start the first lesson and your progress shows here." className="rounded-md bg-surface-sunken" />
          )
        }
      </AsyncBlock>

      <div className="flex flex-wrap gap-3">
        <Link to={lessonPath(track)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90">
          <Icon name="play_circle" className="text-lg" /> Learn new {label}
        </Link>
        <Link to={reviewPath(track)} onClick={gateReview(track)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover">
          <Icon name="reviews" className="text-lg" /> Review {label}
        </Link>
      </div>

      {data && (
        <Panel title="Level breakdown" description="How long you hold each item: from new to remembered three weeks or more.">
          <TrackMasteryBar track={data} />
        </Panel>
      )}

      {data?.items && data.items.length > 0 && (
        <Panel title={`Every ${label} character`} description="Each tile is tinted by its level. Tap a level to show only those.">
          <CharacterMosaic items={data.items} name={label} />
        </Panel>
      )}

      {children}

      <Panel title="Upcoming reviews" description={`${label} cards due each day for the next 30 days. Overdue cards count today.`}>
        <AsyncBlock state={forecast} what="your review forecast" skeletonClassName="h-48">
          {() =>
            upcomingTotal === 0 ? (
              <EmptyState icon="event_available" title="Nothing scheduled" description={`Learn some ${label} and their reviews appear here.`} className="py-8" />
            ) : (
              <ColumnChart title={`${label} reviews due per day`} data={upcoming} series={[{ key: track, label: 'Reviews', fill: TRACK_FILL[track] }]} unit="reviews" />
            )
          }
        </AsyncBlock>
      </Panel>

      <div className="space-y-6">
        <Panel title="Hardest cards" description="Weakest first, with the reason.">
          <AsyncBlock state={weak} what="your weak cards">
            {(items) => (items.length === 0 ? <EmptyState icon="verified" title="No weak cards" description="Nothing stands out yet." className="py-8" /> : <WeakItemsList items={items} />)}
          </AsyncBlock>
        </Panel>
        <Panel title="Mix-ups" description="Pairs you confuse most. Tap one to drill it.">
          <AsyncBlock state={confusions} what="your mix-ups">
            {(pairs) => (pairs.length === 0 ? <EmptyState icon="compare_arrows" title="No mix-ups yet" description="Confused pairs show up here." className="py-8" /> : <ConfusionList pairs={pairs} />)}
          </AsyncBlock>
        </Panel>
      </div>
    </div>
  )
}
