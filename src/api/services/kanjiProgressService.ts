import type { KanaProgressState, KanaReviewCard } from '@/types/kanaProgress'
import type { KanjiCardFace, KanjiLevelId, KanjiUnit } from '@/types/kanji'
import { createKanaProgressStore, type KanaProgressStore } from '@/api/services/kanaProgressService'
import { getPathStore, type LearningPathStore, type UnitProgress } from '@/api/services/learningPathService'
import { kanjiCardId } from '@/lib/content/kanji/kanjiText'
import type { KanjiUnitStep } from '@/lib/content/kanji/courseTypes'

// Kanji progress lives in this browser for now, like kana progress, and reuses
// the same stores:
// - one review store for every level (`createKanaProgressStore`): items are
//   review cards `日:m` / `日:r` (FSRS) and kanji chars `日` (seen / written);
// - one guided-path store per level (`getPathStore`): unit steps, quizzes,
//   test-outs and the level test.
// Syncing to the account later means changing this file only.

const PROGRESS_KEY = 'ff-kanji-progress-v1'
const DAILY_KEY = 'ff-kanji-daily-v1'

/** Soft limit of new kanji brought into reviews per local day. */
export const NEW_KANJI_PER_DAY = 10
/** Review cards per session at most (the rest wait for the next session). */
export const REVIEW_SESSION_SIZE = 40

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

/** ts-fsrs State.Review. */
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

/** Has at least one review card. */
export function isKanjiStarted(state: KanaProgressState, char: string): boolean {
  return Boolean(state.items[kanjiCardId(char, 'meaning')]?.card || state.items[kanjiCardId(char, 'reading')]?.card)
}

// ─── Daily new allowance ─────────────────────────────────────────────────────

interface DailyNew {
  date: string
  chars: string[]
}

function localDate(now: Date): string {
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}

function readDaily(now: Date): DailyNew {
  const today = localDate(now)
  try {
    const parsed = JSON.parse(localStorage.getItem(DAILY_KEY) ?? 'null') as DailyNew | null
    if (parsed?.date === today && Array.isArray(parsed.chars)) return parsed
  } catch {
    /* storage blocked or corrupt: start the day fresh */
  }
  return { date: today, chars: [] }
}

/** Kanji brought into reviews today (their first review card was created today). */
export function newKanjiToday(now: Date = new Date()): string[] {
  return readDaily(now).chars
}

function noteNewKanji(chars: readonly string[], now: Date) {
  if (chars.length === 0) return
  const daily = readDaily(now)
  const next = { date: daily.date, chars: [...new Set([...daily.chars, ...chars])] }
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify(next))
  } catch {
    /* blocked: the allowance just resets */
  }
}

// ─── Recording ───────────────────────────────────────────────────────────────

/**
 * Grades review cards (`{ char, face }`) and counts kanji whose first card is
 * created now towards today's new allowance. Use for reviews, unit quizzes
 * and tests alike, so every answer feeds the schedule.
 */
export async function recordKanjiReviews(
  results: readonly { char: string; face: KanjiCardFace; correct: boolean }[],
  now: Date = new Date(),
): Promise<void> {
  const store = getKanjiProgress()
  const before = store.getState()
  const fresh = [...new Set(results.map((r) => r.char))].filter((c) => !isKanjiStarted(before, c))
  const right = results.filter((r) => r.correct).map((r) => kanjiCardId(r.char, r.face))
  const wrong = results.filter((r) => !r.correct).map((r) => kanjiCardId(r.char, r.face))
  await store.recordReviews(right, 'good', now)
  await store.recordReviews(wrong, 'again', now)
  noteNewKanji(fresh, now)
}

// ─── Queue & forecast ────────────────────────────────────────────────────────

export interface ReviewCardRef {
  char: string
  face: KanjiCardFace
}

export interface ReviewQueue {
  /** Cards due now, oldest first. */
  due: ReviewCardRef[]
  /** Seen-but-unreviewed kanji allowed in today (within the daily allowance), course order. */
  fresh: string[]
  /** Seen-but-unreviewed kanji held back by the daily allowance. */
  waiting: number
}

/**
 * What a review session would hold now. `orderedChars` are the kanji in
 * scope (one level, or every available level), in course order.
 */
export function buildReviewQueue(state: KanaProgressState, orderedChars: readonly string[], now: Date = new Date()): ReviewQueue {
  const nowMs = now.getTime()
  const due: (ReviewCardRef & { at: number })[] = []
  const unstarted: string[] = []
  for (const char of orderedChars) {
    let started = false
    for (const face of ['meaning', 'reading'] as const) {
      const card = state.items[kanjiCardId(char, face)]?.card
      if (!card) continue
      started = true
      const at = new Date(card.due).getTime()
      if (at <= nowMs) due.push({ char, face, at })
    }
    if (!started && isKanjiSeen(state, char)) unstarted.push(char)
  }
  due.sort((a, b) => a.at - b.at)
  const allowance = Math.max(0, NEW_KANJI_PER_DAY - newKanjiToday(now).length)
  return {
    due: due.map(({ char, face }) => ({ char, face })),
    fresh: unstarted.slice(0, allowance),
    waiting: Math.max(0, unstarted.length - allowance),
  }
}

/** Cards due on each of the next `days` local days (day 0 includes anything overdue). */
export function reviewForecast(state: KanaProgressState, orderedChars: readonly string[], days = 7, now: Date = new Date()): number[] {
  const counts = new Array<number>(days).fill(0)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const DAY = 86_400_000
  for (const char of orderedChars) {
    for (const face of ['meaning', 'reading'] as const) {
      const card = state.items[kanjiCardId(char, face)]?.card
      if (!card) continue
      const day = Math.max(0, Math.floor((new Date(card.due).getTime() - startOfToday) / DAY))
      if (day < days) counts[day] += 1
    }
  }
  return counts
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

// ─── Personal notes ──────────────────────────────────────────────────────────

const NOTES_KEY = 'ff-kanji-notes-v1'

function readNotes(): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}') as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

/** The learner's own note for a kanji (empty string when none). */
export function getKanjiNote(char: string): string {
  return readNotes()[char] ?? ''
}

/** Saves (or, when blank, removes) the learner's note for a kanji. Returns false if storage is blocked. */
export function setKanjiNote(char: string, text: string): boolean {
  const notes = readNotes()
  if (text.trim()) notes[char] = text
  else delete notes[char]
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
    return true
  } catch {
    return false
  }
}
