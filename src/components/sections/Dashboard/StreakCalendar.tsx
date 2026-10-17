import { useMemo, useState } from 'react'
import type { StreakCalendarData } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { calendarWeeks, formatLongDate, formatMinutes, monthLabels, type CalendarCell } from '@/lib/learn/progressShape'

interface StreakCalendarProps {
  data: StreakCalendarData
  /** Off when the page already titles the section. */
  showHeading?: boolean
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function cellColor(minutes: number): React.CSSProperties {
  if (minutes === 0) return {}
  const alpha = minutes <= 30 ? 0.22 : minutes <= 60 ? 0.48 : minutes <= 90 ? 0.75 : 1
  return { backgroundColor: `rgb(var(--primary) / ${alpha})` }
}

const DOW_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

/** Activities as the calendar weeks expect them (goal-met days counted for the streak). */
function toCalendarDays(activities: StreakCalendarData['activities']) {
  return activities.map(a => ({ date: a.date, minutes: a.minutes, goal_met: a.goalMet ?? false }))
}

// ─── component ────────────────────────────────────────────────────────────────

export function StreakCalendar({ data, showHeading = true }: StreakCalendarProps) {
  const [tooltip, setTooltip] = useState<CalendarCell | null>(null)

  const weeks  = useMemo(() => calendarWeeks(toCalendarDays(data.activities)), [data.activities])
  const labels = useMemo(() => monthLabels(weeks), [weeks])

  const CELL = 13   // px — cell size
  const GAP  = 3    // px — gap between cells

  const stats = [
    { icon: 'local_fire_department', label: 'Current Streak', value: `${data.currentStreak} days`, accent: true },
    { icon: 'emoji_events',          label: 'Longest Streak',  value: `${data.longestStreak} days`, accent: false },
    { icon: 'calendar_today',        label: 'Active Days',     value: `${data.totalActiveDays} / ${data.activities.length}`, accent: false },
    { icon: 'timer',                 label: 'This Week',       value: `${data.thisWeekMinutes} min`,  accent: false },
  ]

  return (
    <section className="space-y-6">
      {showHeading && (
      <div className="space-y-1">
        <Eyebrow variant="plain">Consistency</Eyebrow>
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Streak Calendar
        </h2>
      </div>
      )}

      {/* Calendar card */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-elevation-1 overflow-x-auto">
        <div style={{ minWidth: `${weeks.length * (CELL + GAP) + 36}px` }}>

          {/* Month labels row */}
          <div className="flex mb-1" style={{ paddingLeft: 36 }}>
            {weeks.map((_, i) => {
              const ml = labels.find(l => l.colIndex === i)
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
                    onMouseEnter={() => !cell.isPlaceholder && setTooltip(cell)}
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
                          ? 'relative bg-surface-container-high cursor-default'
                          : 'relative cursor-pointer transition-opacity hover:opacity-80'
                    }
                  >
                    {cell.goalMet && !cell.isPlaceholder && (
                      <span aria-hidden className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-success ring-1 ring-surface-container-lowest" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend + tooltip row */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2" style={{ paddingLeft: 36 }}>
            {/* Tooltip */}
            <p className="text-xs text-on-surface-variant font-body h-4">
              {tooltip
                ? `${formatLongDate(tooltip.date)} — ${tooltip.minutes === 0 ? 'No activity' : formatMinutes(tooltip.minutes)}${tooltip.goalMet ? ' · goal met' : ''}`
                : 'Hover a day for details · dots mark days the goal was met'}
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
                      : `rgb(var(--primary) / ${alpha})`,
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
