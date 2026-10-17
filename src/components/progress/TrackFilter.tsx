import type { LearningTrack } from '@/types/learn'
import { cn } from '@/lib/cn'
import { LEARNING_TRACKS, TRACK_LABEL } from '@/lib/learn/paths'

interface TrackFilterProps {
  value: LearningTrack | undefined
  onChange: (track: LearningTrack | undefined) => void
  className?: string
}

const OPTIONS: readonly { value: LearningTrack | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  ...LEARNING_TRACKS.map((t) => ({ value: t, label: TRACK_LABEL[t] })),
]

/** All tracks, or one: a segmented control for the progress page. */
export function TrackFilter({ value, onChange, className }: TrackFilterProps) {
  return (
    <div role="radiogroup" aria-label="Track" className={cn('flex flex-wrap gap-1 rounded-full bg-surface-container p-1', className)}>
      {OPTIONS.map((o) => {
        const checked = o.value === value
        return (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-11 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              checked ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
