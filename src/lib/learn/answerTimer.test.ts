import { describe, expect, it } from 'vitest'
import { AnswerTimer, newClientEventId, type AnswerClock } from '@/lib/learn/answerTimer'

class FakeClock implements AnswerClock {
  mono = 1_000
  wall = Date.UTC(2026, 9, 17, 12, 0, 0)
  now(): number {
    return this.mono
  }
  wallNow(): number {
    return this.wall
  }
  advance(ms: number): void {
    this.mono += ms
    this.wall += ms
  }
}

const DETAILS = { card_id: 'card-1', question_type: 'kana_mcq_romaji' as const, chosen_option: 'ka' }

function setup() {
  const clock = new FakeClock()
  const timer = new AnswerTimer(clock)
  return { clock, timer }
}

describe('AnswerTimer', () => {
  it('reports duration, shown_at and the first input time', () => {
    const { clock, timer } = setup()
    clock.advance(400)
    timer.markInput()
    clock.advance(300)
    timer.markInput()
    clock.advance(100)
    const a = timer.build(DETAILS)
    expect(a.duration_ms).toBe(800)
    expect(a.first_input_ms).toBe(400)
    expect(a.shown_at).toBe('2026-10-17T12:00:00.000Z')
    expect(a.card_id).toBe('card-1')
    expect(a.chosen_option).toBe('ka')
  })

  it('reports no first input when the learner never typed or tapped', () => {
    const { timer } = setup()
    expect(timer.build(DETAILS).first_input_ms).toBeNull()
  })

  it('counts hidden-tab time as idle, including a gap still open at build time', () => {
    const { clock, timer } = setup()
    clock.advance(100)
    timer.setHidden(true)
    clock.advance(2_000)
    timer.setHidden(false)
    clock.advance(100)
    timer.setHidden(true)
    clock.advance(500)
    expect(timer.build(DETAILS).idle_ms).toBe(2_500)
  })

  it('ignores a repeated hidden or visible signal', () => {
    const { clock, timer } = setup()
    timer.setHidden(true)
    clock.advance(1_000)
    timer.setHidden(true)
    clock.advance(1_000)
    timer.setHidden(false)
    timer.setHidden(false)
    expect(timer.build(DETAILS).idle_ms).toBe(2_000)
  })

  it('times audio playback and counts every play after the first as a replay', () => {
    const { clock, timer } = setup()
    timer.audioStart()
    clock.advance(700)
    timer.audioStop()
    clock.advance(1_000)
    timer.audioStart()
    clock.advance(600)
    timer.audioStop()
    const a = timer.build(DETAILS)
    expect(a.audio_ms).toBe(1_300)
    expect(a.audio_replays).toBe(1)
  })

  it('leaves audio_ms out when no sound was played', () => {
    const { timer } = setup()
    const a = timer.build(DETAILS)
    expect(a).not.toHaveProperty('audio_ms')
    expect(a.audio_replays).toBe(0)
  })

  it('ignores an audio stop without a start', () => {
    const { clock, timer } = setup()
    timer.audioStop()
    clock.advance(500)
    expect(timer.build(DETAILS)).not.toHaveProperty('audio_ms')
  })

  it('reports attempts (at least one), hints and a reveal', () => {
    const { timer } = setup()
    expect(timer.build(DETAILS).attempts).toBe(1)
    timer.attempt()
    timer.attempt()
    timer.hint()
    timer.reveal()
    const a = timer.build(DETAILS)
    expect(a.attempts).toBe(2)
    expect(a.hints_used).toBe(1)
    expect(a.answer_revealed).toBe(true)
  })

  it('keeps the same client_event_id for the same shown question', () => {
    const { clock, timer } = setup()
    const first = timer.build(DETAILS).client_event_id
    clock.advance(100)
    expect(timer.build(DETAILS).client_event_id).toBe(first)
  })

  it('starts fresh, with a new client_event_id, when the next question is shown', () => {
    const { clock, timer } = setup()
    timer.markInput()
    timer.attempt()
    timer.audioStart()
    const first = timer.build(DETAILS)
    clock.advance(1_000)
    timer.start(false)
    clock.advance(200)
    const second = timer.build(DETAILS)
    expect(second.client_event_id).not.toBe(first.client_event_id)
    expect(second.duration_ms).toBe(200)
    expect(second.first_input_ms).toBeNull()
    expect(second.attempts).toBe(1)
    expect(second).not.toHaveProperty('audio_ms')
  })

  it('counts time from the start as idle when the question is shown in a hidden tab', () => {
    const { clock, timer } = setup()
    timer.start(true)
    clock.advance(900)
    expect(timer.build(DETAILS).idle_ms).toBe(900)
  })
})

describe('newClientEventId', () => {
  it('returns distinct RFC 4122 v4 ids', () => {
    const a = newClientEventId()
    const b = newClientEventId()
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(a).not.toBe(b)
  })
})
