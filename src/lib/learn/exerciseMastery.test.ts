import { describe, expect, it } from 'vitest'
import { exerciseKey, isMastered, withAttempt } from './exerciseMastery'

describe('exerciseMastery', () => {
  const key = exerciseKey('N5', 2, 'fix')

  it('keys by level, chapter and exercise', () => {
    expect(key).toBe('n5/2/fix')
  })

  it('keeps the best attempt only', () => {
    const first = withAttempt({}, key, 6, 10)
    expect(first[key]).toBe(0.6)
    expect(withAttempt(first, key, 4, 10)).toBe(first)
    expect(withAttempt(first, key, 9, 10)[key]).toBe(0.9)
  })

  it('ignores an empty sheet', () => {
    expect(withAttempt({}, key, 0, 0)).toEqual({})
  })

  it('counts 90% and above as mastered', () => {
    expect(isMastered(0.9)).toBe(true)
    expect(isMastered(0.89)).toBe(false)
    expect(isMastered(undefined)).toBe(false)
  })
})
