import type { KanaChar } from '@/types'
import type { KanaProgressStore } from '@/api/services/kanaProgressService'

/** Cards in one swipe-review session (before "Again" repeats). */
export const REVIEW_SESSION_SIZE = 15

/**
 * - `review`: today's goal + due/never-reviewed basic kana (the normal case;
 *   a dakuten/compound-only unit uses its own kana instead of basic ones)
 * - `new`: nothing due, learner chose to start kana they've never reviewed
 * - `early`: nothing due and nothing new left, so review the soonest-due kana
 */
export type ReviewSessionKind = 'review' | 'new' | 'early'

function pick(ids: string[], byId: Map<string, KanaChar>): KanaChar[] {
  return ids.flatMap((id) => {
    const char = byId.get(id)
    return char ? [char] : []
  })
}

/**
 * The kana a session draws from: the basic ones, or — for a unit made only of
 * dakuten/compound kana (?unit=dakuten, combo-*) — all of them.
 */
function eligible(kana: KanaChar[]): KanaChar[] {
  const basic = kana.filter((k) => k.type === 'basic')
  return basic.length > 0 ? basic : kana
}

/**
 * Today's unfinished goal kana first, then whatever FSRS says is due.
 * `kana` may be one unit's subset; `all` is the full chart, used only to
 * create today's goal the same way the chart does (so a unit session never
 * replaces the day's goal with its own kana). Goal ids outside `kana` are skipped.
 */
export function buildDueSession(progress: KanaProgressStore, kana: KanaChar[], all: KanaChar[] = kana): KanaChar[] {
  const byId = new Map(kana.map((k) => [k.id, k]))
  const ids = eligible(kana).map((k) => k.id)
  if (ids.length === 0) return []

  // Creates today's goal if the chart page hasn't yet (it's fixed for the day).
  const goal = progress.getDailyGoal(all.filter((k) => k.type === 'basic').map((k) => k.id))
  const goalIds = goal.ids.filter((id) => !goal.doneIds.includes(id) && byId.has(id))
  const due = progress
    .getDue(ids, REVIEW_SESSION_SIZE + goalIds.length)
    .filter((id) => !goalIds.includes(id))

  return pick([...goalIds, ...due].slice(0, REVIEW_SESSION_SIZE), byId)
}

/** Fallback when nothing is due: never-reviewed kana (any row), else the soonest due. */
export function buildFallbackSession(progress: KanaProgressStore, kana: KanaChar[]): { kind: ReviewSessionKind; cards: KanaChar[] } {
  const { items } = progress.getState()
  const fresh = kana.filter((k) => !items[k.id]?.card)
  if (fresh.length > 0) return { kind: 'new', cards: fresh.slice(0, REVIEW_SESSION_SIZE) }

  const dueAt = (k: KanaChar) => new Date(items[k.id]?.card?.due ?? 0).getTime()
  const soonest = eligible(kana)
    .sort((a, b) => dueAt(a) - dueAt(b))
    .slice(0, REVIEW_SESSION_SIZE)
  return { kind: 'early', cards: soonest }
}
