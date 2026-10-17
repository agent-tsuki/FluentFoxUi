/**
 * Pure mapping from the learn API's unit progress (GET /learn/units) and test
 * history to the path state the course pages read. No I/O.
 */
import type { LearningPathState, LocalPathRecord, LocalUnitRecord, PathTests, UnitProgress } from '@/types/learningPath'
import type { UnitProgressData } from '@/types/learn'
import { EMPTY_PATH_TESTS } from '@/lib/learn/testHistory'

const PERCENT = 100

export const EMPTY_LOCAL_PATH: LocalPathRecord = { version: 3, units: {} }

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

function localExtras(local: LocalUnitRecord | undefined, testedOutAt: string | undefined): Partial<UnitProgress> {
  const out: Partial<UnitProgress> = {}
  if (local?.printedAt) out.printedAt = local.printedAt
  // A skip pass taken after "put back in the path" counts again.
  if (testedOutAt && !(local?.skipUndoneAt && local.skipUndoneAt >= testedOutAt)) out.skippedAt = testedOutAt
  return out
}

/** The path state: the server's unit fields and test results with this device's extras on top. */
export function mergePath(
  server: Readonly<Record<string, UnitProgress>>,
  local: LocalPathRecord,
  tests: PathTests = EMPTY_PATH_TESTS,
): LearningPathState {
  const units: Record<string, UnitProgress> = { ...server }
  const slugs = new Set([...Object.keys(local.units), ...Object.keys(tests.testedOut)])
  for (const slug of slugs) {
    const extra = localExtras(local.units[slug], tests.testedOut[slug])
    if (Object.keys(extra).length > 0) units[slug] = { ...units[slug], ...extra }
  }
  const state: LearningPathState = { version: 1, units, skipTests: tests.skipTests }
  if (tests.finalTest) {
    state.finalTest = local.certificateName ? { ...tests.finalTest, certificateName: local.certificateName } : tests.finalTest
  }
  return state
}

interface LegacyLocalRecord {
  version: 2
  units: Record<string, { printedAt?: string }>
  finalTest?: { certificateName?: string }
}

function fromLegacy(old: LegacyLocalRecord): LocalPathRecord {
  const units: Record<string, LocalUnitRecord> = {}
  for (const [slug, u] of Object.entries(old.units)) if (u?.printedAt) units[slug] = { printedAt: u.printedAt }
  const name = old.finalTest?.certificateName
  return name ? { version: 3, units, certificateName: name } : { version: 3, units }
}

/**
 * Reads a stored local record; anything unexpected reads as empty. A version 2
 * record keeps its print dates and certificate name; its skips and test bests
 * are dropped because the test history now holds them.
 */
export function parseLocalPath(raw: string | null): LocalPathRecord {
  if (!raw) return EMPTY_LOCAL_PATH
  try {
    const parsed = JSON.parse(raw) as { version?: unknown; units?: unknown } | null
    if (!parsed?.units || typeof parsed.units !== 'object') return EMPTY_LOCAL_PATH
    if (parsed.version === 3) return parsed as LocalPathRecord
    if (parsed.version === 2) return fromLegacy(parsed as LegacyLocalRecord)
    return EMPTY_LOCAL_PATH
  } catch {
    return EMPTY_LOCAL_PATH
  }
}
