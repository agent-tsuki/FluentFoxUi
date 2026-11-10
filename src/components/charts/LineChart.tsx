import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { niceMax, tickEvery } from './chartScale'
import { ChartDataTable, ChartTooltip, Gridlines, TooltipRow, XLabels, useActiveIndex } from './ChartParts'

export interface LinePoint {
  key: string
  label: string
  title: string
  /** Null leaves a gap (no data that day). */
  value: number | null
}

interface LineChartProps {
  title: string
  points: readonly LinePoint[]
  /** Name of the measure in the tooltip. */
  seriesLabel: string
  format: (value: number) => string
  /** Fixed axis top (1 for a share); a nice number above the data otherwise. */
  max?: number
  /** Axis bottom; 0 by default. A share's trend reads better zoomed to its band. */
  min?: number
  /** A labelled dashed reference line, such as a target. */
  reference?: { value: number; label: string }
  /** Text-colour class of the line, e.g. `text-chart-1`. */
  colorClass?: string
  heightClass?: string
  maxXLabels?: number
  className?: string
}

const VIEW_HEIGHT = 100

/** Path segments that break at nulls, in a 0..n × 0..100 viewBox; point i sits at its column centre. */
function linePaths(values: readonly (number | null)[], top: number, min: number): string[] {
  const paths: string[] = []
  let current = ''
  values.forEach((v, i) => {
    if (v === null) {
      if (current) paths.push(current)
      current = ''
      return
    }
    const y = VIEW_HEIGHT - ((v - min) / (top - min)) * VIEW_HEIGHT
    current += `${current ? 'L' : 'M'}${i + 0.5},${y.toFixed(2)}`
  })
  if (current) paths.push(current)
  return paths
}

/**
 * LineChart — one measure over time: a 2px line (gaps where there is no
 * data), a crosshair + tooltip on hover or arrow keys, an optional target line
 * and a screen-reader table. One series, so no legend: the title names it.
 */
export function LineChart({
  title,
  points,
  seriesLabel,
  format,
  max,
  min = 0,
  reference,
  colorClass = 'text-chart-1',
  heightClass = 'h-44',
  maxXLabels = 8,
  className,
}: LineChartProps) {
  const values = useMemo(() => points.map((p) => p.value), [points])
  const top = max ?? niceMax(Math.max(0, ...values.map((v) => v ?? 0), reference?.value ?? 0))
  const paths = useMemo(() => linePaths(values, top, min), [values, top, min])
  const yPct = (v: number) => ((v - min) / (top - min)) * 100
  const { active, setActive, onKeyDown, clear } = useActiveIndex(points.length)
  const activePoint = active === null ? undefined : points[active]
  const xPct = (i: number) => ((i + 0.5) / points.length) * 100
  // Lone points between gaps draw no line, so mark them with a dot.
  const lonePoints = values.flatMap((v, i) =>
    v !== null && (i === 0 || values[i - 1] === null) && (i === values.length - 1 || values[i + 1] === null) ? [i] : [],
  )

  return (
    <figure className={cn('space-y-3', className)}>
      <div className="pl-10">
        <div className={cn('relative', heightClass)}>
          <Gridlines ticks={[min, (min + top) / 2, top]} top={top} min={min} format={format} />
          {reference && (
            <div aria-hidden className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-ink/40" style={{ bottom: `${yPct(reference.value)}%` }}>
              <span className="absolute right-0 -translate-y-full pb-0.5 text-2xs font-semibold text-ink-muted">{reference.label}</span>
            </div>
          )}
          <svg
            aria-hidden
            className={cn('absolute inset-0 h-full w-full overflow-visible', colorClass)}
            viewBox={`0 0 ${Math.max(1, points.length)} ${VIEW_HEIGHT}`}
            preserveAspectRatio="none"
          >
            {paths.map((d) => (
              <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          {lonePoints.map((i) => (
            <span
              key={i}
              aria-hidden
              className={cn('absolute h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-current', colorClass)}
              style={{ left: `${xPct(i)}%`, bottom: `${yPct(values[i] ?? min)}%` }}
            />
          ))}
          {activePoint && active !== null && (
            <>
              <span aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-ink/30" style={{ left: `${xPct(active)}%` }} />
              {activePoint.value !== null && (
                <span
                  aria-hidden
                  className={cn('pointer-events-none absolute h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-current ring-2 ring-surface', colorClass)}
                  style={{ left: `${xPct(active)}%`, bottom: `${yPct(activePoint.value)}%` }}
                />
              )}
              <ChartTooltip index={active} count={points.length}>
                <p className="mb-1 font-semibold">{activePoint.title}</p>
                <TooltipRow label={seriesLabel} value={activePoint.value === null ? 'No answers' : format(activePoint.value)} />
              </ChartTooltip>
            </>
          )}
          {/* Hit targets: one full-height column per point, wider than the line. */}
          <div
            role="group"
            tabIndex={0}
            aria-label={`${title}. Use the arrow keys to read each value.`}
            onKeyDown={onKeyDown}
            onPointerLeave={clear}
            onBlur={clear}
            className="absolute inset-0 flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {points.map((p, i) => (
              <span key={p.key} className="h-full flex-1" onPointerEnter={() => setActive(i)} />
            ))}
          </div>
        </div>
        <XLabels labels={points.map((p) => p.label)} every={tickEvery(points.length, maxXLabels)} />
      </div>
      <ChartDataTable caption={title} columns={['Date', seriesLabel]} rows={points.map((p) => [p.title, p.value === null ? '–' : format(p.value)])} />
    </figure>
  )
}
