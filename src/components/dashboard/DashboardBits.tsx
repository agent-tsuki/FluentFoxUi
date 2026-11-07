import type { ReactNode } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { cn } from '@/lib/cn'

/** The heading of one dashboard section page. */
export function DashboardPageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        <Eyebrow variant="plain">{eyebrow}</Eyebrow>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">{title}</h1>
        {description && <p className="max-w-prose text-on-surface-variant">{description}</p>}
      </div>
      {actions}
    </header>
  )
}

interface PanelProps {
  title: string
  /** Short context under the title. */
  description?: ReactNode
  actions?: ReactNode
  className?: string
  children: ReactNode
}

/** A titled card holding one chart or list. */
export function Panel({ title, description, actions, className, children }: PanelProps) {
  return (
    <section className={cn('min-w-0 space-y-4 rounded-xl bg-surface-container-low p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
          {description && <p className="text-sm text-on-surface-variant">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

type Trend = 'up' | 'down' | 'flat'

interface StatTileProps {
  label: string
  value: ReactNode
  /** Context under the value. */
  hint?: ReactNode
  icon?: string
  /** A change label with its direction; the arrow and word carry it, not colour alone. */
  change?: { label: string; trend: Trend } | null
  className?: string
}

const TREND_ICON: Record<Trend, string> = { up: 'north_east', down: 'south', flat: 'swap_horiz' }
const TREND_TONE: Record<Trend, string> = { up: 'text-success', down: 'text-warning', flat: 'text-on-surface-variant' }

/** One headline number: label, value, optional change and hint. */
export function StatTile({ label, value, hint, icon, change, className }: StatTileProps) {
  return (
    <div className={cn('min-w-0 space-y-1 rounded-xl bg-surface-container-low p-4 sm:p-5', className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
        {icon && <Icon name={icon} className="text-base" />}
        {label}
      </p>
      <p className="font-headline text-2xl font-extrabold tracking-tight text-on-surface tabular-nums sm:text-3xl">{value}</p>
      {change && (
        <p className={cn('flex items-center gap-1 text-xs font-semibold', TREND_TONE[change.trend])}>
          <Icon name={TREND_ICON[change.trend]} className="text-sm" />
          {change.label}
        </p>
      )}
      {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
    </div>
  )
}

export function trendOf(change: number | null, epsilon = 0.005): Trend {
  if (change === null || Math.abs(change) < epsilon) return 'flat'
  return change > 0 ? 'up' : 'down'
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  className?: string
}

/** A small segmented control (time range, track). */
export function Segmented<T extends string | number>({ label, value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex flex-wrap gap-1 rounded-full bg-surface-container p-1', className)}>
      {options.map((o) => {
        const checked = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-11 rounded-full px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              checked ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** A panel-sized placeholder while a chart's data loads. */
export function PanelSkeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('h-64 animate-pulse rounded-xl bg-surface-container-high', className)} />
}

interface AsyncBlockProps<T> {
  state: { data: T | undefined; isLoading: boolean; error: Error | null; refetch: () => void }
  /** What failed, for the error message ("your activity"). */
  what: string
  skeletonClassName?: string
  children: (data: T) => ReactNode
}

/** Renders a block once its data is in, with a skeleton while loading and a retry on error. */
export function AsyncBlock<T>({ state, what, skeletonClassName, children }: AsyncBlockProps<T>) {
  if (state.error) return <ErrorState message={`We couldn't load ${what}.`} onRetry={state.refetch} className="py-10" />
  if (state.data === undefined) return <PanelSkeleton className={skeletonClassName} />
  return <>{children(state.data)}</>
}
