import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/errors'
import type { LearnSummary } from '@/types/learn'
import { noReviewsNotice, reviewErrorNotice } from './reviewGate'

function summary(due_now: number, due_today = due_now): LearnSummary {
  return { due_now, due_today, new_left_today: 5, learned: 10, next_unit: null, goal: {} as LearnSummary['goal'] }
}

describe('noReviewsNotice', () => {
  it('lets the learner through when cards are due', () => {
    expect(noReviewsNotice(summary(3))).toBeNull()
  })
  it('suggests other courses when nothing is due', () => {
    const n = noReviewsNotice(summary(0))
    expect(n?.tone).toBe('info')
    expect(n?.title).toBe('No reviews due right now')
    expect(n?.actions.map((a) => a.label)).toEqual(['Kana', 'Kanji', 'Grammar'])
  })
  it('mentions reviews due later today and leads with the track lesson', () => {
    const n = noReviewsNotice(summary(0, 4), 'katakana')
    expect(n?.title).toBe('No Katakana reviews due right now')
    expect(n?.message).toContain('4 more come due later today')
    expect(n?.actions[0]).toEqual({ label: 'Learn Katakana', to: '/learn/lesson/katakana' })
  })
})

describe('reviewErrorNotice', () => {
  const err = (status: number) => new ApiError(status, 'X', 'x', '')
  it.each([
    [0, "Can't reach FoxSensei"],
    [400, "Review couldn't start (400)"],
    [403, "Review isn't available (403)"],
    [404, 'Review not available (404)'],
    [429, 'Too many requests (429)'],
    [500, 'Review is unavailable right now (500)'],
    [503, 'Review is unavailable right now (503)'],
  ])('words HTTP %i', (status, title) => {
    const n = reviewErrorNotice(err(status))
    expect(n.tone).toBe('error')
    expect(n.title).toBe(title)
    expect(n.actions.length).toBeGreaterThan(0)
  })
  it('handles an unknown error', () => {
    expect(reviewErrorNotice(new Error('boom')).title).toBe("Review couldn't start")
  })
})
