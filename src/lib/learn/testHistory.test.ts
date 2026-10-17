import { describe, expect, it } from 'vitest'
import { pathTestsFromHistory, withLocalAttempt } from '@/lib/learn/testHistory'
import type { CourseScopes } from '@/types/learningPath'
import type { TestHistoryEntry } from '@/types/learn'

const scopes: CourseScopes = {
  groups: [
    { id: 'basic', unitIds: ['a', 'ka'] },
    { id: 'dakuten', unitIds: ['ga'] },
  ],
}

function entry(p: Partial<TestHistoryEntry>): TestHistoryEntry {
  return {
    kind: 'skip',
    track: 'hiragana',
    scope: 'basic',
    score: 9,
    total: 10,
    pass_mark: 0.9,
    passed: true,
    attempts: 1,
    taken_at: '2026-10-01T10:00:00Z',
    last_taken_at: '2026-10-01T10:00:00Z',
    ...p,
  }
}

describe('pathTestsFromHistory', () => {
  it('marks every unit of a passed group as tested out and keeps the best', () => {
    const tests = pathTestsFromHistory([entry({})], 'hiragana', scopes)
    expect(tests.testedOut).toEqual({ a: '2026-10-01T10:00:00Z', ka: '2026-10-01T10:00:00Z' })
    expect(tests.skipTests).toEqual({ basic: 0.9 })
    expect(tests.finalTest).toBeUndefined()
  })

  it('records a failed skip test without testing anything out', () => {
    const tests = pathTestsFromHistory([entry({ score: 5, passed: false })], 'hiragana', scopes)
    expect(tests.testedOut).toEqual({})
    expect(tests.skipTests).toEqual({ basic: 0.5 })
  })

  it("tests out every unit with a passed 'all' skip test", () => {
    const tests = pathTestsFromHistory([entry({ scope: 'all' })], 'hiragana', scopes)
    expect(Object.keys(tests.testedOut).sort()).toEqual(['a', 'ga', 'ka'])
  })

  it('keeps the earlier date when two passes cover a unit', () => {
    const tests = pathTestsFromHistory(
      [entry({ scope: 'all', taken_at: '2026-10-05T00:00:00Z' }), entry({ taken_at: '2026-10-02T00:00:00Z' })],
      'hiragana',
      scopes,
    )
    expect(tests.testedOut.a).toBe('2026-10-02T00:00:00Z')
    expect(tests.testedOut.ga).toBe('2026-10-05T00:00:00Z')
  })

  it('reads the final test best and pass', () => {
    const tests = pathTestsFromHistory([entry({ kind: 'final', scope: 'all', score: 41, total: 50, passed: true })], 'hiragana', scopes)
    expect(tests.finalTest).toEqual({ best: 0.82, passedAt: '2026-10-01T10:00:00Z' })
  })

  it('leaves a failed final test without a pass date', () => {
    const tests = pathTestsFromHistory([entry({ kind: 'final', scope: 'all', score: 30, total: 50, passed: false })], 'hiragana', scopes)
    expect(tests.finalTest).toEqual({ best: 0.6 })
  })

  it('counts a whole-course skip test at the final mark towards the certificate', () => {
    const kana: CourseScopes = { ...scopes, skipAllFinalMark: 0.8 }
    const tests = pathTestsFromHistory([entry({ scope: 'all', score: 85, total: 100, passed: false })], 'hiragana', kana)
    expect(tests.finalTest).toEqual({ best: 0.85, passedAt: '2026-10-01T10:00:00Z' })
    expect(tests.testedOut).toEqual({})
  })

  it('does not count a group skip test or kanji skip-all towards the final test', () => {
    expect(pathTestsFromHistory([entry({})], 'hiragana', { ...scopes, skipAllFinalMark: 0.8 }).finalTest).toBeUndefined()
    expect(pathTestsFromHistory([entry({ scope: 'all' })], 'hiragana', scopes).finalTest).toBeUndefined()
  })

  it('ignores other tracks and unit quizzes', () => {
    const tests = pathTestsFromHistory([entry({ track: 'katakana' }), entry({ kind: 'unit_quiz', scope: 'a' })], 'hiragana', scopes)
    expect(tests).toEqual({ skipTests: {}, testedOut: {} })
  })
})

describe('withLocalAttempt', () => {
  it('adds a just-finished test so the path shows it before the history reloads', () => {
    const entries = withLocalAttempt([], { kind: 'skip', track: 'hiragana', scope: 'dakuten', passed: true, share: 0.95, at: '2026-10-17T09:00:00Z' })
    const tests = pathTestsFromHistory(entries, 'hiragana', scopes)
    expect(tests.testedOut).toEqual({ ga: '2026-10-17T09:00:00Z' })
    expect(tests.skipTests.dakuten).toBeCloseTo(0.95)
  })
})
