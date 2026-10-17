import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useProgressCalendar } from '@/hooks/useProgress'
import { activityTier, formatMinutes, monthRange, parseLocalDate, toLocalDate, type ActivityTier } from '@/lib/learn/progressShape'
import { cn } from '@/lib/cn'
import type { CalendarDay } from '@/types/progress'

// `primary` is a CSS-var-backed token that dims correctly in dark mode — use it via
// opacity utilities instead of static rgba literals so the tiers stay theme-aware.
const TIER_BG: Record<ActivityTier, string> = {
  0: 'bg-surface-container-high',
  1: 'bg-primary/15',
  2: 'bg-primary/35',
  3: 'bg-primary/65',
  4: 'bg-primary',
}
const TIER_NUM_COLOR: Record<ActivityTier, string> = {
  0: 'text-on-surface-variant',
  1: 'text-primary',
  2: 'text-primary',
  3: 'text-on-primary',
  4: 'text-on-primary',
}
const TIER_LABEL: Record<ActivityTier, string> = { 0: 'Rest day', 1: 'Light', 2: 'Steady', 3: 'Strong', 4: 'Hard day!' }
const LEGEND_TIERS: readonly ActivityTier[] = [1, 2, 3, 4]
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** The streak pill's month preview: study time per day this month (GET /progress/calendar), goal-met days dotted. */
export function StreakMonthPopup({ streak }: { streak: number }) {
  const today = toLocalDate(new Date())
  const range = useMemo(() => ({ from: monthRange(today).from, to: today }), [today])
  const { data, isLoading, error } = useProgressCalendar(range)
  const [hovered, setHovered] = useState<CalendarDay | null>(null)

  const first = parseLocalDate(range.from)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const byDay = useMemo(() => new Map(data?.days.map((d) => [parseLocalDate(d.date).getDate(), d])), [data])
  const todayNum = parseLocalDate(today).getDate()
  const cells: (number | null)[] = [...Array<null>(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const activeDays = data?.days.filter((d) => d.answers > 0).length ?? 0
  const monthTitle = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="absolute top-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 w-72 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-elevation-2 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-surface-container-lowest border-l border-t border-outline-variant/40 rounded-tl-sm" />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-extrabold text-on-surface font-headline tracking-tight">{monthTitle}</p>
          <p className="text-2xs text-on-surface-variant font-body mt-0.5">
            {error ? "Couldn't load this month" : isLoading ? 'Loading…' : `${activeDays} day${activeDays !== 1 ? 's' : ''} studied this month`}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1">
          <Icon name="local_fire_department" className="text-sm text-primary animate-streak-flame" />
          <span className="text-xs font-bold text-primary font-label">{streak}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1.5 px-0.5">
        {DOW.map((d) => (
          <span key={d} className="text-center text-2xs font-bold text-on-surface-variant/60 font-label tracking-wide">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} className="aspect-square" />
          const entry = byDay.get(day)
          const tier = activityTier(entry?.minutes ?? 0)
          const isFuture = day > todayNum
          return (
            <div key={day} onMouseEnter={() => entry && setHovered(entry)} onMouseLeave={() => setHovered(null)} className="aspect-square">
              <div
                className={cn(
                  'relative w-full h-full rounded-lg flex items-center justify-center cursor-default select-none',
                  isFuture ? 'bg-surface-container-high opacity-30' : TIER_BG[tier],
                  day === todayNum && 'ring-2 ring-primary ring-offset-1 ring-offset-surface-container-lowest',
                )}
              >
                <span className={cn('text-2xs font-bold font-label leading-none', isFuture ? 'text-on-surface-variant' : TIER_NUM_COLOR[tier])}>{day}</span>
                {entry?.goal_met && <span aria-hidden className="absolute bottom-0.5 h-1 w-1 rounded-full bg-success" />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-outline-variant/40 min-h-7 flex items-center justify-between gap-2">
        {hovered ? (
          <p className="text-xs text-on-surface-variant font-body">
            <span className="font-bold text-on-surface font-label">{parseLocalDate(hovered.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {' — '}
            {hovered.answers > 0 ? `${formatMinutes(hovered.minutes)} · ${hovered.answers} answers${hovered.goal_met ? ' · goal met' : ''}` : TIER_LABEL[0]}
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {LEGEND_TIERS.map((t) => (
              <div key={t} className="flex items-center gap-1">
                <div className={cn('w-2.5 h-2.5 rounded-sm', TIER_BG[t])} />
                <span className="text-2xs text-on-surface-variant font-label">{TIER_LABEL[t]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-2xs text-on-surface-variant font-label">Goal met</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
