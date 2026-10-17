import { cn } from '@/lib/cn'

/**
 * ProgressBar — a thin, accessible determinate bar (`role="progressbar"`).
 * Use it for any "x of y" progress line; pair it with visible text so the
 * numbers aren't carried by the bar alone. `label` names the bar for screen
 * readers; `valueText` (e.g. "2 of 13 units") overrides the default
 * "x of y" announcement.
 */
interface ProgressBarProps {
  value: number
  max: number
  /** Accessible name, e.g. "Units finished". */
  label: string
  /** Spoken value; defaults to "{value} of {max}". */
  valueText?: string
  size?: 'sm' | 'md'
  /** Fill colour: the accent, or the success status token. */
  tone?: 'primary' | 'success'
  className?: string
}

const SIZES: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2',
}

const TONES: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
}

export function ProgressBar({
  value,
  max,
  label,
  valueText,
  size = 'sm',
  tone = 'primary',
  className,
}: ProgressBarProps) {
  const safeMax = Math.max(max, 0)
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const pct = safeMax === 0 ? 0 : (clamped / safeMax) * 100

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={valueText ?? `${clamped} of ${safeMax}`}
      className={cn('w-full overflow-hidden rounded-full bg-outline-variant/40', SIZES[size], className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none', TONES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
