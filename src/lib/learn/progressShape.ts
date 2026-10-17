/**
 * Shapes progress API data (forecast, calendar) for the charts: day labels,
 * bar heights, week grids and month grids. Dates are local study dates
 * (YYYY-MM-DD) as the API sends them. Pure.
 */
import type { DayActivity, StreakCalendarData } from '@/types'
import type { CalendarDay, ForecastDay, ProgressCalendar } from '@/types/progress'
import type { LearningTrack } from '@/types/learn'

const PERCENT = 100
const DAYS_PER_WEEK = 7
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// ─── Dates ───────────────────────────────────────────────────────────────────

/** YYYY-MM-DD of a local Date. */
export function toLocalDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** A local Date at midnight for YYYY-MM-DD. */
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(date: string, days: number): string {
  const d = parseLocalDate(date)
  d.setDate(d.getDate() + days)
  return toLocalDate(d)
}

// ─── Forecast ────────────────────────────────────────────────────────────────

export interface ForecastBar {
  date: string
  /** "Today", "Tomorrow", then the weekday ("Mon"). */
  label: string
  /** Day of the month, for a second label line. */
  dayOfMonth: number
  count: number
  /** Bar height, 0–100 of the busiest day. */
  pct: number
}

function dayLabel(index: number, date: string): string {
  if (index === 0) return 'Today'
  if (index === 1) return 'Tomorrow'
  return WEEKDAY_SHORT[parseLocalDate(date).getDay()]
}

/** One bar per forecast day, for one track or all of them (the first day includes overdue reviews). */
export function forecastBars(days: readonly ForecastDay[], track?: LearningTrack): ForecastBar[] {
  const counts = days.map((d) => (track ? d.by_track[track] ?? 0 : d.total))
  const max = Math.max(0, ...counts)
  return days.map((d, i) => ({
    date: d.date,
    label: dayLabel(i, d.date),
    dayOfMonth: parseLocalDate(d.date).getDate(),
    count: counts[i],
    pct: max === 0 ? 0 : (counts[i] / max) * PERCENT,
  }))
}

export function forecastTotal(bars: readonly ForecastBar[]): number {
  return bars.reduce((n, b) => n + b.count, 0)
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarCell {
  date: string
  minutes: number
  answers: number
  goalMet: boolean
  /** Before the range or after the last day: drawn empty. */
  isPlaceholder: boolean
}

/** 0 none · 1–4 rising study time, for the cell shade. */
export type ActivityTier = 0 | 1 | 2 | 3 | 4

// Minutes at which a day moves up a shade.
const TIER_MINUTES: readonly number[] = [1, 15, 30, 60]

export function activityTier(minutes: number): ActivityTier {
  let tier = 0
  for (const min of TIER_MINUTES) if (minutes >= min) tier += 1
  return tier as ActivityTier
}

type DayLike = Pick<CalendarDay, 'date' | 'minutes' | 'goal_met'> & { answers?: number }

/**
 * Week columns (Sunday first) covering `days`, oldest week first. Days
 * before the first date and after the last are placeholders, so every
 * column has seven cells.
 */
export function calendarWeeks(days: readonly DayLike[]): CalendarCell[][] {
  if (days.length === 0) return []
  const byDate = new Map(days.map((d) => [d.date, d]))
  const first = days[0].date
  const last = days[days.length - 1].date
  let cursor = addDays(first, -parseLocalDate(first).getDay())
  const weeks: CalendarCell[][] = []
  while (cursor <= last) {
    const week: CalendarCell[] = []
    for (let i = 0; i < DAYS_PER_WEEK; i++) {
      const day = byDate.get(cursor)
      week.push({
        date: cursor,
        minutes: day?.minutes ?? 0,
        answers: day?.answers ?? 0,
        goalMet: day?.goal_met ?? false,
        isPlaceholder: cursor < first || cursor > last,
      })
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  }
  return weeks
}

/** Month label ("Jan") over the first week column that starts in that month. */
export function monthLabels(weeks: readonly CalendarCell[][]): { label: string; colIndex: number }[] {
  const seen = new Set<string>()
  const labels: { label: string; colIndex: number }[] = []
  weeks.forEach((week, colIndex) => {
    const firstReal = week.find((c) => !c.isPlaceholder)
    if (!firstReal) return
    const month = firstReal.date.slice(0, 7)
    if (seen.has(month)) return
    seen.add(month)
    labels.push({ label: parseLocalDate(firstReal.date).toLocaleDateString('en-US', { month: 'short' }), colIndex })
  })
  return labels
}

/**
 * The dashboard's streak calendar from GET /progress/calendar: one activity
 * per day with its goal-met flag, the streaks and the last seven days' minutes.
 */
export function streakCalendarFrom(calendar: ProgressCalendar): StreakCalendarData {
  const activities: DayActivity[] = calendar.days.map((d) => ({ date: d.date, minutes: d.minutes, goalMet: d.goal_met }))
  const thisWeekMinutes = calendar.days.slice(-DAYS_PER_WEEK).reduce((n, d) => n + d.minutes, 0)
  return {
    activities,
    currentStreak: calendar.current_streak,
    longestStreak: calendar.longest_streak,
    totalActiveDays: calendar.active_days,
    thisWeekMinutes,
  }
}

/** First and last date of the month that `today` is in, for a month view. */
export function monthRange(today: string): { from: string; to: string } {
  const d = parseLocalDate(today)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { from: `${today.slice(0, 7)}-01`, to: toLocalDate(last) }
}

// ─── Formatting ──────────────────────────────────────────────────────────────

/** "1h 5m", "45 min", "0 min". */
export function formatMinutes(minutes: number): string {
  const MINUTES_PER_HOUR = 60
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`
  const h = Math.floor(minutes / MINUTES_PER_HOUR)
  const m = minutes % MINUTES_PER_HOUR
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** A 0–1 share as a whole percent, or a dash when unknown. */
export function formatShare(share: number | null | undefined): string {
  return share === null || share === undefined ? '–' : `${Math.round(share * PERCENT)}%`
}

/** "Apr 3, 2026" for YYYY-MM-DD. */
export function formatLongDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
