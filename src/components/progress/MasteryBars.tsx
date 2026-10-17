import { memo } from 'react'
import type { TrackOverview } from '@/types/progress'
import { cn } from '@/lib/cn'
import { MASTERY_HINT, MASTERY_LABEL, MASTERY_LEVELS, MASTERY_TONE, levelSegments } from '@/lib/learn/mastery'
import { TRACK_LABEL } from '@/lib/learn/paths'
import { formatShare } from '@/lib/learn/progressShape'

/** Key for the five mastery colours; shared by every mastery bar. */
export function MasteryLegend({ className }: { className?: string }) {
  return (
    <ul aria-label="Mastery levels" className={cn('flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant', className)}>
      {MASTERY_LEVELS.map((level) => (
        <li key={level} className="flex items-center gap-1.5" title={MASTERY_HINT[level]}>
          <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', MASTERY_TONE[level].fill)} />
          {MASTERY_LABEL[level]}
        </li>
      ))}
    </ul>
  )
}

/** One track's items as a stacked New → Mastered bar, with its counts underneath. */
export const TrackMasteryBar = memo(function TrackMasteryBar({ track }: { track: TrackOverview }) {
  const segments = levelSegments(track.items_per_level)
  const summary = MASTERY_LEVELS.map((l) => `${track.items_per_level[l]} ${MASTERY_LABEL[l].toLowerCase()}`).join(', ')
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-headline text-base font-bold text-on-surface">{TRACK_LABEL[track.track]}</h3>
        <p className="text-xs text-on-surface-variant tabular-nums">
          <span className="font-semibold text-on-surface">{track.items_per_level.mastered}</span> of {track.total_items} mastered
        </p>
      </div>
      <div role="img" aria-label={`${TRACK_LABEL[track.track]}: ${summary}`} className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
        {segments.map((s) => (
          <span key={s.level} className={cn('h-full', MASTERY_TONE[s.level].fill)} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant tabular-nums">
        {MASTERY_LEVELS.map((level) => (
          <div key={level} className="flex gap-1">
            <dt className={MASTERY_TONE[level].text}>{MASTERY_LABEL[level]}</dt>
            <dd className="font-semibold text-on-surface">{track.items_per_level[level]}</dd>
          </div>
        ))}
        <div className="flex gap-1">
          <dt>30-day recall</dt>
          <dd className="font-semibold text-on-surface">{formatShare(track.retention_30d)}</dd>
        </div>
      </dl>
    </div>
  )
})

/** Mastery per track (GET /progress/overview). */
export function MasteryBars({ tracks }: { tracks: readonly TrackOverview[] }) {
  return (
    <div className="space-y-6">
      {tracks.map((t) => (
        <TrackMasteryBar key={t.track} track={t} />
      ))}
      <MasteryLegend />
    </div>
  )
}
