import { memo } from 'react'
import type { KanaChar } from '@/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export type OptionState = 'idle' | 'correct' | 'wrong' | 'muted'

const STATE_CLASSES: Record<OptionState, string> = {
  idle: 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:bg-surface-container-low',
  correct: 'border-success bg-success/15 text-on-surface',
  wrong: 'border-error bg-error-container text-on-error-container',
  muted: 'border-outline-variant/40 bg-surface-container-lowest text-on-surface opacity-50',
}

const STATE_LABEL: Partial<Record<OptionState, string>> = { correct: ', correct answer', wrong: ', your answer, wrong' }

interface OptionButtonProps {
  kana: KanaChar
  /** Show the romaji (reading questions) instead of the kana. */
  asRomaji: boolean
  index: number
  state: OptionState
  locked: boolean
  onPick: (kana: KanaChar) => void
}

const OptionButton = memo(function OptionButton({ kana, asRomaji, index, state, locked, onPick }: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-disabled={locked || undefined}
      onClick={() => !locked && onPick(kana)}
      className={cn(
        'relative flex h-20 w-full items-center justify-center rounded-2xl border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none sm:h-24',
        STATE_CLASSES[state],
        locked && 'cursor-default',
      )}
    >
      <span className="absolute left-3 top-2 hidden font-label text-xs font-bold text-on-surface-variant sm:block" aria-hidden="true">
        {index}
      </span>
      {asRomaji ? (
        <span className={cn('font-headline font-bold', kana.romaji.length <= 6 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl')}>
          {kana.romaji}
        </span>
      ) : (
        // Loanword spellings (katakana ー/ッ questions) are longer than one kana: smaller type.
        <span
          lang="ja"
          className={cn(
            'font-jp font-bold leading-none',
            Array.from(kana.character).length <= 2 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl',
          )}
        >
          {kana.character}
        </span>
      )}
      {state === 'correct' && <Icon name="check_circle" filled className="absolute right-2 top-2 text-2xl text-success" />}
      {state === 'wrong' && <Icon name="close" className="absolute right-2 top-2 text-2xl" />}
      {STATE_LABEL[state] && <span className="sr-only">{STATE_LABEL[state]}</span>}
    </button>
  )
})

interface OptionGridProps {
  options: KanaChar[]
  asRomaji: boolean
  targetId: string
  /** The learner's pick, or null while unanswered. */
  chosenId: string | null
  onPick: (kana: KanaChar) => void
}

/** The four answer buttons in a 2×2 grid. After an answer they stay focusable but ignore presses. */
export function OptionGrid({ options, asRomaji, targetId, chosenId, onPick }: OptionGridProps) {
  const stateOf = (k: KanaChar): OptionState => {
    if (chosenId === null) return 'idle'
    if (k.id === targetId) return 'correct'
    return k.id === chosenId ? 'wrong' : 'muted'
  }
  return (
    <div role="group" aria-label="Answers" className="grid grid-cols-2 gap-3">
      {options.map((k, i) => (
        <OptionButton key={k.id} kana={k} asRomaji={asRomaji} index={i + 1} state={stateOf(k)} locked={chosenId !== null} onPick={onPick} />
      ))}
    </div>
  )
}
