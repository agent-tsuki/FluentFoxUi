import type { KanaPair } from '@/hooks/useKanaPairs'
import { shuffle } from '@/components/practice/listen/pickOptions'
import { prioritise } from '@/lib/learn/practiceSession'

export const MATCH_ROUNDS = 3
/** Pairs per round: six rows of two tiles fit a phone screen without scrolling. */
export const PAIRS_PER_ROUND = 6

export interface MatchRound {
  /** The round's pairs (≤ PAIRS_PER_ROUND, distinct ids). */
  pairs: KanaPair[]
  /** Column orders, shuffled independently. */
  left: KanaPair[]
  right: KanaPair[]
}

function makeRound(pairs: KanaPair[]): MatchRound {
  return { pairs, left: shuffle(pairs), right: shuffle(pairs) }
}

/**
 * Three rounds of six pairs. `focusIds` (a unit's kana, or every kana) are
 * asked with the learn API's picks (`priorityIds`, weakest first) first; a unit too
 * small to fill a round is topped up with other pairs of the same type
 * (basic / dakuten / combination), and a unit with fewer than 18 kana
 * cycles through them again in later rounds.
 */
export function buildMatchRounds(
  priorityIds: readonly string[],
  pairs: readonly KanaPair[],
  focusIds: readonly string[],
): MatchRound[] {
  const byId = new Map(pairs.map((p) => [p.id, p]))
  const focus = focusIds.filter((id) => byId.has(id))
  if (focus.length === 0) return []

  const wanted = MATCH_ROUNDS * PAIRS_PER_ROUND
  const due = prioritise(priorityIds, focus, wanted)
  const rest = shuffle(focus.filter((id) => !due.includes(id)))
  // Due first, but shuffled within the session so rows don't come in chart order.
  const queue = shuffle([...due, ...rest].slice(0, wanted))

  const focusSet = new Set(focus)
  const focusTypes = new Set(focus.flatMap((id) => byId.get(id)?.hiragana.type ?? []))
  const sameType = pairs.filter((p) => !focusSet.has(p.id) && focusTypes.has(p.hiragana.type))
  const fillers = sameType.length > 0 ? sameType : pairs.filter((p) => !focusSet.has(p.id))

  // k consecutive queue entries (wrapping) are always distinct, since k ≤ queue length.
  const k = Math.min(PAIRS_PER_ROUND, queue.length)
  const rounds: MatchRound[] = []
  for (let r = 0; r < MATCH_ROUNDS; r++) {
    const round = Array.from({ length: k }, (_, i) => byId.get(queue[(r * k + i) % queue.length] as string) as KanaPair)
    for (const filler of shuffle(fillers)) {
      if (round.length >= PAIRS_PER_ROUND) break
      round.push(filler)
    }
    rounds.push(makeRound(round))
  }
  return rounds
}
