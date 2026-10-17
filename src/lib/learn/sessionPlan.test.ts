import { describe, expect, it } from 'vitest'
import { MAX_REQUEUES_PER_CARD, initialEntries, planRequeue } from '@/lib/learn/sessionPlan'
import type { LearnQuestion } from '@/types/learn'

function question(cardId: string): LearnQuestion {
  return {
    card_id: cardId,
    item_type: 'kana',
    item_id: `item-${cardId}`,
    facet: 'recognition',
    question_type: 'kana_mcq_romaji',
    prompt: 'か',
    options: ['ka', 'ki', 'ku', 'ke'],
    correct_answer: 'ka',
  }
}

describe('initialEntries', () => {
  it('gives every shown question a unique key, even for a repeated card', () => {
    const entries = initialEntries([question('a'), question('b'), question('a')])
    expect(entries.map((e) => e.key)).toEqual(['a#0', 'b#0', 'a#1'])
    expect(entries.map((e) => e.round)).toEqual([0, 0, 1])
  })
})

describe('planRequeue', () => {
  const entries = initialEntries([question('a'), question('b'), question('c')])

  it('appends one more showing of each card flagged requeue, in answer order', () => {
    const more = planRequeue(entries, [
      { entryKey: 'c#0', requeue: true },
      { entryKey: 'a#0', requeue: false },
      { entryKey: 'b#0', requeue: true },
    ], new Set())
    expect(more.map((e) => e.key)).toEqual(['c#1', 'b#1'])
    expect(more[0].question.card_id).toBe('c')
  })

  it('does not requeue an entry twice', () => {
    const more = planRequeue(entries, [{ entryKey: 'a#0', requeue: true }], new Set(['a#0']))
    expect(more).toEqual([])
  })

  it('ignores answers to entries it does not know', () => {
    expect(planRequeue(entries, [{ entryKey: 'zz#0', requeue: true }], new Set())).toEqual([])
  })

  it('stops after the maximum number of extra showings per card', () => {
    let list = entries
    const done = new Set<string>()
    for (let pass = 0; pass < MAX_REQUEUES_PER_CARD + 2; pass++) {
      const shown = list.filter((e) => e.question.card_id === 'a')
      const last = shown[shown.length - 1]
      if (!last) break
      const more = planRequeue(list, [{ entryKey: last.key, requeue: true }], done)
      done.add(last.key)
      list = [...list, ...more]
    }
    expect(list.filter((e) => e.question.card_id === 'a')).toHaveLength(1 + MAX_REQUEUES_PER_CARD)
  })
})
