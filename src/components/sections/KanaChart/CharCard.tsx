import { memo } from 'react'
import { motion } from 'framer-motion'
import type { KanaChar } from '@/types'
import type { KanaMastery } from '@/types/kanaProgress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import { kanaReadingLabel } from '@/lib/content/kana/kanaMarks'

interface CharCardProps {
  char: KanaChar
  /**
   * 'sm' is the chart cell (one height and glyph size for every set);
   * 'lg' is the bigger tile used on unit pages.
   */
  size?: 'lg' | 'sm'
  mastery?: KanaMastery
  /** Part of today's goal: gets a static ring. */
  isGoal?: boolean
  /** Show the romaji under the kana (default true). */
  showRomaji?: boolean
  onSelect?: (char: KanaChar) => void
}

/**
 * Per-mastery surface. Separation is a border only (no shadow, no glow).
 * New → Seen (primary border + one dot) → Learning (tint + two dots) →
 * Mastered (solid fill). MasteryLegend reuses these classes and markers so
 * each state reads by shape, not only by hue.
 */
export const MASTERY_SURFACE: Record<KanaMastery, string> = {
  new: 'bg-surface-container-lowest dark:bg-surface-container-low border-outline-variant dark:border-outline/60',
  seen: 'bg-surface-container-lowest dark:bg-surface-container-low border-primary/45',
  // Opaque base + the primary/10 tint layer, so the tint never shows the page through.
  learning: 'bg-surface-container-lowest dark:bg-surface-container-low border-primary/40',
  mastered: 'bg-primary dark:bg-primary-container border-transparent',
}

/** How many progress dots a state shows in the cell corner (and the legend). */
export const MASTERY_DOTS: Record<KanaMastery, number> = { new: 0, seen: 1, learning: 2, mastered: 0 }

const GLYPH: Record<KanaMastery, string> = {
  new: 'text-on-surface',
  seen: 'text-on-surface',
  learning: 'text-on-surface',
  mastered: 'text-on-primary',
}

const SMALL_GLYPH: Record<KanaMastery, string> = {
  new: 'text-on-surface-variant',
  seen: 'text-on-surface-variant',
  learning: 'text-on-surface-variant',
  mastered: 'text-on-primary/80',
}

const ROMAJI: Record<KanaMastery, string> = {
  new: 'text-on-surface-variant',
  seen: 'text-on-surface-variant',
  learning: 'text-on-primary-fixed-variant dark:text-inverse-primary',
  mastered: 'text-on-primary',
}

const SIZE = {
  sm: { cell: 'h-20 lg:h-24', glyph: 'text-3xl lg:text-4xl', small: 'text-xl lg:text-2xl' },
  lg: { cell: 'h-24 sm:h-28', glyph: 'text-4xl sm:text-5xl', small: 'text-2xl sm:text-3xl' },
} as const

/** The tint layer and corner dots; shared with MasteryLegend's swatches. */
export function MasteryMarks({ mastery, className }: { mastery: KanaMastery; className?: string }) {
  const dots = MASTERY_DOTS[mastery]
  return (
    <>
      {mastery === 'learning' && <span aria-hidden className="absolute inset-0 rounded-[inherit] bg-primary/10" />}
      {dots > 0 && (
        <span aria-hidden className={cn('absolute flex gap-0.5', className ?? 'right-1.5 top-1.5')}>
          {Array.from({ length: dots }, (_, i) => (
            <span key={i} className="block h-1.5 w-1.5 rounded-full bg-primary" />
          ))}
        </span>
      )}
    </>
  )
}

/** One kana in the chart. Tapping opens its detail sheet. */
export const CharCard = memo(function CharCard({
  char,
  size = 'lg',
  mastery = 'new',
  isGoal = false,
  showRomaji = true,
  onSelect,
}: CharCardProps) {
  const reducedMotion = useReducedMotion()
  const s = SIZE[size]

  if (char.isEmpty) {
    return <div className={cn('rounded-xl border border-dotted border-outline-variant dark:border-outline/50', s.cell)} aria-hidden />
  }

  const base = char.isCompound ? char.character[0] : char.character
  const small = char.isCompound ? char.character.slice(1) : ''
  const label = `${char.character}, ${kanaReadingLabel(char)}, ${mastery}${isGoal ? ", in today's 5" : ''}`

  return (
    <motion.button
      type="button"
      data-kana-id={char.id}
      aria-label={label}
      onClick={() => onSelect?.(char)}
      className={cn(
        'relative flex w-full min-w-0 cursor-pointer select-none flex-col items-center justify-center gap-1 rounded-xl border transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        mastery !== 'mastered' && 'hover:border-primary/70',
        s.cell,
        MASTERY_SURFACE[mastery],
        isGoal && 'ring-2 ring-primary/60 ring-offset-2 ring-offset-surface',
      )}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      <MasteryMarks mastery={mastery} />

      <span className="relative flex items-baseline font-jp font-bold leading-none" lang="ja">
        <span className={cn(s.glyph, GLYPH[mastery])}>{base}</span>
        {small && <span className={cn(s.small, SMALL_GLYPH[mastery])}>{small}</span>}
      </span>

      {showRomaji && (
        <span
          className={cn(
            'relative text-xs font-semibold uppercase leading-none tracking-wider tabular-nums',
            ROMAJI[mastery],
          )}
        >
          {kanaReadingLabel(char, true)}
        </span>
      )}
    </motion.button>
  )
})
