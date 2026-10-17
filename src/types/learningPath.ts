/**
 * Guided-path state of one course (a kana script or a kanji level) as the
 * pages read it. Unit steps and quiz results come from the learn API
 * (GET /learn/units); printing, tested-out units, test bests and the
 * certificate name have no API yet and are kept on this device per user.
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
  /** Tested out with a passed skip test (on this device only). */
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

/** What is kept on the device (per user) because the API has no place for it yet. */
export interface LocalPathRecord {
  version: 2
  units: Record<string, Pick<UnitProgress, 'printedAt' | 'skippedAt'>>
  finalTest?: FinalTestResult
  skipTests?: SkipTestBest
}
