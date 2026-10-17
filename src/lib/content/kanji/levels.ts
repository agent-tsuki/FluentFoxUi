/**
 * The kanji course's levels: ids, labels, status and paths. No course data,
 * so the router (App.tsx) can import it without pulling kanji content into
 * the initial bundle.
 *
 * A level moves from 'coming-soon' to 'available' when its data exists
 * (bundled, or served by the API). Only this list changes; routes, the level
 * switcher and Browse filters all read it.
 */
import type { KanjiLevelId, KanjiLevelStatus } from '@/types/kanji'

export interface KanjiLevelMeta {
  id: KanjiLevelId
  /** "N5" */
  label: string
  /** "N5 Kanji" (the course h1). */
  title: string
  status: KanjiLevelStatus
}

/** Every JLPT level, easiest first. */
export const KANJI_LEVEL_IDS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const satisfies readonly KanjiLevelId[]

export const KANJI_LEVELS: readonly KanjiLevelMeta[] = [
  { id: 'n5', label: 'N5', title: 'N5 Kanji', status: 'available' },
  { id: 'n4', label: 'N4', title: 'N4 Kanji', status: 'available' },
  { id: 'n3', label: 'N3', title: 'N3 Kanji', status: 'coming-soon' },
  { id: 'n2', label: 'N2', title: 'N2 Kanji', status: 'coming-soon' },
  { id: 'n1', label: 'N1', title: 'N1 Kanji', status: 'coming-soon' },
]

export const DEFAULT_KANJI_LEVEL: KanjiLevelId = 'n5'

/** Root of every kanji route. */
export const KANJI_BASE = '/kanji'

/** localStorage key of the last level visited (the `/kanji` redirect may read it). */
export const KANJI_LAST_LEVEL_KEY = 'ff-kanji-last-level'

const BY_ID = new Map(KANJI_LEVELS.map((l) => [l.id, l]))

export function isKanjiLevelId(value: string | undefined): value is KanjiLevelId {
  return value !== undefined && BY_ID.has(value as KanjiLevelId)
}

export function kanjiLevelMeta(id: KanjiLevelId): KanjiLevelMeta {
  const meta = BY_ID.get(id)
  if (!meta) throw new Error(`Unknown kanji level: ${id}`)
  return meta
}

export function isKanjiLevelAvailable(id: KanjiLevelId): boolean {
  return kanjiLevelMeta(id).status === 'available'
}

/** Levels with course data, easiest first. */
export function availableKanjiLevels(): KanjiLevelId[] {
  return KANJI_LEVELS.filter((l) => l.status === 'available').map((l) => l.id)
}

// ─── Paths ───────────────────────────────────────────────────────────────────

/** `/kanji/n5` */
export function kanjiLevelPath(level: KanjiLevelId): string {
  return `${KANJI_BASE}/${level}`
}

/** Level sub-pages inside the course layout. */
export type KanjiLevelPageId = 'course' | 'reviews' | 'browse' | 'tests' | 'downloads'

/** `/kanji/n5`, `/kanji/n5/reviews`, … */
export function kanjiLevelPagePath(level: KanjiLevelId, page: KanjiLevelPageId): string {
  const base = kanjiLevelPath(level)
  return page === 'course' ? base : `${base}/${page}`
}

export function kanjiUnitPath(level: KanjiLevelId, unitId: string): string {
  return `${kanjiLevelPath(level)}/unit/${unitId}`
}

export function kanjiUnitQuizPath(level: KanjiLevelId, unitId: string): string {
  return `${kanjiLevelPath(level)}/quiz/${unitId}`
}

/** Placement (`'all'`) or group test-out (a group id). */
export function kanjiSkipPath(level: KanjiLevelId, scope: string): string {
  return `${kanjiLevelPath(level)}/skip/${scope}`
}

export function kanjiLevelTestPath(level: KanjiLevelId): string {
  return `${kanjiLevelPath(level)}/test`
}

/** `/kanji/n5/practice/review?unit=u04` */
export function kanjiPracticePath(level: KanjiLevelId, mode: string, query?: Record<string, string>): string {
  return withQuery(`${kanjiLevelPath(level)}/practice/${mode}`, query)
}

/** The full-screen review runner (one queue across levels; `?level=` is the back link / filter). */
export function kanjiReviewSessionPath(level?: KanjiLevelId): string {
  return withQuery(`${KANJI_BASE}/reviews/session`, level ? { level } : undefined)
}

/**
 * The kanji page: `/kanji/日`. `from` adds prev/next context: a level id
 * (`?in=n5`) or `'browse'`.
 */
export function kanjiCharPath(char: string, from?: KanjiLevelId | 'browse'): string {
  return withQuery(`${KANJI_BASE}/${encodeURIComponent(char)}`, from ? { in: from } : undefined)
}

function withQuery(path: string, query?: Record<string, string>): string {
  if (!query) return path
  const qs = new URLSearchParams(query).toString()
  return qs ? `${path}?${qs}` : path
}

// ─── Char validation ─────────────────────────────────────────────────────────

const SINGLE_HAN = /^\p{Script=Han}$/u

/**
 * True for exactly one Han (kanji) code point. The `/kanji/:char` route uses
 * it: level ids, 'reviews' and 'browse' are ASCII, so they can never match.
 */
export function isKanjiChar(value: string | undefined): value is string {
  return value !== undefined && SINGLE_HAN.test(value)
}
