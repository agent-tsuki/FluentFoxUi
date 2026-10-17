/**
 * Settings → Learning: the ranges the server enforces (backend plan §4.2,
 * `UpdateLearningSettingsRequest`), checks for a draft and the PUT body for
 * the fields that changed. Pure.
 */
import type { AnswerMode, LearningSettings, LearningSettingsUpdate } from '@/types/learn'

/** Every numeric setting the page edits. */
export type NumericSettingKey = Exclude<keyof LearningSettings, 'answer_mode' | 'show_retention'>

export interface SettingRange {
  min: number
  max: number
  step: number
}

export const SETTING_RANGES: Record<NumericSettingKey, SettingRange> = {
  daily_goal_answers: { min: 5, max: 200, step: 5 },
  new_kana_per_day: { min: 0, max: 100, step: 1 },
  new_kanji_per_day: { min: 0, max: 50, step: 1 },
  max_reviews_per_day: { min: 10, max: 1000, step: 10 },
  session_size: { min: 5, max: 100, step: 1 },
  lesson_size: { min: 1, max: 20, step: 1 },
  day_starts_at_hour: { min: 0, max: 23, step: 1 },
  desired_retention: { min: 0.7, max: 0.97, step: 0.01 },
}

export const ANSWER_MODES: readonly AnswerMode[] = ['mixed', 'choice', 'typed']

export const ANSWER_MODE_TEXT: Record<AnswerMode, { label: string; hint: string }> = {
  mixed: { label: 'Mixed', hint: 'Multiple choice while new, typing once a card is settled.' },
  choice: { label: 'Multiple choice', hint: 'Always pick from options.' },
  typed: { label: 'Typed', hint: 'Type the answer whenever a card is ready for it.' },
}

/** The defaults a new learner starts with (plan §4.2). */
export const DEFAULT_LEARNING_SETTINGS: LearningSettings = {
  desired_retention: 0.9,
  new_kana_per_day: 15,
  new_kanji_per_day: 10,
  max_reviews_per_day: 200,
  session_size: 20,
  lesson_size: 5,
  daily_goal_answers: 20,
  day_starts_at_hour: 4,
  answer_mode: 'mixed',
  show_retention: true,
}

export type SettingsErrors = Partial<Record<NumericSettingKey, string>>

const NUMERIC_KEYS = Object.keys(SETTING_RANGES) as NumericSettingKey[]

/** Retention is edited as a whole percent (70–97) and stored as a share. */
export const PERCENT = 100

export function retentionToPercent(share: number): number {
  return Math.round(share * PERCENT)
}

export function percentToRetention(percent: number): number {
  return Math.round(percent) / PERCENT
}

function rangeMessage(key: NumericSettingKey, { min, max }: SettingRange): string {
  if (key === 'desired_retention') return `Choose ${retentionToPercent(min)}–${retentionToPercent(max)} %.`
  return `Choose a whole number from ${min} to ${max}.`
}

function isValid(key: NumericSettingKey, value: number): boolean {
  const { min, max } = SETTING_RANGES[key]
  if (!Number.isFinite(value) || value < min || value > max) return false
  // Retention is a share with two decimals; the rest are counts or hours.
  return key === 'desired_retention' || Number.isInteger(value)
}

/** One message per field outside the server's range; empty when the draft can be saved. */
export function validateSettings(draft: LearningSettings): SettingsErrors {
  const errors: SettingsErrors = {}
  for (const key of NUMERIC_KEYS) {
    if (!isValid(key, draft[key])) errors[key] = rangeMessage(key, SETTING_RANGES[key])
  }
  return errors
}

export function hasErrors(errors: SettingsErrors): boolean {
  return Object.keys(errors).length > 0
}

/** The PUT body: only the fields that differ from what the server sent. */
export function settingsChanges(saved: LearningSettings, draft: LearningSettings): LearningSettingsUpdate {
  const changes: LearningSettingsUpdate = {}
  for (const key of Object.keys(draft) as (keyof LearningSettings)[]) {
    if (draft[key] !== saved[key]) Object.assign(changes, { [key]: draft[key] })
  }
  return changes
}

/** "4:00" for the day-start hour picker. */
export function formatHour(hour: number): string {
  return `${hour}:00`
}
