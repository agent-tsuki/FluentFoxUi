import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { formatAxisNumber, gridTicks, niceMax, tickEvery } from './chartScale'
import {
  ChartDataTable,
  ChartLegend,
  ChartTooltip,
  Gridlines,
  TooltipRow,
  XLabels,
  useActiveIndex,
  type ChartSeries,
} from './ChartParts'

export interface ColumnDatum<K extends string> {
  /** Unique key (a date). */
  key: string
  /** Short x-axis label. */
  label: string
  /** Tooltip / table heading. */
  title: string
  values: Record<K, number>
}

interface ColumnChartProps<K extends string> {
  /** What the chart shows, for screen readers and the table caption. */
  title: string
  data: readonly ColumnDatum<K>[]
  /** Bottom to top. */
  series: readonly ChartSeries<K>[]
  /** Unit after numbers in the tooltip, e.g. "reviews". */
  unit: string
  /** Index drawn in the brand colour, e.g. today. */
  highlight?: number
  /** Plot height class. */
  heightClass?: string
  maxXLabels?: number
  className?: string
}

const SEGMENT_GAP_PX = 2

/**
 * ColumnChart — stacked columns over time with recessive gridlines, a hover /
 * keyboard tooltip and a screen-reader table. A single series needs no legend.
 */
export function ColumnChart<K extends string>({
  title,
  data,
  series,
  unit,
  highlight,
  heightClass = 'h-44',
  maxXLabels = 8,
  className,
}: ColumnChartProps<K>) {
  const totals = useMemo(() => data.map((d) => series.reduce((n, s) => n + (d.values[s.key] ?? 0), 0)), [data, series])
  const top = niceMax(Math.max(0, ...totals))
  const { active, setActive, onKeyDown, clear } = useActiveIndex(data.length)
  const dense = data.length > 45
  const activeDatum = active === null ? undefined : data[active]

  return (
    <figure className={cn('space-y-3', className)}>
      {series.length > 1 && <ChartLegend series={series} />}
      <div className="pl-8">
        <div className={cn('relative', heightClass)}>
          <Gridlines ticks={gridTicks(top)} top={top} format={formatAxisNumber} />
          <div
            role="group"
            tabIndex={0}
            aria-label={`${title}. Use the arrow keys to read each value.`}
            onKeyDown={onKeyDown}
            onPointerLeave={clear}
            onBlur={clear}
            className={cn('absolute inset-0 flex items-stretch rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', dense ? 'gap-px' : 'gap-1')}
          >
            {data.map((d, i) => {
              let bottom = 0
              return (
                <div
                  key={d.key}
                  onPointerEnter={() => setActive(i)}
                  className={cn('relative min-w-0 flex-1 rounded-t-[4px]', active === i && 'bg-ink/5')}
                >
                  {series.map((s, si) => {
                    const value = d.values[s.key] ?? 0
                    if (value <= 0) return null
                    const height = (value / top) * 100
                    const gap = bottom > 0 ? SEGMENT_GAP_PX : 0
                    const isTop = series.slice(si + 1).every((n) => (d.values[n.key] ?? 0) <= 0)
                    const style = { bottom: `calc(${bottom}% + ${gap}px)`, height: `max(calc(${height}% - ${gap}px), 2px)` }
                    bottom += height
                    return (
                      <span
                        key={s.key}
                        aria-hidden
                        className={cn('absolute inset-x-0', isTop && 'rounded-t-[4px]', i === highlight && series.length === 1 ? 'bg-primary' : s.fill)}
                        style={style}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
          {activeDatum && active !== null && (
            <ChartTooltip index={active} count={data.length}>
              <p className="mb-1 font-semibold">{activeDatum.title}</p>
              {series.length > 1 &&
                series.map((s) => <TooltipRow key={s.key} fill={s.fill} label={s.label} value={formatAxisNumber(activeDatum.values[s.key] ?? 0)} />)}
              <TooltipRow label={series.length > 1 ? 'Total' : series[0]?.label ?? unit} value={`${totals[active].toLocaleString()} ${unit}`} />
            </ChartTooltip>
          )}
        </div>
        <XLabels labels={data.map((d) => d.label)} every={tickEvery(data.length, maxXLabels)} highlight={highlight} />
      </div>
      <ChartDataTable
        caption={title}
        columns={['Date', ...series.map((s) => s.label), ...(series.length > 1 ? ['Total'] : [])]}
        rows={data.map((d, i) => [
          d.title,
          ...series.map((s) => String(d.values[s.key] ?? 0)),
          ...(series.length > 1 ? [String(totals[i])] : []),
        ])}
      />
    </figure>
  )
}
