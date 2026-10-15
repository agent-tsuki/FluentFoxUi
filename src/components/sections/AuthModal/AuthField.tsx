import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label:     string
  /** Shown after the label, e.g. "(optional)". */
  labelNote?: string
  required?: boolean
  error?:    ReactNode
  hint?:     ReactNode
  /** Element placed inside the input on the right (e.g. show-password button). */
  trailing?: ReactNode
}

/**
 * AuthField — labelled input used by the auth forms.
 * Label is linked to the input, and errors/hints are announced via
 * aria-describedby. Pass `autoComplete` for password-manager support.
 */
export function AuthField({ label, labelNote, required, error, hint, trailing, className, ...inputProps }: AuthFieldProps) {
  const id      = useId()
  const errorId = `${id}-error`
  const hintId  = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="block text-2xs uppercase tracking-widest font-bold text-on-surface-variant px-1 mb-1.5">
        {label}
        {required && <span aria-hidden className="text-error normal-case tracking-normal font-bold"> *</span>}
        {labelNote && <span className="normal-case text-outline/50 font-normal tracking-normal"> {labelNote}</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-on-surface text-sm outline-none transition-all',
            'placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest',
            Boolean(error) && 'ring-2 ring-error/40',
            Boolean(trailing) && 'pr-12',
            className,
          )}
          {...inputProps}
        />
        {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && <div id={errorId} className="mt-1 px-1 text-xs text-error font-medium">{error}</div>}
      {hint && !error && <p id={hintId} className="mt-1 px-1 text-xs text-on-surface-variant/60">{hint}</p>}
    </div>
  )
}

interface PasswordToggleProps {
  visible:  boolean
  onToggle: () => void
}

/** Show/hide password button for AuthField's `trailing` slot. */
export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      className="flex size-8 items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
    >
      <span aria-hidden className="material-symbols-outlined text-lg">{visible ? 'visibility_off' : 'visibility'}</span>
    </button>
  )
}
