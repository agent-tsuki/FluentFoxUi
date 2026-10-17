/**
 * Tested-out units and skip / final test bests from GET /learn/tests/history,
 * shaped for the course path. Pure.
 */
import type { CourseScopes, FinalTestResult, PathTests } from '@/types/learningPath'
import type { LearningTrack, TestHistoryEntry } from '@/types/learn'

export const ALL_UNITS_SCOPE = 'all'

/** Whole-number score scale for a result added on the client. */
const LOCAL_SCORE_SCALE = 1000

export const EMPTY_PATH_TESTS: PathTests = { skipTests: {}, testedOut: {} }

function share(e: Pick<TestHistoryEntry, 'score' | 'total'>): number {
  return e.total > 0 ? e.score / e.total : 0
}

function unitsInScope(scopes: CourseScopes, scope: string): readonly string[] {
  if (scope === ALL_UNITS_SCOPE) return scopes.groups.flatMap((g) => g.unitIds)
  return scopes.groups.find((g) => g.id === scope)?.unitIds ?? []
}

function earlier(a: string | undefined, b: string): string {
  return a !== undefined && a < b ? a : b
}

/** Keeps the higher best and the earlier pass of two final-test results. */
function mergeFinal(prev: FinalTestResult | undefined, best: number, passedAt: string | undefined): FinalTestResult {
  const out: FinalTestResult = { best: Math.max(prev?.best ?? 0, best) }
  const passed = passedAt ? earlier(prev?.passedAt, passedAt) : prev?.passedAt
  if (passed) out.passedAt = passed
  return out
}

/**
 * One course's test results. Skip tests that passed mark every unit in their
 * scope as tested out (at the best attempt's time); a whole-course skip test
 * also counts towards the final test when `scopes.skipAllFinalMark` is set.
 * Entries for other tracks are ignored.
 */
export function pathTestsFromHistory(entries: readonly TestHistoryEntry[], track: LearningTrack, scopes: CourseScopes): PathTests {
  const out: PathTests = { skipTests: {}, testedOut: {} }
  for (const e of entries) {
    if (e.track !== track) continue
    if (e.kind === 'final') {
      out.finalTest = mergeFinal(out.finalTest, share(e), e.passed ? e.taken_at : undefined)
      continue
    }
    if (e.kind !== 'skip') continue
    out.skipTests[e.scope] = Math.max(out.skipTests[e.scope] ?? 0, share(e))
    if (e.passed) {
      for (const slug of unitsInScope(scopes, e.scope)) out.testedOut[slug] = earlier(out.testedOut[slug], e.taken_at)
    }
    const finalMark = scopes.skipAllFinalMark
    if (e.scope === ALL_UNITS_SCOPE && finalMark !== undefined) {
      out.finalTest = mergeFinal(out.finalTest, share(e), share(e) >= finalMark ? e.taken_at : undefined)
    }
  }
  return out
}

/**
 * A result just shown on screen, added before the history reloads so the
 * path updates at once. `at` is the attempt's time (ISO).
 */
export function withLocalAttempt(
  entries: readonly TestHistoryEntry[],
  attempt: Pick<TestHistoryEntry, 'kind' | 'track' | 'scope' | 'passed'> & { share: number; at: string },
): TestHistoryEntry[] {
  const { share: s, at, ...rest } = attempt
  const total = LOCAL_SCORE_SCALE
  return [...entries, { ...rest, score: Math.round(s * total), total, pass_mark: 0, attempts: 1, taken_at: at, last_taken_at: at }]
}
