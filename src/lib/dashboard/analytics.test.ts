import { describe, expect, it } from 'vitest'
import type { CalendarDay, ForecastDay } from '@/types/progress'
import {
  activitySummary,
  forecastSummary,
  formatPointChange,
  lastDays,
  rollingAccuracy,
  weekdayPattern,
  weeklyTotals,
  weightedAccuracy,
} from './analytics'

function day(date: string, answers = 0, accuracy: number | null = null, minutes = 0, goal = false): CalendarDay {
  return { date, answers, minutes, accuracy, goal_met: goal }
}

// 2026-11-02 is a Monday.
const WEEK = [
  day('2026-11-02', 10, 0.5, 5, true),
  day('2026-11-03'),
  day('2026-11-04', 30, 1, 10, true),
  day('2026-11-05'),
  day('2026-11-06'),
  day('2026-11-07'),
  day('2026-11-08', 20, 0.75, 5),
]

describe('weightedAccuracy', () => {
  it('weights each day by its answers and skips idle days', () => {
    expect(weightedAccuracy(WEEK)).toBeCloseTo((5 + 30 + 15) / 60)
  })
  it('is null without answers', () => {
    expect(weightedAccuracy([day('2026-11-03')])).toBeNull()
  })
})

describe('activitySummary', () => {
  const s = activitySummary(WEEK)
  it('counts active days, consistency and the goal rate', () => {
    expect(s.activeDays).toBe(3)
    expect(s.consistency).toBeCloseTo(3 / 7)
    expect(s.goalRate).toBeCloseTo(2 / 7)
  })
  it('derives pace and the best day', () => {
    expect(s.answers).toBe(60)
    expect(s.minutesPerActiveDay).toBeCloseTo(20 / 3)
    expect(s.answersPerMinute).toBe(3)
    expect(s.bestDay).toEqual({ date: '2026-11-04', answers: 30 })
  })
  it('compares the second half with the first', () => {
    // First 3 days: 35/40; last 4: 15/20.
    expect(s.accuracyChange).toBeCloseTo(0.75 - 35 / 40)
  })
  it('handles an empty window', () => {
    const empty = activitySummary([])
    expect(empty).toMatchObject({ activeDays: 0, consistency: 0, minutesPerActiveDay: null, bestDay: null, accuracyChange: null })
  })
})

describe('weeklyTotals', () => {
  it('ends each block on the last day and keeps a short oldest block', () => {
    const days = [day('2026-11-01', 4), ...WEEK]
    const weeks = weeklyTotals(days)
    expect(weeks).toHaveLength(2)
    expect(weeks[0]).toMatchObject({ start: '2026-11-01', end: '2026-11-01', answers: 4 })
    expect(weeks[1]).toMatchObject({ start: '2026-11-02', end: '2026-11-08', answers: 60, minutes: 20 })
  })
})

describe('weekdayPattern', () => {
  it('starts on Monday and averages over every date of that weekday', () => {
    const p = weekdayPattern(WEEK)
    expect(p.map((d) => d.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(p[0]).toEqual({ label: 'Mon', avgAnswers: 10, activeShare: 1 })
    expect(p[1].activeShare).toBe(0)
  })
})

describe('rollingAccuracy', () => {
  it('is null before the first answer and trails the window after it', () => {
    const r = rollingAccuracy([day('2026-11-01'), ...WEEK.slice(0, 3)], 2)
    expect(r[0]).toBeNull()
    expect(r[1]).toBe(0.5)
    expect(r[2]).toBe(0.5)
    expect(r[3]).toBe(1)
  })
})

describe('forecastSummary', () => {
  it('totals per track and finds the peak day', () => {
    const days: ForecastDay[] = [
      { date: '2026-11-06', total: 5, by_track: { hiragana: 5 } },
      { date: '2026-11-07', total: 9, by_track: { hiragana: 2, kanji_n5: 7 } },
      { date: '2026-11-08', total: 0, by_track: {} },
    ]
    expect(forecastSummary(days)).toEqual({
      total: 14,
      dueToday: 5,
      avgPerDay: 14 / 3,
      peak: { date: '2026-11-07', total: 9 },
      byTrack: { hiragana: 7, katakana: 0, kanji_n5: 7, vocab_n5: 0, grammar_n5: 0 },
    })
  })
})

describe('helpers', () => {
  it('formats point changes', () => {
    expect(formatPointChange(0.042)).toBe('+4 pts')
    expect(formatPointChange(-0.02)).toBe('−2 pts')
    expect(formatPointChange(0.001)).toBe('steady')
    expect(formatPointChange(null)).toBeNull()
  })
  it('takes the last n days', () => {
    expect(lastDays([1, 2, 3], 2)).toEqual([2, 3])
    expect(lastDays([1], 5)).toEqual([1])
  })
})
