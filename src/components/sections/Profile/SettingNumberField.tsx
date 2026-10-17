import { useId } from 'react'
import { cn } from '@/lib/cn'

/** A labelled number input for one learning setting, with its range and error under it. */
interface SettingNumberFieldProps {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step?: number
  /** Shown after the input, e.g. "answers". */
  unit?: string
  error?: string
  onChange: (value: number) => void
}

export function SettingNumberField({ label, hint, value, min, max, step = 1, unit, error, onChange }: SettingNumberFieldProps) {
  const id = useId()
  const describedBy = `${id}-hint`
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-on-surface font-body">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value === '' ? Number.NaN : Number(e.target.value))}
          className={cn(
            'w-28 min-h-11 rounded-xl border bg-surface-container-lowest px-3 py-2 text-base tabular-nums text-on-surface',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            error ? 'border-error' : 'border-outline-variant',
          )}
        />
        {unit && <span className="text-sm text-on-surface-variant font-body">{unit}</span>}
      </div>
      <p id={describedBy} className={cn('text-xs font-body', error ? 'text-error' : 'text-on-surface-variant')}>
        {error ?? `${hint} (${min}–${max})`}
      </p>
    </div>
  )
}
