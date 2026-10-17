import type { KanaChar } from '@/types'
import type { KanaLookAlikeSet } from '@/lib/content/kana/lookAlikeSets'
import { shuffle } from '@/components/practice/listen/pickOptions'
import { prioritise } from '@/lib/learn/practiceSession'

export const LOOK_ALIKE_ROUNDS = 10

/**
 * 'read' shows the kana and asks for its romaji; 'find' shows the romaji (and
 * offers the sound) and asks for the kana. Both choose among the set only.
 */
export type LookAlikeDirection = 'read' | 'find'

export interface LookAlikeRound {
  target: KanaChar
  /** The set's kana in chart order; shown shuffled as answer options. */
  members: KanaChar[]
  options: KanaChar[]
  tip: string
  direction: LookAlikeDirection
}

interface ResolvedSet {
  members: KanaChar[]
  tip: string
}

/** Sets whose kana all exist in the chart (at least two of them). */
function resolveSets(sets: readonly KanaLookAlikeSet[], kanaById: ReadonlyMap<string, KanaChar>): ResolvedSet[] {
  return sets.flatMap((set) => {
    const members = set.ids.flatMap((id) => kanaById.get(id) ?? [])
    return members.length >= 2 ? [{ members, tip: set.tip }] : []
  })
}

/**
 * Ten rounds of look-alike targets: the kana the learn API picked first
 * (`priorityIds`, weakest first), topped up at random. `focusIds` (a unit's kana) limits which kana are asked
 * about; their siblings still appear as options. Few targets play twice.
 */
export function buildLookAlikeRounds(
  priorityIds: readonly string[],
  sets: readonly KanaLookAlikeSet[],
  all: readonly KanaChar[],
  focusIds?: readonly string[],
): LookAlikeRound[] {
  const kanaById = new Map(all.map((k) => [k.id, k]))
  const resolved = resolveSets(sets, kanaById)
  const focus = focusIds ? new Set(focusIds) : null

  // Every kana that belongs to a set, in chart order, limited to the focus.
  const memberIds = new Set(resolved.flatMap((s) => s.members.map((k) => k.id)))
  const targetIds = all.map((k) => k.id).filter((id) => memberIds.has(id) && (!focus || focus.has(id)))
  if (targetIds.length === 0) return []

  const due = prioritise(priorityIds, targetIds, LOOK_ALIKE_ROUNDS)
  const rest = shuffle(targetIds.filter((id) => !due.includes(id)))
  let order = shuffle([...due, ...rest].slice(0, LOOK_ALIKE_ROUNDS))
  while (order.length < LOOK_ALIKE_ROUNDS / 2) {
    const again = shuffle(targetIds)
    if (again.length > 1 && again[0] === order[order.length - 1]) again.push(again.shift() as string)
    order = [...order, ...again]
  }

  return order.slice(0, LOOK_ALIKE_ROUNDS).flatMap((id) => {
    const target = kanaById.get(id)
    const candidates = resolved.filter((s) => s.members.some((k) => k.id === id))
    const set = candidates[Math.floor(Math.random() * candidates.length)]
    if (!target || !set) return []
    return [
      {
        target,
        members: set.members,
        options: shuffle(set.members),
        tip: set.tip,
        direction: Math.random() < 0.5 ? 'read' : 'find',
      } satisfies LookAlikeRound,
    ]
  })
}
