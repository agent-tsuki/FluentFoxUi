import { describe, expect, it } from 'vitest'
import {
  formatCompactCount,
  formatTotalDuration,
  formatUpdatedDate,
  formatVideoCount,
  formatVideoDuration,
  initials,
  isRepeatedText,
  normalizeText,
  safeAccentColor,
} from '@/lib/classes/format'

describe('formatTotalDuration', () => {
  it.each([
    [0, ''],
    [-5, ''],
    [Number.NaN, ''],
    [20, '1m'],
    [45 * 60, '45m'],
    [3600, '1h'],
    [36000, '10h'],
    [3600 + 5 * 60, '1h 5m'],
    [3599, '1h'],
    [2 * 3600 + 59 * 60 + 40, '3h'],
  ])('%s s → %j', (sec, expected) => {
    expect(formatTotalDuration(sec)).toBe(expected)
  })
})

describe('formatVideoDuration', () => {
  it.each([
    [0, ''],
    [5, '0:05'],
    [245, '4:05'],
    [3729, '1:02:09'],
    [36000, '10:00:00'],
  ])('%s s → %j', (sec, expected) => {
    expect(formatVideoDuration(sec)).toBe(expected)
  })
})

describe('count and date helpers', () => {
  it('formats subscriber counts compactly', () => {
    expect(formatCompactCount(660000)).toBe('660K')
    expect(formatCompactCount(1_250_000)).toBe('1.3M')
    expect(formatCompactCount(932)).toBe('932')
  })

  it('pluralises video counts', () => {
    expect(formatVideoCount(1)).toBe('1 video')
    expect(formatVideoCount(1800)).toBe('1,800 videos')
  })

  it('formats the last-updated date and hides bad input', () => {
    expect(formatUpdatedDate('2026-10-22T08:00:00Z')).toBe('22 Oct 2026')
    expect(formatUpdatedDate(null)).toBe('')
    expect(formatUpdatedDate('not a date')).toBe('')
  })
})

describe('safeAccentColor', () => {
  it('accepts only #RRGGBB', () => {
    expect(safeAccentColor('#E53935')).toBe('#E53935')
    expect(safeAccentColor('red')).toBeNull()
    expect(safeAccentColor('#fff')).toBeNull()
    expect(safeAccentColor('#E53935;background:url(x)')).toBeNull()
    expect(safeAccentColor(null)).toBeNull()
  })
})

describe('initials', () => {
  it('uses the first two words, ignoring parentheses', () => {
    expect(initials('Miku Sensei (Udemy)')).toBe('MS')
    expect(initials('JapanesePod101')).toBe('J')
    expect(initials('   ')).toBe('?')
  })
})

describe('repeated text', () => {
  it('normalises case and whitespace', () => {
    expect(normalizeText('  Warm,\n  story-driven   TEACHING ')).toBe('warm, story-driven teaching')
    expect(normalizeText(null)).toBe('')
  })

  it('flags empty text or text that repeats another field', () => {
    expect(isRepeatedText('Warm and clear.', 'warm  and clear.', 'Other')).toBe(true)
    expect(isRepeatedText('Warm and clear.', 'Summary', 'warm and CLEAR.')).toBe(true)
    expect(isRepeatedText('Warm and clear.', 'Summary', 'Description')).toBe(false)
    expect(isRepeatedText('   ', 'x')).toBe(true)
    expect(isRepeatedText('Style', null, undefined)).toBe(false)
  })
})
