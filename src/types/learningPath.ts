/**
 * Guided-path state of one course (a kana script or a kanji level) as the
 * pages read it. Unit steps and quiz results come from the learn API
 * (GET /learn/units); tested-out units and skip / final test bests come from
 * GET /learn/tests/history. Printing, "put back in the path" and the
 * certificate name have no API and are kept on this device per user.
 */

/** The steps of a kana unit. 'learn' is done once the unit's kana were all opened (the API's 'traced' step). */
export type UnitStep = 'watch' | 'learn' | 'practise' | 'print' | 'quiz'

export interface UnitProgress {
  watchedAt?: string
  /** Every character of the unit opened (Learn step). */
  tracedAt?: string
  /** Kanji units: every kanji written once from memory (Write step). */
  writtenAt?: string
  practisedAt?: string
  /** On this device only. */
  printedAt?: string
  /** Best unit-quiz score, 0–1. */
  quizBest?: number
  quizPassedAt?: string
  /** Tested out with a passed skip test (from the test history). */
  skippedAt?: string
}

export interface FinalTestResult {
  /** Best score, 0–1. */
  best: number
  passedAt?: string
  /** Name the learner typed for the certificate. */
  certificateName?: string
}

/** Best score per skip scope ('all' | a group id), 0–1. */
export type SkipTestBest = Partial<Record<string, number>>

export interface LearningPathState {
  version: 1
  /** Per unit slug. */
  units: Record<string, UnitProgress>
  finalTest?: FinalTestResult
  skipTests?: SkipTestBest
}

export interface LocalUnitRecord {
  printedAt?: string
  /** "Put back in the path": hides a skip pass taken before this time. */
  skipUndoneAt?: string
}

/** What is kept on the device (per user) because the API has no place for it. */
export interface LocalPathRecord {
  version: 3
  units: Record<string, LocalUnitRecord>
  certificateName?: string
}

/** Tested-out units and test bests, derived from the test history. */
export interface PathTests {
  finalTest?: FinalTestResult
  skipTests: SkipTestBest
  /** Unit slug → when a passed skip test covered it. */
  testedOut: Record<string, string>
}

/** The groups a course's skip tests cover ('all' covers every unit). */
export interface CourseScopes {
  groups: readonly { id: string; unitIds: readonly string[] }[]
  /**
   * Kana: a whole-script skip test scoring at least this share also counts
   * as the final test (certificate). Omitted for kanji.
   */
  skipAllFinalMark?: number
}
