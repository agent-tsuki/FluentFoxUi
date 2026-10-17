import type { KanjiUnit } from '@/types/kanji'
import type { UnitProgress } from '@/types/learningPath'
import type { KanjiUnitStep } from '@/lib/content/kanji/courseTypes'

// Reviews, lessons, practice and tests run on the learn API; a level's path
// (unit steps, quizzes, test-outs, level test) is in learningPathService.
export { getKanjiPath } from '@/api/services/learningPathService'

// ─── Stages ──────────────────────────────────────────────────────────────────

/** The five friendly SRS stages a learner sees (plan §7.4 levels). */
export type KanjiStage = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered'

export const KANJI_STAGES: readonly KanjiStage[] = ['new', 'learning', 'familiar', 'strong', 'mastered']

export const KANJI_STAGE_LABEL: Record<KanjiStage, string> = {
  new: 'New',
  learning: 'Learning',
  familiar: 'Familiar',
  strong: 'Strong',
  mastered: 'Mastered',
}

/**
 * A kanji's stage. Stages need card stability from the progress API
 * (phase 6), which is not served yet, so every kanji shows as new until then.
 */
export function kanjiStage(_char: string): KanjiStage {
  return 'new'
}

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
