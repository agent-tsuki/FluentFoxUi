import { memo } from 'react'
import type { KanaChar } from '@/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export type TileState = 'idle' | 'correct' | 'wrong' | 'muted'

interface AnswerTileProps {
  kana: KanaChar
  /** 1-based, shown as the keyboard shortcut. */
  index: number
  state: TileState
  /** After an answer, tiles stay focusable (no focus loss) but ignore presses. */
  locked: boolean
  onPick: (kana: KanaChar) => void
}

const STATE_CLASSES: Record<TileState, string> = {
  idle: 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:bg-surface-container-low',
  correct: 'border-success bg-success/15 text-on-surface',
  wrong: 'border-error bg-error-container text-on-error-container',
  muted: 'border-outline-variant/40 bg-surface-container-lowest text-on-surface opacity-50',
}

const STATE_LABEL: Partial<Record<TileState, string>> = { correct: 'correct answer', wrong: 'your answer, wrong' }

/** One large kana answer tile for Listen & tap. */
export const AnswerTile = memo(function AnswerTile({ kana, index, state, locked, onPick }: AnswerTileProps) {
  return (
    <button
      type="button"
      aria-disabled={locked || undefined}
      onClick={() => !locked && onPick(kana)}
      className={cn(
        'relative flex h-28 w-full items-center justify-center rounded-2xl border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:h-32',
        STATE_CLASSES[state],
        locked && 'cursor-default',
      )}
    >
      <span className="absolute left-3 top-2 hidden font-label text-xs font-bold text-on-surface-variant sm:block" aria-hidden="true">
        {index}
      </span>
      <span lang="ja" className="font-jp text-5xl font-bold leading-none sm:text-6xl">{kana.character}</span>
      {state === 'correct' && <Icon name="check_circle" filled className="absolute right-2 top-2 text-2xl text-success" />}
      {state === 'wrong' && <Icon name="close" className="absolute right-2 top-2 text-2xl" />}
      {STATE_LABEL[state] && <span className="sr-only">, {STATE_LABEL[state]}</span>}
    </button>
  )
})
