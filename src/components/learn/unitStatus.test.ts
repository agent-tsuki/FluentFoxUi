import { describe, expect, it } from 'vitest'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import type { UnitProgress } from '@/types/learningPath'
import { isUnitComplete, unitState, unitStatusSummary } from './unitStatus'

const unit: KanaUnit = { id: 'a', title: 'あ row', summary: '', kanaIds: ['a', 'i', 'u', 'e', 'o'], youtubeId: 'vid' }
const AT = '2026-11-07T00:00:00Z'

describe('unit completion', () => {
  it('a passed quiz finishes the unit with every other step left', () => {
    const progress: UnitProgress = { quizPassedAt: AT, quizBest: 0.85 }
    expect(isUnitComplete(unit, progress)).toBe(true)
    expect(unitStatusSummary(unit, progress)).toEqual({ state: 'done', completed: 1, total: 5 })
  })

  it('a failed quiz does not', () => {
    const progress: UnitProgress = { quizBest: 0.6, tracedAt: AT }
    expect(isUnitComplete(unit, progress)).toBe(false)
    expect(unitStatusSummary(unit, progress).state).toBe('in-progress')
  })

  it('every step done still finishes the unit, and testing out still counts', () => {
    const all: UnitProgress = { watchedAt: AT, tracedAt: AT, practisedAt: AT, printedAt: AT, quizPassedAt: AT }
    expect(isUnitComplete(unit, all)).toBe(true)
    expect(unitStatusSummary(unit, { skippedAt: AT }).state).toBe('skipped')
    expect(isUnitComplete(unit, { skippedAt: AT })).toBe(true)
  })

  it('a passed quiz wins over tested out', () => {
    expect(unitState(1, 5, true, true)).toBe('done')
  })

  it('nothing done is not started', () => {
    expect(isUnitComplete(unit, undefined)).toBe(false)
    expect(unitStatusSummary(unit, undefined).state).toBe('not-started')
  })
})
