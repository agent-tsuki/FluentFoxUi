import type { KanjiUnit } from '@/types/kanji'
import type { UnitProgress } from '@/types/learningPath'
import type { MasteryLevel } from '@/types/progress'
import type { KanjiUnitStep } from '@/lib/content/kanji/courseTypes'
import { MASTERY_LABEL, MASTERY_LEVELS } from '@/lib/learn/mastery'

// Reviews, lessons, practice and tests run on the learn API; a level's path
// (unit steps, quizzes, test-outs, level test) is in learningPathService.
export { getKanjiPath } from '@/api/services/learningPathService'

// ─── Stages ──────────────────────────────────────────────────────────────────

/**
 * The five friendly SRS stages a learner sees: the progress API's mastery
 * levels (plan §7.4). A kanji takes the lower of its two cards. Read them
 * with useKanjiStage (hooks/useKanji).
 */
export type KanjiStage = MasteryLevel

export const KANJI_STAGES: readonly KanjiStage[] = MASTERY_LEVELS

export const KANJI_STAGE_LABEL: Record<KanjiStage, string> = MASTERY_LABEL

// ─── Units ───────────────────────────────────────────────────────────────────

/** Which of a kanji unit's steps are done. Learn = every kanji of the lesson opened (the API's 'traced' step). */
export function kanjiUnitSteps(_unit: KanjiUnit, progress: UnitProgress | undefined): Record<KanjiUnitStep, boolean> {
  const p = progress ?? {}
  return {
    learn: Boolean(p.tracedAt),
    write: Boolean(p.writtenAt),
    practise: Boolean(p.practisedAt),
    print: Boolean(p.printedAt),
    quiz: Boolean(p.quizPassedAt),
  }
}
