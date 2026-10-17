/**
 * The order questions are shown in during a lesson or review session. Pure,
 * so it can be unit tested; `useLearnSession` drives it.
 *
 * A card the server flags `requeue` (it is in a learning step) is shown
 * again once the current pass is over, not right away, so a few other cards
 * sit between the two showings.
 */
import type { LearnQuestion } from '@/types/learn'

/** How many extra showings a card can get in one session, so a card stuck in learning steps cannot loop forever. */
export const MAX_REQUEUES_PER_CARD = 2

export interface SessionEntry {
  /** Unique per showing: the card id plus the showing number. */
  key: string
  question: LearnQuestion
  /** 0 for the first showing, 1 for the first requeue, … */
  round: number
}

/** Server result of one shown entry, as far as the plan cares. */
export interface AnsweredEntry {
  entryKey: string
  requeue: boolean
}

function entryKey(question: LearnQuestion, round: number): string {
  return `${question.card_id}#${round}`
}

export function initialEntries(questions: readonly LearnQuestion[]): SessionEntry[] {
  // A card normally comes once; if the server sends it twice, the keys must still differ.
  const seen = new Map<string, number>()
  return questions.map((question) => {
    const round = seen.get(question.card_id) ?? 0
    seen.set(question.card_id, round + 1)
    return { key: entryKey(question, round), question, round }
  })
}

/**
 * Entries to append after a pass: one more showing of every answered entry
 * the server flagged `requeue`, unless that entry was requeued already or its
 * card has used up its extra showings. Keeps the answer order.
 */
export function planRequeue(
  entries: readonly SessionEntry[],
  answered: readonly AnsweredEntry[],
  alreadyRequeued: ReadonlySet<string>,
  maxPerCard: number = MAX_REQUEUES_PER_CARD,
): SessionEntry[] {
  const byKey = new Map(entries.map((e) => [e.key, e]))
  const rounds = new Map<string, number>()
  for (const e of entries) rounds.set(e.question.card_id, Math.max(rounds.get(e.question.card_id) ?? 0, e.round))
  const out: SessionEntry[] = []
  for (const a of answered) {
    const entry = byKey.get(a.entryKey)
    if (!a.requeue || !entry || alreadyRequeued.has(a.entryKey)) continue
    const cardId = entry.question.card_id
    const last = rounds.get(cardId) ?? 0
    if (last >= maxPerCard) continue
    rounds.set(cardId, last + 1)
    out.push({ key: entryKey(entry.question, last + 1), question: entry.question, round: last + 1 })
  }
  return out
}
