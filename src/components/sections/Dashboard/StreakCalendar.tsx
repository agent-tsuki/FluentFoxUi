import { useState } from 'react'
import type { StreakCalendarData } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface StreakCalendarProps {
  data: StreakCalendarData
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function cellColor(minutes: number): React.CSSProperties {
  if (minutes === 0) return {}
  const alpha = minutes <= 30 ? 0.22 : minutes <= 60 ? 0.48 : minutes <= 90 ? 0.75 : 1
  return { backgroundColor: `rgba(234, 107, 68, ${alpha})` }
}

function cellLabel(minutes: number): string {
  if (minutes === 0) return 'No activity'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ─── build week grid ──────────────────────────────────────────────────────────

interface GridCell {
  date: string
  minutes: number
  isPlaceholder: boolean
}

function buildGrid(activities: StreakCalendarData['activities']): GridCell[][] {
  const actMap = new Map(activities.map(a => [a.date, a.minutes]))

  // Today fixed to the last activity date (Apr 7 2026)
  const today = new Date(2026, 3, 7)

  // Start from the Sunday 52 weeks (364 days) ago
  const start = new Date(today)
  start.setDate(today.getDate() - 364)
  start.setDate(start.getDate() - start.getDay()) // rewind to Sunday

  const weeks: GridCell[][] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const week: GridCell[] = []
    for (let d = 0; d < 7; d++) {
      const isFuture = cursor > today
      const dateStr  = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      week.push({
        date:          dateStr,
        minutes:       isFuture ? 0 : (actMap.get(dateStr) ?? 0),
        isPlaceholder: isFuture,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

// ─── month label positions ────────────────────────────────────────────────────

function getMonthLabels(weeks: GridCell[][]): { label: string; colIndex: number }[] {
  const seen = new Set<string>()
  const labels: { label: string; colIndex: number }[] = []
  weeks.forEach((week, i) => {
    const firstReal = week.find(c => !c.isPlaceholder)
    if (!firstReal) return
    const [, m] = firstReal.date.split('-').map(Number)
    const key = `${m}`
    if (!seen.has(key)) {
      seen.add(key)
      labels.push({ label: MONTH_NAMES[m - 1], colIndex: i })
    }
  })
  return labels
}

// ─── component ────────────────────────────────────────────────────────────────

export function StreakCalendar({ data }: StreakCalendarProps) {
  const [tooltip, setTooltip] = useState<{ date: string; minutes: number } | null>(null)

  const weeks       = buildGrid(data.activities)
  const monthLabels = getMonthLabels(weeks)

  const CELL = 13   // px — cell size
  const GAP  = 3    // px — gap between cells

  const stats = [
    { icon: 'local_fire_department', label: 'Current Streak', value: `${data.currentStreak} days`, accent: true },
    { icon: 'emoji_events',          label: 'Longest Streak',  value: `${data.longestStreak} days`, accent: false },
    { icon: 'calendar_today',        label: 'Active Days',     value: `${data.totalActiveDays} / 365`, accent: false },
    { icon: 'timer',                 label: 'This Week',       value: `${data.thisWeekMinutes} min`,  accent: false },
  ]

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-label block">
          Consistency
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Streak Calendar
        </h2>
      </div>

      {/* Calendar card */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_40px_rgba(25,28,29,0.04)] overflow-x-auto">
        <div style={{ minWidth: `${weeks.length * (CELL + GAP) + 36}px` }}>

          {/* Month labels row */}
          <div className="flex mb-1" style={{ paddingLeft: 36 }}>
            {weeks.map((_, i) => {
              const ml = monthLabels.find(l => l.colIndex === i)
              return (
                <div
                  key={i}
                  style={{ width: CELL + GAP, flexShrink: 0 }}
                  className="text-[10px] font-semibold text-on-surface-variant font-label"
                >
                  {ml ? ml.label : ''}
                </div>
              )
            })}
          </div>

          {/* Day-of-week labels + grid */}
          <div className="flex" style={{ gap: GAP }}>
            {/* DOW labels */}
            <div className="flex flex-col" style={{ gap: GAP, width: 32, flexShrink: 0, paddingTop: 0 }}>
              {DOW_LABELS.map((d, i) => (
                <div
                  key={d}
                  style={{ height: CELL }}
                  className={`text-[10px] font-semibold font-label text-right pr-1 leading-none flex items-center justify-end ${
                    i % 2 === 0 ? 'text-on-surface-variant' : 'text-transparent'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    onMouseEnter={() => !cell.isPlaceholder && setTooltip({ date: cell.date, minutes: cell.minutes })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width:  CELL,
                      height: CELL,
                      borderRadius: 3,
                      flexShrink: 0,
                      ...(cell.isPlaceholder
                        ? {}
                        : cell.minutes === 0
                          ? {}
                          : cellColor(cell.minutes)),
                    }}
                    className={
                      cell.isPlaceholder
                        ? 'opacity-0'
                        : cell.minutes === 0
                          ? 'bg-surface-container-high cursor-default'
                          : 'cursor-pointer transition-opacity hover:opacity-80'
                    }
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend + tooltip row */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2" style={{ paddingLeft: 36 }}>
            {/* Tooltip */}
            <p className="text-xs text-on-surface-variant font-body h-4">
              {tooltip
                ? `${formatDate(tooltip.date)} — ${cellLabel(tooltip.minutes)}`
                : 'Hover a cell to see details'}
            </p>

            {/* Scale legend */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-on-surface-variant font-label">Less</span>
              {[0, 0.22, 0.48, 0.75, 1].map((alpha, i) => (
                <div
                  key={i}
                  style={{
                    width: 11, height: 11, borderRadius: 2,
                    backgroundColor: alpha === 0
                      ? undefined
                      : `rgba(234, 107, 68, ${alpha})`,
                  }}
                  className={alpha === 0 ? 'bg-surface-container-high' : ''}
                />
              ))}
              <span className="text-[10px] text-on-surface-variant font-label">More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={`bg-surface-container-low rounded-xl p-5 flex items-center gap-4 ${
              s.accent ? 'border-b-4 border-primary' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              s.accent ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
              <Icon name={s.icon} className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label truncate">
                {s.label}
              </p>
              <p className={`text-xl font-extrabold tracking-tight font-headline ${
                s.accent ? 'text-primary' : 'text-on-surface'
              }`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
