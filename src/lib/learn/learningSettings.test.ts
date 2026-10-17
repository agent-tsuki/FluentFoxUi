import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LEARNING_SETTINGS,
  hasErrors,
  percentToRetention,
  retentionToPercent,
  settingsChanges,
  validateSettings,
} from '@/lib/learn/learningSettings'
import type { LearningSettings } from '@/types/learn'

const base: LearningSettings = DEFAULT_LEARNING_SETTINGS

describe('validateSettings', () => {
  it('accepts the defaults', () => {
    expect(hasErrors(validateSettings(base))).toBe(false)
  })

  const cases: { name: string; patch: Partial<LearningSettings>; field: keyof LearningSettings }[] = [
    { name: 'rejects a daily goal under 5', patch: { daily_goal_answers: 4 }, field: 'daily_goal_answers' },
    { name: 'rejects more than 100 new kana', patch: { new_kana_per_day: 101 }, field: 'new_kana_per_day' },
    { name: 'rejects more than 50 new kanji', patch: { new_kanji_per_day: 51 }, field: 'new_kanji_per_day' },
    { name: 'rejects fewer than 10 max reviews', patch: { max_reviews_per_day: 9 }, field: 'max_reviews_per_day' },
    { name: 'rejects a session of 4 cards', patch: { session_size: 4 }, field: 'session_size' },
    { name: 'rejects a lesson of 0 items', patch: { lesson_size: 0 }, field: 'lesson_size' },
    { name: 'rejects hour 24', patch: { day_starts_at_hour: 24 }, field: 'day_starts_at_hour' },
    { name: 'rejects retention above 0.97', patch: { desired_retention: 0.98 }, field: 'desired_retention' },
    { name: 'rejects retention below 0.70', patch: { desired_retention: 0.69 }, field: 'desired_retention' },
    { name: 'rejects a fractional count', patch: { session_size: 12.5 }, field: 'session_size' },
    { name: 'rejects an empty field', patch: { lesson_size: Number.NaN }, field: 'lesson_size' },
  ]
  for (const c of cases) {
    it(c.name, () => {
      const errors = validateSettings({ ...base, ...c.patch })
      expect(Object.keys(errors)).toEqual([c.field])
    })
  }

  it('accepts the range edges', () => {
    const edges: LearningSettings = {
      ...base,
      daily_goal_answers: 200,
      new_kana_per_day: 0,
      new_kanji_per_day: 0,
      max_reviews_per_day: 1000,
      session_size: 5,
      lesson_size: 20,
      day_starts_at_hour: 0,
      desired_retention: 0.7,
    }
    expect(validateSettings(edges)).toEqual({})
  })
})

describe('settingsChanges', () => {
  it('is empty when nothing changed', () => {
    expect(settingsChanges(base, { ...base })).toEqual({})
  })

  it('sends only the changed fields', () => {
    const draft = { ...base, daily_goal_answers: 40, show_retention: false, answer_mode: 'typed' as const }
    expect(settingsChanges(base, draft)).toEqual({ daily_goal_answers: 40, show_retention: false, answer_mode: 'typed' })
  })
})

describe('retention percent', () => {
  it('round-trips whole percents without float noise', () => {
    expect(retentionToPercent(0.9)).toBe(90)
    expect(percentToRetention(87)).toBe(0.87)
    expect(retentionToPercent(percentToRetention(97))).toBe(97)
  })
})
