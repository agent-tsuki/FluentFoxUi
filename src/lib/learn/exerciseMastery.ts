/**
 * The learner's best score on each chapter exercise, kept in this browser.
 * Exercises run client-side and aren't sent to the server (the chapter test
 * is), so this is what lets the Exercise tab show what has been mastered.
 * Pure helpers plus two storage wrappers that never throw.
 */

/** A best score at or above this share counts as mastered. */
export const MASTERY_SHARE = 0.9

const STORAGE_KEY = 'ff-exercise-best-v1'

/** Best share right (0–1) by exercise key. */
export type ExerciseBests = Record<string, number>

export function exerciseKey(level: string, chapterId: number, setId: string): string {
  return `${level.toLowerCase()}/${chapterId}/${setId}`
}

/** The bests with this attempt kept if it beats the old one. A sheet with no questions changes nothing. */
export function withAttempt(bests: ExerciseBests, key: string, right: number, total: number): ExerciseBests {
  if (total <= 0) return bests
  const share = Math.min(1, Math.max(0, right / total))
  return share > (bests[key] ?? -1) ? { ...bests, [key]: share } : bests
}

export function isMastered(share: number | undefined): boolean {
  return share !== undefined && share >= MASTERY_SHARE
}

function isBests(value: unknown): value is ExerciseBests {
  return typeof value === 'object' && value !== null && Object.values(value).every((v) => typeof v === 'number')
}

export function loadExerciseBests(): ExerciseBests {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return isBests(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveExerciseBests(bests: ExerciseBests): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bests))
  } catch {
    // Private mode or full storage: the score shows for this visit only.
  }
}
