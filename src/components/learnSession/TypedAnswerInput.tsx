import { useEffect, useRef, useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { romajiToHiragana } from '@/lib/content/kanji/romaji'

interface TypedAnswerInputProps {
  id: string
  /** Japanese answer: show the kana the romaji turns into while typing. */
  typesKana: boolean
  /** Screen-reader label and placeholder. */
  label: string
  placeholder: string
  /** Null while unanswered. */
  correct: boolean | null
  /** First keystroke, for the answer timer. */
  onFirstInput: () => void
  onSubmit: (text: string) => void
}

/**
 * The answer field of a typed question: a text box with Check, plus a live
 * kana preview when the answer is Japanese (romaji is converted as you type,
 * IME kana passes through). Read-only once answered, bordered ✓/✗.
 */
export function TypedAnswerInput({ id, typesKana, label, placeholder, correct, onFirstInput, onSubmit }: TypedAnswerInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const answered = correct !== null
  const preview = typesKana ? romajiToHiragana(value, false) : ''

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (answered || !value.trim()) return
    onSubmit(value)
  }

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => {
            if (!value) onFirstInput()
            setValue(e.target.value)
          }}
          readOnly={answered}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={placeholder}
          className={cn(
            'min-h-14 w-full min-w-0 flex-1 rounded-xl border-2 bg-surface-container-lowest px-4 text-lg text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            !answered ? 'border-outline-variant/60' : correct ? 'border-success' : 'border-error',
          )}
        />
        {!answered && (
          <Button type="submit" disabled={!value.trim()} className="min-h-14 shrink-0 px-5 disabled:opacity-50">
            Check
          </Button>
        )}
      </div>
      <p aria-live="polite" lang="ja" className="min-h-6 px-1 font-jp text-base text-on-surface-variant">
        {typesKana && preview && preview !== value ? preview : ''}
      </p>
    </form>
  )
}
