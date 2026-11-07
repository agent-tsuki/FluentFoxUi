import { useCallback, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** One series: its name and the literal Tailwind classes that paint it. */
export interface ChartSeries<K extends string = string> {
  key: K
  label: string
  /** Fill class for bars and legend dots, e.g. `bg-chart-1`. */
  fill: string
}

/**
 * The hovered / focused data index of a chart. Pointer hover sets it, the
 * arrow keys move it while the plot has focus, and leaving clears it.
 */
export function useActiveIndex(count: number) {
  const [active, setActive] = useState<number | null>(null)
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }
      if (!(e.key in step) || count === 0) return
      e.preventDefault()
      setActive((i) => {
        const delta = step[e.key]
        if (delta === -Infinity) return 0
        if (delta === Infinity) return count - 1
        return Math.min(count - 1, Math.max(0, (i ?? (delta > 0 ? -1 : count)) + delta))
      })
    },
    [count],
  )
  const clear = useCallback(() => setActive(null), [])
  return { active, setActive, onKeyDown, clear }
}

const EDGE_SHARE = 0.18

/**
 * A tooltip pinned to the top of the plot above the active index. It hugs the
 * nearest edge near either end so it never leaves the chart.
 */
export function ChartTooltip({ index, count, children }: { index: number; count: number; children: ReactNode }) {
  const x = (index + 0.5) / count
  const align = x < EDGE_SHARE ? 'translate-x-0' : x > 1 - EDGE_SHARE ? '-translate-x-full' : '-translate-x-1/2'
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-none absolute top-0 z-10 min-w-32 rounded-lg bg-surface-inverse px-3 py-2 text-xs text-on-surface-inverse shadow-elevation-3',
        align,
      )}
      style={{ left: `${x * 100}%` }}
    >
      {children}
    </div>
  )
}

/** A tooltip row: identity dot, series name, value. */
export function TooltipRow({ fill, label, value }: { fill?: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 tabular-nums">
      <span className="flex items-center gap-1.5 text-on-surface-inverse-variant">
        {fill && <span aria-hidden className={cn('h-2 w-2 rounded-full', fill)} />}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

/** The key for two or more series; colour is never the only cue. */
export function ChartLegend({ series, className }: { series: readonly ChartSeries[]; className?: string }) {
  return (
    <ul aria-label="Legend" className={cn('flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-on-surface-variant', className)}>
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span aria-hidden className={cn('h-2.5 w-2.5 rounded-sm', s.fill)} />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

/** The chart's numbers as a table for screen readers. */
export function ChartDataTable({ caption, columns, rows }: { caption: string; columns: readonly string[]; rows: readonly (readonly string[])[] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>
            {r.map((cell, i) => (i === 0 ? <th key={i} scope="row">{cell}</th> : <td key={i}>{cell}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Recessive horizontal gridlines with their values on the left. */
export function Gridlines({ ticks, top, min = 0, format }: { ticks: readonly number[]; top: number; min?: number; format: (n: number) => string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {ticks.map((t) => (
        <div key={t} className="absolute inset-x-0 border-t border-outline-variant/40" style={{ bottom: `${((t - min) / (top - min)) * 100}%` }}>
          <span className="absolute right-full mr-2 -translate-y-1/2 text-2xs tabular-nums text-on-surface-variant">{format(t)}</span>
        </div>
      ))}
    </div>
  )
}

/** Sparse x labels under a plot. */
export function XLabels({ labels, every, highlight }: { labels: readonly string[]; every: number; highlight?: number }) {
  const last = labels.length - 1
  return (
    <div aria-hidden className="mt-1.5 flex text-2xs tabular-nums text-on-surface-variant">
      {labels.map((label, i) => (
        <span key={i} className={cn('min-w-0 flex-1 overflow-visible whitespace-nowrap text-center', i === highlight && 'font-bold text-primary')}>
          {(last - i) % every === 0 ? label : ''}
        </span>
      ))}
    </div>
  )
}
