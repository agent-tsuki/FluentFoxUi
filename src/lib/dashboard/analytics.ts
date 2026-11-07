/**
 * Derived study analytics for the dashboard, computed from the progress API's
 * calendar (one row per local day) and review forecast. Pure, so every figure
 * on the dashboard is testable and the charts only draw.
 */
import type { LearningTrack } from '@/types/learn'
import type { CalendarDay, ForecastDay } from '@/types/progress'
import { LEARNING_TRACKS } from '@/lib/learn/paths'
import { parseLocalDate } from '@/lib/learn/progressShape'

const DAYS_PER_WEEK = 7

/** The time windows the activity charts offer. */
export const RANGE_OPTIONS = [
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
] as const

export type RangeDays = (typeof RANGE_OPTIONS)[number]['days']

export function isRangeDays(value: number): value is RangeDays {
  return RANGE_OPTIONS.some((o) => o.days === value)
}

/** The last `n` days of an oldest-first calendar. */
export function lastDays<T>(days: readonly T[], n: number): T[] {
  return days.slice(Math.max(0, days.length - n))
}

/** Accuracy over several days, weighted by answers; null without answers. */
export function weightedAccuracy(days: readonly CalendarDay[]): number | null {
  let answers = 0
  let correct = 0
  for (const d of days) {
    if (d.accuracy === null || d.answers === 0) continue
    answers += d.answers
    correct += d.accuracy * d.answers
  }
  return answers > 0 ? correct / answers : null
}

export interface ActivitySummary {
  /** Days in the window. */
  days: number
  activeDays: number
  answers: number
  minutes: number
  /** Share of days with any answers, 0–1. */
  consistency: number
  /** Share of days with the daily goal met, 0–1. */
  goalRate: number
  /** Null without an active day. */
  minutesPerActiveDay: number | null
  answersPerMinute: number | null
  accuracy: number | null
  /** Most answers in one day; null without an active day. */
  bestDay: { date: string; answers: number } | null
  /** Accuracy of the window's second half minus its first half; null when either half has no answers. */
  accuracyChange: number | null
}

export function activitySummary(days: readonly CalendarDay[]): ActivitySummary {
  const active = days.filter((d) => d.answers > 0)
  const answers = active.reduce((n, d) => n + d.answers, 0)
  const minutes = days.reduce((n, d) => n + d.minutes, 0)
  const goalDays = days.filter((d) => d.goal_met).length
  const best = active.reduce<CalendarDay | null>((top, d) => (top === null || d.answers > top.answers ? d : top), null)
  const half = Math.floor(days.length / 2)
  const before = weightedAccuracy(days.slice(0, half))
  const after = weightedAccuracy(days.slice(half))
  return {
    days: days.length,
    activeDays: active.length,
    answers,
    minutes,
    consistency: days.length > 0 ? active.length / days.length : 0,
    goalRate: days.length > 0 ? goalDays / days.length : 0,
    minutesPerActiveDay: active.length > 0 ? minutes / active.length : null,
    answersPerMinute: minutes > 0 ? answers / minutes : null,
    accuracy: weightedAccuracy(days),
    bestDay: best ? { date: best.date, answers: best.answers } : null,
    accuracyChange: before !== null && after !== null ? after - before : null,
  }
}

export interface WeekTotal {
  /** First and last date of the week (7 days ending on the window's last day). */
  start: string
  end: string
  answers: number
  minutes: number
  accuracy: number | null
}

/**
 * Totals per 7-day block, oldest first, counting back from the last day so the
 * newest block is always a full week ending today. A short oldest block is kept.
 */
export function weeklyTotals(days: readonly CalendarDay[]): WeekTotal[] {
  const weeks: WeekTotal[] = []
  for (let end = days.length; end > 0; end -= DAYS_PER_WEEK) {
    const block = days.slice(Math.max(0, end - DAYS_PER_WEEK), end)
    weeks.unshift({
      start: block[0].date,
      end: block[block.length - 1].date,
      answers: block.reduce((n, d) => n + d.answers, 0),
      minutes: block.reduce((n, d) => n + d.minutes, 0),
      accuracy: weightedAccuracy(block),
    })
  }
  return weeks
}

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const
const WEEKDAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export interface WeekdayStat {
  label: string
  /** Mean answers on this weekday across the window (0 on idle days included). */
  avgAnswers: number
  /** Share of this weekday's dates with any answers, 0–1. */
  activeShare: number
}

/** Habit by weekday, Monday first. */
export function weekdayPattern(days: readonly CalendarDay[]): WeekdayStat[] {
  const sums = WEEKDAY_LABEL.map(() => ({ dates: 0, active: 0, answers: 0 }))
  for (const d of days) {
    const s = sums[parseLocalDate(d.date).getDay()]
    s.dates += 1
    s.answers += d.answers
    if (d.answers > 0) s.active += 1
  }
  return WEEKDAY_ORDER.map((i) => ({
    label: WEEKDAY_LABEL[i],
    avgAnswers: sums[i].dates > 0 ? sums[i].answers / sums[i].dates : 0,
    activeShare: sums[i].dates > 0 ? sums[i].active / sums[i].dates : 0,
  }))
}

/**
 * Accuracy over the trailing `window` days at each day, weighted by answers,
 * so one quiet day does not swing the line. Null until a day with answers.
 */
export function rollingAccuracy(days: readonly CalendarDay[], window = DAYS_PER_WEEK): (number | null)[] {
  return days.map((_, i) => weightedAccuracy(days.slice(Math.max(0, i - window + 1), i + 1)))
}

// ─── Forecast ────────────────────────────────────────────────────────────────

export interface ForecastSummary {
  total: number
  /** Overdue reviews count on the first day. */
  dueToday: number
  avgPerDay: number
  peak: { date: string; total: number } | null
  byTrack: Record<LearningTrack, number>
}

export function forecastSummary(days: readonly ForecastDay[]): ForecastSummary {
  const byTrack = Object.fromEntries(LEARNING_TRACKS.map((t) => [t, 0])) as Record<LearningTrack, number>
  let total = 0
  let peak: ForecastSummary['peak'] = null
  for (const d of days) {
    total += d.total
    if (d.total > 0 && (peak === null || d.total > peak.total)) peak = { date: d.date, total: d.total }
    for (const t of LEARNING_TRACKS) byTrack[t] += d.by_track[t] ?? 0
  }
  return {
    total,
    dueToday: days[0]?.total ?? 0,
    avgPerDay: days.length > 0 ? total / days.length : 0,
    peak,
    byTrack,
  }
}

// ─── Formatting ──────────────────────────────────────────────────────────────

const MS_PER_SECOND = 1000

/** "1.4 s", or a dash when unknown. */
export function formatSeconds(ms: number | null | undefined): string {
  return ms === null || ms === undefined ? '–' : `${(ms / MS_PER_SECOND).toFixed(1)} s`
}

/** "+4 pts" / "−2 pts" for a change of a 0–1 share; null when unknown. */
export function formatPointChange(change: number | null): string | null {
  if (change === null) return null
  const PERCENT = 100
  const pts = Math.round(change * PERCENT)
  if (pts === 0) return 'steady'
  return `${pts > 0 ? '+' : '−'}${Math.abs(pts)} pts`
}

/** "Mar 4" for YYYY-MM-DD. */
export function formatShortDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
