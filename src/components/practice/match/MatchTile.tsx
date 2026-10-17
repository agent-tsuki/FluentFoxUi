import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export type MatchTileState = 'idle' | 'selected' | 'matched' | 'wrong'

type Side = 'hiragana' | 'katakana'

interface MatchTileProps {
  id: string
  side: Side
  character: string
  state: MatchTileState
  reducedMotion: boolean
  onPress: (side: Side, id: string) => void
}

const STATE_CLASSES: Record<MatchTileState, string> = {
  idle: 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:bg-surface-container-low dark:border-outline/60 dark:bg-surface-container-low',
  selected: 'border-primary bg-primary/10 text-on-surface ring-2 ring-primary/30',
  matched: 'border-success/50 bg-success/10 text-on-surface-variant',
  wrong: 'border-error bg-error-container text-on-error-container',
}

/** A short sideways shake on a wrong pair (skipped under reduced motion). */
const SHAKE = { x: [0, -6, 6, -4, 4, 0] }
const REST = { x: 0 }

/** One kana tile of the hiragana ↔ katakana match grid. */
export const MatchTile = memo(function MatchTile({ id, side, character, state, reducedMotion, onPress }: MatchTileProps) {
  const matched = state === 'matched'
  return (
    <motion.button
      type="button"
      aria-pressed={state === 'selected'}
      aria-disabled={matched || undefined}
      onClick={() => !matched && onPress(side, id)}
      animate={state === 'wrong' && !reducedMotion ? SHAKE : REST}
      transition={{ duration: 0.35 }}
      className={cn(
        'relative flex h-14 w-full items-center justify-center rounded-2xl border-2 transition-colors duration-200 sm:h-16',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        STATE_CLASSES[state],
        matched && 'cursor-default',
      )}
    >
      <span lang="ja" className={cn('font-jp text-3xl font-bold leading-none sm:text-4xl', matched && 'opacity-60')}>
        {character}
      </span>
      {matched && <Icon name="check_circle" filled className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-success" />}
      {matched && <span className="sr-only">, matched</span>}
      {state === 'wrong' && <span className="sr-only">, not a pair</span>}
    </motion.button>
  )
})
