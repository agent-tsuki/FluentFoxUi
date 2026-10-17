import type { KanaProgressState, KanaReviewCard } from '@/types/kanaProgress'
import type { KanjiCardFace, KanjiLevelId, KanjiUnit } from '@/types/kanji'
import { createKanaProgressStore, type KanaProgressStore } from '@/api/services/kanaProgressService'
import { getPathStore, type LearningPathStore, type UnitProgress } from '@/api/services/learningPathService'
import { kanjiCardId } from '@/lib/content/kanji/kanjiText'
import type { KanjiUnitStep } from '@/lib/content/kanji/courseTypes'

// Reviews and lessons run on the learn API (/review, /learn/lesson). What is
// left here is the browser record of the flows the API does not serve yet
// (unit quizzes, tests, practice, path state), reusing the kana stores:
// - one record for every level (`createKanaProgressStore`): items are cards
//   `日:m` / `日:r` (answered, not scheduled) and kanji chars `日` (seen / written);
// - one guided-path store per level (`getPathStore`): unit steps, quizzes,
//   test-outs and the level test.

const PROGRESS_KEY = 'ff-kanji-progress-v1'

let progressStore: KanaProgressStore | null = null

/** The kanji review store (every level), created on first use. */
export function getKanjiProgress(): KanaProgressStore {
  progressStore ??= createKanaProgressStore(PROGRESS_KEY)
  return progressStore
}

/** One level's guided-path store (units, quizzes, test-outs, level test). */
export function getKanjiPath(level: KanjiLevelId): LearningPathStore {
  return getPathStore(`ff-kanji-${level}-path-v1`)
}

// ─── Stages ──────────────────────────────────────────────────────────────────

/**
 * The five friendly SRS stages a learner sees. Derived from FSRS stability
 * (days the memory is expected to last); "mastered" uses the same 7-day bar
 * as kana mastery.
 */
export type KanjiStage = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered'

export const KANJI_STAGES: readonly KanjiStage[] = ['new', 'learning', 'familiar', 'strong', 'mastered']

export const KANJI_STAGE_LABEL: Record<KanjiStage, string> = {
  new: 'New',
  learning: 'Learning',
  familiar: 'Familiar',
  strong: 'Strong',
  mastered: 'Mastered',
}

/** FSRS State.Review. */
const STATE_REVIEW = 2

export function cardStage(card: KanaReviewCard | undefined): KanjiStage {
  if (!card || card.reps === 0) return 'new'
  if (card.state !== STATE_REVIEW || card.stability < 1) return 'learning'
  if (card.stability < 3) return 'familiar'
  if (card.stability < 7) return 'strong'
  return 'mastered'
}

/** A kanji's stage: the weaker of its meaning and reading cards. */
export function kanjiStage(state: KanaProgressState, char: string): KanjiStage {
  const m = KANJI_STAGES.indexOf(cardStage(state.items[kanjiCardId(char, 'meaning')]?.card))
  const r = KANJI_STAGES.indexOf(cardStage(state.items[kanjiCardId(char, 'reading')]?.card))
  return KANJI_STAGES[Math.min(m, r)]
}

/** Opened in a lesson (or on its kanji page). */
export function isKanjiSeen(state: KanaProgressState, char: string): boolean {
  return Boolean(state.items[char]?.seenAt)
}

// ─── Recording ───────────────────────────────────────────────────────────────

/** Records unit quiz and test answers (`{ char, face }`) in the browser record. */
export async function recordKanjiReviews(
  results: readonly { char: string; face: KanjiCardFace; correct: boolean }[],
  now: Date = new Date(),
): Promise<void> {
  const store = getKanjiProgress()
  const right = results.filter((r) => r.correct).map((r) => kanjiCardId(r.char, r.face))
  const wrong = results.filter((r) => !r.correct).map((r) => kanjiCardId(r.char, r.face))
  await store.recordReviews(right, 'good', now)
  await store.recordReviews(wrong, 'again', now)
}

// ─── Units ───────────────────────────────────────────────────────────────────

/** Which of a kanji unit's steps are done. Learn = every kanji opened. */
export function kanjiUnitSteps(
  unit: KanjiUnit,
  progress: UnitProgress | undefined,
  state: KanaProgressState,
): Record<KanjiUnitStep, boolean> {
  const p = progress ?? {}
  return {
    learn: unit.kanji.every((c) => isKanjiSeen(state, c)),
    write: Boolean(p.writtenAt),
    practise: Boolean(p.practisedAt),
    print: Boolean(p.printedAt),
    quiz: Boolean(p.quizPassedAt),
  }
}
