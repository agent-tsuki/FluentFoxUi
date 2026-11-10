import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** `selected` is a pick not yet checked (a worksheet), which can still change. */
export type AnswerOptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'muted'

interface AnswerOptionProps {
  /** Position in the list: shown as A, B, C…; number keys are handled by the list. */
  index: number
  label: string
  /** The answer is Japanese (sets lang and the Japanese face). */
  ja?: boolean
  state?: AnswerOptionState
  onSelect: () => void
}

const STATES: Record<AnswerOptionState, string> = {
  idle: 'border border-line-strong bg-surface-raised text-ink hover:bg-surface-hover',
  selected: 'border-2 border-primary bg-primary-soft text-primary-ink',
  correct: 'border-2 border-success bg-success-soft text-success-ink',
  wrong: 'border-2 border-danger bg-danger-soft text-danger-ink',
  muted: 'border border-line bg-surface-raised text-ink-muted',
}

/**
 * AnswerOption: one full-width choice in an exercise or quiz. After checking,
 * the state is always stated with an icon and a word, never by colour alone.
 */
export function AnswerOption({ index, label, ja = false, state = 'idle', onSelect }: AnswerOptionProps) {
  const checked = state !== 'idle' && state !== 'selected'
  return (
    <button
      type="button"
      aria-disabled={checked || undefined}
      aria-pressed={state === 'selected' || undefined}
      onClick={() => !checked && onSelect()}
      className={cn('flex min-h-14 w-full items-center gap-3 rounded-md px-4 py-2 text-left transition-colors duration-fast', STATES[state], checked && 'cursor-default')}
    >
      <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-sm bg-surface-sunken text-xs font-bold text-ink-muted">
        {String.fromCharCode(65 + index)}
      </span>
      <span lang={ja ? 'ja' : undefined} className={ja ? 'font-ja text-xl font-medium' : 'text-body font-medium'}>
        {label}
      </span>
      {state === 'correct' && (
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-caption font-bold">
          <Icon name="check" className="text-lg" /> Correct
        </span>
      )}
      {state === 'wrong' && (
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-caption font-bold">
          <Icon name="close" className="text-lg" /> Not quite
        </span>
      )}
    </button>
  )
}
