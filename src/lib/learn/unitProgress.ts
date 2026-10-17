/**
 * Pure mapping from the learn API's unit progress (GET /learn/units) to the
 * path state the course pages read. No I/O.
 */
import type { LearningPathState, LocalPathRecord, UnitProgress } from '@/types/learningPath'
import type { UnitProgressData } from '@/types/learn'

const PERCENT = 100

export const EMPTY_LOCAL_PATH: LocalPathRecord = { version: 2, units: {} }

/** The API's fields of one unit, without the steps not done. */
export function toUnitProgress(d: UnitProgressData): UnitProgress {
  const out: UnitProgress = {}
  if (d.watched_at) out.watchedAt = d.watched_at
  if (d.traced_at) out.tracedAt = d.traced_at
  if (d.written_at) out.writtenAt = d.written_at
  if (d.practised_at) out.practisedAt = d.practised_at
  if (d.quiz_best_pct !== null) out.quizBest = d.quiz_best_pct / PERCENT
  if (d.completed_at) out.quizPassedAt = d.completed_at
  return out
}

/** Server units by slug (the content API's unit id). */
export function unitsBySlug(list: readonly UnitProgressData[]): Record<string, UnitProgress> {
  return Object.fromEntries(list.map((d) => [d.unit_slug, toUnitProgress(d)]))
}

/** The path state: the server's unit fields with this device's extras on top. */
export function mergePath(server: Readonly<Record<string, UnitProgress>>, local: LocalPathRecord): LearningPathState {
  const units: Record<string, UnitProgress> = { ...server }
  for (const [slug, extra] of Object.entries(local.units)) units[slug] = { ...units[slug], ...extra }
  const state: LearningPathState = { version: 1, units }
  if (local.finalTest) state.finalTest = local.finalTest
  if (local.skipTests) state.skipTests = local.skipTests
  return state
}

/** Reads a stored local record; anything unexpected reads as empty. */
export function parseLocalPath(raw: string | null): LocalPathRecord {
  if (!raw) return EMPTY_LOCAL_PATH
  try {
    const parsed = JSON.parse(raw) as Partial<LocalPathRecord> | null
    return parsed?.version === 2 && parsed.units && typeof parsed.units === 'object' ? (parsed as LocalPathRecord) : EMPTY_LOCAL_PATH
  } catch {
    return EMPTY_LOCAL_PATH
  }
}
