import { describe, expect, it } from 'vitest'
import { buildResultView, formatNextDue, formatSeconds } from '@/lib/learn/sessionResult'
import type { AnswerResultItem, GradeLabel, SessionCardResult, SessionResult } from '@/types/learn'

function card(id: string, label: GradeLabel): SessionCardResult {
  return {
    card_id: id,
    item_type: 'kana',
    item_id: `item-${id}`,
    facet: 'recognition',
    char: id,
    label,
    reason: label === 'missed' ? 'wrong' : 'normal',
    next_due: '2026-10-18T12:00:00.000Z',
  }
}

function result(cards: SessionCardResult[], counts?: SessionResult['counts']): SessionResult {
  return {
    session: { id: 's1', kind: 'review', track: null, scope: null, started_at: '2026-10-17T12:00:00Z', completed_at: '2026-10-17T12:05:00Z' },
    answer_count: cards.length,
    correct_count: cards.filter((c) => c.label !== 'missed').length,
    active_ms: 10_000,
    counts: counts as SessionResult['counts'],
    cards,
  }
}

function answer(id: string, activeMs: number, usualMs: number): AnswerResultItem {
  return {
    client_event_id: id,
    correct: true,
    correct_answer: 'a',
    label: 'good',
    reason: 'normal',
    active_ms: activeMs,
    usual_ms: usualMs,
    next_due: null,
    requeue: false,
  }
}

describe('buildResultView', () => {
  it('groups cards by label in session order', () => {
    const view = buildResultView(result([card('あ', 'good'), card('い', 'missed'), card('う', 'good'), card('え', 'strong')]), new Map())
    expect(view.byLabel.good.map((r) => r.char)).toEqual(['あ', 'う'])
    expect(view.byLabel.missed.map((r) => r.char)).toEqual(['い'])
    expect(view.byLabel.strong.map((r) => r.char)).toEqual(['え'])
    expect(view.byLabel.shaky).toEqual([])
    expect(view.rows.map((r) => r.char)).toEqual(['あ', 'い', 'う', 'え'])
  })

  it('uses the server counts when present', () => {
    const counts = { strong: 1, good: 5, shaky: 2, missed: 0 }
    expect(buildResultView(result([card('あ', 'good')], counts), new Map()).counts).toEqual(counts)
  })

  it('counts the rows when the server sends no counts', () => {
    const view = buildResultView(result([card('あ', 'good'), card('い', 'missed'), card('う', 'good')]), new Map())
    expect(view.counts).toEqual({ strong: 0, good: 2, shaky: 0, missed: 1 })
  })

  it('takes time and usual time from the first answer of each card', () => {
    const answers = new Map([['あ', [answer('e1', 1_200, 2_000), answer('e2', 900, 2_000)]]])
    const [row, other] = buildResultView(result([card('あ', 'good'), card('い', 'good')]), answers).rows
    expect(row).toMatchObject({ activeMs: 1_200, usualMs: 2_000 })
    expect(other).toMatchObject({ activeMs: null, usualMs: null })
  })
})

describe('formatNextDue', () => {
  const now = new Date('2026-10-17T12:00:00.000Z')
  const inMs = (ms: number) => new Date(now.getTime() + ms).toISOString()

  it.each([
    ['no date', null, 'not scheduled'],
    ['an invalid date', 'soon', 'not scheduled'],
    ['an overdue date', inMs(-60_000), 'now'],
    ['under a minute', inMs(30_000), 'now'],
    ['ten minutes', inMs(10 * 60_000), 'in 10 min'],
    ['three hours', inMs(3 * 3_600_000), 'in 3 h'],
    ['one day', inMs(24 * 3_600_000), 'tomorrow'],
    ['four days', inMs(4 * 24 * 3_600_000), 'in 4 days'],
  ])('describes %s', (_name, due, text) => {
    expect(formatNextDue(due, now)).toBe(text)
  })
})

describe('formatSeconds', () => {
  it('shows tenths under ten seconds and whole seconds above', () => {
    expect(formatSeconds(1_430)).toBe('1.4 s')
    expect(formatSeconds(12_400)).toBe('12 s')
  })
})

describe('buildResultView times', () => {
  it('prefers the times the server puts on the card result', () => {
    const withTimes = { ...card('あ', 'good'), active_ms: 800, usual_ms: 1_900 }
    const answers = new Map([['あ', [answer('e1', 1_200, 2_000)]]])
    const [row] = buildResultView(result([withTimes]), answers).rows
    expect(row).toMatchObject({ activeMs: 800, usualMs: 1_900 })
  })
})
