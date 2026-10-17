import { memo } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { easings } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { PATH_COPY, type PathStop } from '@/lib/content/home/path'

/** Ease used for the track draw and the train/fill moving between stops. */
const TRACK_EASE = [0.65, 0, 0.35, 1] as const

interface PathTrackProps {
  stops: readonly PathStop[]
  current: number
  onSelect: (index: number) => void
}

/**
 * The rail line: a drawn track, a peach fill up to the current stop, a little
 * train that glides to it, and one station button per stop.
 *
 * Geometry: each station cell has `pt-10` (40px) above a 48px dot, so the dot
 * centre sits 64px from the top; the 6px track is placed at 61px to run through it.
 * The track spans the centres of the first and last cells (12.5% → 87.5%).
 */
export function PathTrack({ stops, current, onSelect }: PathTrackProps) {
  const reducedMotion = useReducedMotion()
  const lastIndex = Math.max(stops.length - 1, 1)
  const cellPct = 100 / stops.length
  const firstCentre = cellPct / 2
  const span = 100 - cellPct

  return (
    <div className="relative">
      {/* Base track — draws in left-to-right on first view. */}
      <motion.div
        aria-hidden="true"
        className="absolute top-[61px] h-1.5 origin-left rounded-full bg-on-surface-inverse-variant/25"
        style={{ left: `${firstCentre}%`, width: `${span}%` }}
        initial={reducedMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease: TRACK_EASE, delay: 0.1 }}
      />

      {/* Progress fill up to the current stop. */}
      <div
        aria-hidden="true"
        className="absolute top-[61px] h-1.5 rounded-full bg-primary-fixed-dim transition-[width] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
        style={{ left: `${firstCentre}%`, width: `${(current / lastIndex) * span}%` }}
      />

      {/* Train — pops in after the track draws, then bobs gently and slides between stops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-2 z-[2] -translate-x-1/2 leading-none transition-[left] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
        style={{ left: `${firstCentre + current * cellPct}%` }}
      >
        <motion.span
          className="block"
          initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 1.2 }}
        >
          <motion.span
            className="block"
            animate={reducedMotion ? { y: 0 } : { y: [0, -2, 0] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          >
            <TrainGlyph />
          </motion.span>
        </motion.span>
      </div>

      <div
        role="group"
        aria-label={PATH_COPY.stationsLabel}
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${stops.length}, minmax(0, 1fr))` }}
      >
        {stops.map((stop, i) => (
          <Station
            key={stop.en}
            stop={stop}
            index={i}
            isCurrent={i === current}
            isDone={i < current}
            reducedMotion={reducedMotion}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

interface StationProps {
  stop: PathStop
  index: number
  isCurrent: boolean
  isDone: boolean
  reducedMotion: boolean
  onSelect: (index: number) => void
}

const Station = memo(function Station({
  stop,
  index,
  isCurrent,
  isDone,
  reducedMotion,
  onSelect,
}: StationProps) {
  const locked = Boolean(stop.locked)

  return (
    <motion.button
      type="button"
      aria-pressed={isCurrent}
      aria-label={`Stop ${index + 1}: ${stop.en}${locked ? PATH_COPY.plannedSuffix : ''}`}
      onClick={() => onSelect(index)}
      className="group flex min-w-0 flex-col items-center gap-2.5 rounded-2xl px-1 pb-2 pt-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 focus-visible:ring-offset-surface-inverse"
      initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.35 + index * 0.18 }}
    >
      <span className="relative flex h-12 w-12 shrink-0">
        {isCurrent && !reducedMotion && (
          // Expanding halo behind the current stop (replaces the mockup's box-shadow pulse).
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary-fixed-dim"
            initial={{ scale: 1, opacity: 0.55 }}
            animate={{ scale: 1.67, opacity: 0 }}
            transition={{ duration: 2, ease: easings.out, repeat: Infinity }}
          />
        )}
        <span
          className={cn(
            'relative z-[1] flex h-12 w-12 items-center justify-center rounded-full border-[3px] font-headline text-lg font-extrabold transition-colors duration-300',
            isCurrent && 'border-primary-fixed-dim bg-primary text-on-primary',
            isDone && 'border-primary-fixed-dim bg-primary-fixed-dim text-surface-inverse',
            !isCurrent &&
              !isDone &&
              cn(
                'bg-surface-inverse text-on-surface-inverse-variant border-on-surface-inverse-variant/60 group-hover:border-primary-fixed-dim group-focus-visible:border-primary-fixed-dim',
                locked && 'border-dashed'
              )
          )}
        >
          {isDone ? (
            <Icon name="check" className="text-2xl" />
          ) : locked ? (
            <Icon name="lock" className="text-xl" />
          ) : (
            index + 1
          )}
        </span>
      </span>
      <span
        lang="ja"
        className={cn(
          'font-jp max-w-full break-keep text-[clamp(0.8125rem,2vw,1.25rem)] font-bold leading-tight',
          isCurrent ? 'text-on-surface-inverse' : 'text-on-surface-inverse-variant'
        )}
      >
        {stop.ja}
      </span>
      <span className="text-sm font-bold text-on-surface-inverse-variant">{stop.en}</span>
    </motion.button>
  )
})

/** The little train, drawn in the peach accent with band-coloured windows. */
function TrainGlyph() {
  return (
    <svg width="46" height="28" viewBox="0 0 46 28" fill="none" className="text-primary-fixed-dim">
      <rect x="1" y="1" width="44" height="20" rx="8" fill="currentColor" />
      <rect x="7" y="5" width="9" height="7" rx="2" className="fill-surface-inverse" />
      <rect x="19" y="5" width="9" height="7" rx="2" className="fill-surface-inverse" />
      <rect x="31" y="5" width="9" height="7" rx="2" className="fill-surface-inverse" />
      <circle cx="12" cy="24" r="3" fill="currentColor" />
      <circle cx="34" cy="24" r="3" fill="currentColor" />
    </svg>
  )
}
