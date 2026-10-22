import { cn } from '@/lib/cn'

/**
 * Switch — accessible on/off toggle (role="switch") with a 44px tap target.
 * Use for instant settings such as Published / Featured; pair with a visible
 * label or pass `label` (read by screen readers only when `hideLabel`).
 */
interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hideLabel?: boolean
  disabled?: boolean
  busy?: boolean
  className?: string
}

export function Switch({ checked, onChange, label, hideLabel = false, disabled, busy, className }: SwitchProps) {
  return (
    <label className={cn('inline-flex min-h-11 cursor-pointer items-center gap-3', disabled && 'cursor-not-allowed opacity-60', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        aria-busy={busy || undefined}
        disabled={disabled || busy}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          checked ? 'bg-primary' : 'bg-surface-container-highest',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface-container-lowest shadow-elevation-1 transition-transform motion-reduce:transition-none',
            checked ? 'translate-x-5' : 'translate-x-0',
            busy && 'animate-pulse',
          )}
        />
      </button>
      {!hideLabel && <span className="text-sm font-medium text-on-surface">{label}</span>}
    </label>
  )
}
