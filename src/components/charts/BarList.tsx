import { cn } from '@/lib/cn'

export interface BarListRow {
  key: string
  label: string
  /** 0–1 share of the bar; null draws an empty track. */
  share: number | null
  /** The printed value. */
  display: string
  /** Fill class, e.g. `bg-chart-1`. */
  fill: string
  /** Optional line under the label. */
  note?: string
}

/**
 * Horizontal bars, one per row, each labelled with its value, for comparing
 * a few categories (tracks, levels). Labels carry identity, not colour.
 */
export function BarList({ rows, label, className }: { rows: readonly BarListRow[]; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn('space-y-3.5', className)}>
      {rows.map((r) => (
        <li key={r.key} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">{r.label}</span>
            <span className="font-semibold tabular-nums text-on-surface">{r.display}</span>
          </div>
          <div aria-hidden className="h-2.5 overflow-hidden rounded-full bg-surface-container-high">
            {r.share !== null && r.share > 0 && <div className={cn('h-full rounded-full', r.fill)} style={{ width: `${Math.min(1, r.share) * 100}%` }} />}
          </div>
          {r.note && <p className="text-xs text-on-surface-variant">{r.note}</p>}
        </li>
      ))}
    </ul>
  )
}
