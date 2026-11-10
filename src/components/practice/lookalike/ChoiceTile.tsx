import { memo } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export type ChoiceState = 'idle' | 'correct' | 'wrong' | 'muted'

interface ChoiceTileProps {
  /** What the tile shows: a kana or a romaji reading. */
  label: string
  /** 'ja' renders the label as a big kana; otherwise a romaji reading. */
  lang?: 'ja'
  /** 1-based, shown as the keyboard shortcut on larger screens. */
  index: number
  state: ChoiceState
  /** After an answer, tiles stay focusable (no focus loss) but ignore presses. */
  locked: boolean
  onPick: () => void
}

const STATE_CLASSES: Record<ChoiceState, string> = {
  idle: 'border-line bg-surface-raised text-ink hover:border-primary/60 hover:bg-surface-hover',
  correct: 'border-success bg-success/15 text-ink',
  wrong: 'border-error bg-error-container text-on-error-container',
  muted: 'border-line bg-surface-raised text-ink opacity-50',
}

const STATE_LABEL: Partial<Record<ChoiceState, string>> = { correct: 'correct answer', wrong: 'your answer, wrong' }

/** One answer of the look-alike drill: a kana or a romaji reading. */
export const ChoiceTile = memo(function ChoiceTile({ label, lang, index, state, locked, onPick }: ChoiceTileProps) {
  return (
    <button
      type="button"
      aria-disabled={locked || undefined}
      onClick={() => !locked && onPick()}
      className={cn(
        'relative flex w-full items-center justify-center rounded-xl border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        lang === 'ja' ? 'h-24 sm:h-28' : 'h-16 sm:h-20',
        STATE_CLASSES[state],
        locked && 'cursor-default',
      )}
    >
      <span className="absolute left-3 top-2 hidden font-sans text-xs font-bold text-ink-muted sm:block" aria-hidden="true">
        {index}
      </span>
      {lang === 'ja' ? (
        <span lang="ja" className="font-ja text-5xl font-bold leading-none sm:text-6xl">{label}</span>
      ) : (
        <span className="font-display text-2xl font-extrabold tracking-wide sm:text-3xl">{label}</span>
      )}
      {state === 'correct' && <Icon name="check_circle" filled className="absolute right-2 top-2 text-2xl text-success" />}
      {state === 'wrong' && <Icon name="close" className="absolute right-2 top-2 text-2xl" />}
      {STATE_LABEL[state] && <span className="sr-only">, {STATE_LABEL[state]}</span>}
    </button>
  )
})
