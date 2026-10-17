/**
 * Shared shapes for a kanji level course (N5, N4, …), mirroring the kana
 * engine's KanaScriptConfig (src/lib/content/kana/scripts.ts).
 *
 * Split of responsibilities:
 * - Units, groups and kanji are DATA: they arrive with the level index /
 *   detail (`kanjiService`), because N3–N1 will be served by the API.
 * - Everything here is static per-level SETTINGS (pass marks, steps, tests,
 *   storage keys) plus the bundled-data loaders for levels shipped with the app.
 */
import type { KanjiGroup, KanjiLevelDetail, KanjiLevelId, KanjiLevelIndex, KanjiLevelStatus, KanjiUnit } from '@/types/kanji'

export type { KanjiGroup, KanjiUnit }

/**
 * Steps of a kanji unit, in order: Learn → Write → Practise → Print → Quiz.
 * (Kana uses Watch instead of Write; the learning-path service's `UnitStep`
 * gains 'write' in Phase 1.)
 */
export type KanjiUnitStep = 'learn' | 'write' | 'practise' | 'print' | 'quiz'

export const KANJI_UNIT_STEPS: readonly KanjiUnitStep[] = ['learn', 'write', 'practise', 'print', 'quiz']

/** What a skip ("test out") test covers: a group id of the level, or the whole level. */
export type KanjiSkipScope = 'all' | (string & {})

/** Per-level browser preferences (progress keys live in the progress services). */
export interface KanjiLevelStorageKeys {
  /** Furigana toggle on vocab. */
  furigana: string
  speedBest: string
}

/** Lazy loaders for a level whose data ships with the app (cached after the first call). */
export interface KanjiBundledLoaders {
  loadIndex(): Promise<KanjiLevelIndex>
  loadDetail(): Promise<KanjiLevelDetail>
}

export interface KanjiLevelConfig {
  id: KanjiLevelId
  /** "N5" */
  label: string
  /** "N5 Kanji" */
  title: string
  status: KanjiLevelStatus
  /** "/kanji/n5" */
  basePath: string
  /** Steps every unit shows, in order. */
  steps: readonly KanjiUnitStep[]
  /** Kanji per Learn batch (3 at N5 → 3 + 3; 4 at N4 → 4 + 4). */
  batchSize: number
  /** Unit quiz pass mark, 0–1 (≥ 0.9 marks a unit done / tested out). */
  unitQuizPassMark: number
  /** Per-unit pass mark in a placement / group test-out, 0–1. */
  skipPassMark: number
  /** Kanji drawn per unit in the placement test (meaning + reading each). */
  skipSamplePerUnit: number
  levelTest: {
    questions: number
    minutes: number
    passMark: number
    /** Share of typed questions, 0–1 (the rest are MCQ). */
    typedShare: number
  }
  /** "FoxSensei · N5 Kanji" (never "JLPT certified"). */
  certificateTitle: string
  /** File-name slug for PDFs: foxsensei-<slug>-….pdf */
  pdfSlug: string
  storageKeys: KanjiLevelStorageKeys
  /**
   * Present for levels bundled with the app (N5, N4). Absent → the service
   * serves the level from the API (or reports it unavailable).
   */
  bundled?: KanjiBundledLoaders
}
