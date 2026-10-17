import { describe, expect, it } from 'vitest'
import {
  activityTier,
  addDays,
  calendarWeeks,
  forecastBars,
  forecastTotal,
  formatMinutes,
  formatShare,
  monthLabels,
  monthRange,
  streakCalendarFrom,
} from '@/lib/learn/progressShape'
import type { CalendarDay, ForecastDay, ProgressCalendar } from '@/types/progress'

const fday = (date: string, hira: number, kanji: number): ForecastDay => ({
  date,
  by_track: { ...(hira ? { hiragana: hira } : {}), ...(kanji ? { kanji_n5: kanji } : {}) },
  total: hira + kanji,
})

const cday = (date: string, minutes: number, goal = false): CalendarDay => ({
  date,
  answers: minutes > 0 ? minutes * 2 : 0,
  minutes,
  accuracy: minutes > 0 ? 0.9 : null,
  goal_met: goal,
})

describe('addDays', () => {
  it('crosses month and year ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })
})

describe('forecastBars', () => {
  const days = [fday('2026-10-17', 10, 10), fday('2026-10-18', 5, 0), fday('2026-10-19', 0, 0), fday('2026-10-20', 0, 4)]

  it('labels today and tomorrow, then weekdays', () => {
    expect(forecastBars(days).map((b) => b.label)).toEqual(['Today', 'Tomorrow', 'Mon', 'Tue'])
  })

  it('scales bars to the busiest day across all tracks', () => {
    const bars = forecastBars(days)
    expect(bars.map((b) => b.count)).toEqual([20, 5, 0, 4])
    expect(bars.map((b) => b.pct)).toEqual([100, 25, 0, 20])
  })

  it('counts one track only, treating a missing track as zero', () => {
    const bars = forecastBars(days, 'kanji_n5')
    expect(bars.map((b) => b.count)).toEqual([10, 0, 0, 4])
    expect(forecastTotal(bars)).toBe(14)
  })

  it('gives flat bars when nothing is due', () => {
    expect(forecastBars([fday('2026-10-17', 0, 0)])[0].pct).toBe(0)
  })
})

describe('calendarWeeks', () => {
  it('is empty without days', () => {
    expect(calendarWeeks([])).toEqual([])
  })

  it('starts on Sunday and pads days outside the range', () => {
    // 2026-10-14 is a Wednesday, 2026-10-17 a Saturday.
    const weeks = calendarWeeks([cday('2026-10-14', 10, true), cday('2026-10-15', 0), cday('2026-10-16', 40), cday('2026-10-17', 5)])
    expect(weeks).toHaveLength(1)
    const week = weeks[0]
    expect(week[0].date).toBe('2026-10-11')
    expect(week.slice(0, 3).every((c) => c.isPlaceholder)).toBe(true)
    expect(week[3]).toMatchObject({ date: '2026-10-14', minutes: 10, goalMet: true, isPlaceholder: false })
    expect(week[6]).toMatchObject({ date: '2026-10-17', minutes: 5, goalMet: false, isPlaceholder: false })
  })

  it('pads the last week after the last day', () => {
    const weeks = calendarWeeks([cday('2026-10-17', 5), cday('2026-10-18', 5)])
    expect(weeks).toHaveLength(2)
    expect(weeks[1][0].isPlaceholder).toBe(false)
    expect(weeks[1].slice(1).every((c) => c.isPlaceholder)).toBe(true)
  })

  it('labels each month over its first week column', () => {
    const days = Array.from({ length: 40 }, (_, i) => cday(addDays('2026-09-20', i), 0))
    expect(monthLabels(calendarWeeks(days))).toEqual([
      { label: 'Sep', colIndex: 0 },
      { label: 'Oct', colIndex: 2 },
    ])
  })
})

describe('activityTier', () => {
  const cases: [number, number][] = [
    [0, 0],
    [1, 1],
    [14, 1],
    [15, 2],
    [30, 3],
    [60, 4],
    [180, 4],
  ]
  for (const [minutes, tier] of cases) {
    it(`puts ${minutes} min in tier ${tier}`, () => {
      expect(activityTier(minutes)).toBe(tier)
    })
  }
})

describe('streakCalendarFrom', () => {
  it('maps days with their goal flag, streaks and the last seven days', () => {
    const days = Array.from({ length: 9 }, (_, i) => cday(addDays('2026-10-09', i), 10, i % 2 === 0))
    const calendar: ProgressCalendar = { days, current_streak: 3, longest_streak: 12, active_days: 9 }
    const data = streakCalendarFrom(calendar)
    expect(data.activities[0]).toEqual({ date: '2026-10-09', minutes: 10, goalMet: true })
    expect(data.activities[1].goalMet).toBe(false)
    expect(data).toMatchObject({ currentStreak: 3, longestStreak: 12, totalActiveDays: 9, thisWeekMinutes: 70 })
  })
})

describe('monthRange', () => {
  it('covers the whole month, leap years included', () => {
    expect(monthRange('2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(monthRange('2026-10-17')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
  })
})

describe('formatting', () => {
  it('writes minutes and hours', () => {
    expect(formatMinutes(0)).toBe('0 min')
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(60)).toBe('1h')
    expect(formatMinutes(65)).toBe('1h 5m')
  })

  it('writes a share as a percent, or a dash when unknown', () => {
    expect(formatShare(0.873)).toBe('87%')
    expect(formatShare(null)).toBe('–')
  })
})
