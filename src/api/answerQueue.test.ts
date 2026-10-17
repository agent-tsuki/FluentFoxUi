import { describe, expect, it } from 'vitest'
import { ANSWER_QUEUE_STORAGE_KEY, AnswerQueue, type AnswerQueueEvent, type AnswerTransport, type QueueStorage } from '@/api/answerQueue'
import { ApiError } from '@/api/errors'
import type { AnswerRequestItem, AnswerResultItem } from '@/types/learn'

const SESSION = 'session-1'

function answer(id: string): AnswerRequestItem {
  return {
    client_event_id: id,
    card_id: `card-${id}`,
    question_type: 'kana_mcq_romaji',
    shown_at: '2026-10-17T12:00:00.000Z',
    duration_ms: 1_500,
    idle_ms: 0,
    first_input_ms: 900,
    chosen_option: 'ka',
    attempts: 1,
    hints_used: 0,
    answer_revealed: false,
    audio_replays: 0,
  }
}

function resultFor(a: AnswerRequestItem): AnswerResultItem {
  return {
    client_event_id: a.client_event_id,
    correct: true,
    correct_answer: 'ka',
    label: 'good',
    reason: 'normal',
    active_ms: a.duration_ms,
    usual_ms: 2_000,
    next_due: null,
    requeue: false,
  }
}

class MemoryStorage implements QueueStorage {
  readonly data = new Map<string, string>()
  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
  removeItem(key: string): void {
    this.data.delete(key)
  }
}

/** Records every request; `fail` makes the next submits reject with that error. */
class FakeTransport implements AnswerTransport {
  readonly calls: AnswerRequestItem[][] = []
  readonly keepaliveCalls: AnswerRequestItem[][] = []
  fail: unknown[] = []
  keepaliveAccepts = true

  async submit(_sessionId: string, answers: AnswerRequestItem[]): Promise<AnswerResultItem[]> {
    this.calls.push(answers)
    const error = this.fail.shift()
    if (error) throw error
    return answers.map(resultFor)
  }

  async submitKeepalive(_sessionId: string, answers: AnswerRequestItem[]): Promise<AnswerResultItem[] | null> {
    this.keepaliveCalls.push(answers)
    return this.keepaliveAccepts ? answers.map(resultFor) : null
  }
}

const ids = (batch: AnswerRequestItem[]) => batch.map((a) => a.client_event_id)
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

function setup(flushEvery = 5) {
  const transport = new FakeTransport()
  const storage = new MemoryStorage()
  const queue = new AnswerQueue(transport, storage, flushEvery)
  return { transport, storage, queue }
}

describe('AnswerQueue', () => {
  it('waits until enough answers are queued, then sends them as one batch', async () => {
    const { transport, queue } = setup(3)
    queue.enqueue(SESSION, answer('a'))
    queue.enqueue(SESSION, answer('b'))
    await tick()
    expect(transport.calls).toHaveLength(0)
    queue.enqueue(SESSION, answer('c'))
    await tick()
    expect(transport.calls.map(ids)).toEqual([['a', 'b', 'c']])
    expect(queue.pendingCount(SESSION)).toBe(0)
  })

  it('sends everything left on an explicit flush and returns the results', async () => {
    const { transport, queue } = setup()
    queue.enqueue(SESSION, answer('a'))
    const results = await queue.flush(SESSION)
    expect(transport.calls.map(ids)).toEqual([['a']])
    expect(results.map((r) => r.client_event_id)).toEqual(['a'])
    expect(queue.getResult(SESSION, 'a')?.label).toBe('good')
  })

  it('ignores an answer queued twice with the same id', async () => {
    const { transport, queue } = setup()
    queue.enqueue(SESSION, answer('a'))
    queue.enqueue(SESSION, answer('a'))
    await queue.flush(SESSION)
    queue.enqueue(SESSION, answer('a'))
    await queue.flush(SESSION)
    expect(transport.calls.map(ids)).toEqual([['a']])
  })

  it('keeps answers after a network error and resends them with the same ids', async () => {
    const { transport, queue } = setup()
    transport.fail = [new TypeError('Failed to fetch')]
    queue.enqueue(SESSION, answer('a'))
    queue.enqueue(SESSION, answer('b'))
    await expect(queue.flush(SESSION)).rejects.toThrow('Failed to fetch')
    expect(queue.pendingCount(SESSION)).toBe(2)
    await queue.flush(SESSION)
    expect(transport.calls.map(ids)).toEqual([
      ['a', 'b'],
      ['a', 'b'],
    ])
    expect(queue.pendingCount(SESSION)).toBe(0)
  })

  it.each([
    ['a server error', new ApiError(500, 'INTERNAL', 'boom', 'log-1')],
    ['an expired token', new ApiError(401, 'TOKEN_EXPIRED', 'expired', 'log-2')],
    ['an unverified email', new ApiError(403, 'EMAIL_NOT_VERIFIED', 'verify', 'log-3')],
    ['a rate limit', new ApiError(429, 'RATE_LIMITED', 'slow down', 'log-4')],
  ])('keeps answers for a retry after %s', async (_name, error) => {
    const { transport, queue } = setup()
    transport.fail = [error]
    queue.enqueue(SESSION, answer('a'))
    await expect(queue.flush(SESSION)).rejects.toBe(error)
    expect(queue.pendingCount(SESSION)).toBe(1)
  })

  it('drops answers the server refuses for good and reports them', async () => {
    const { transport, queue } = setup()
    const events: AnswerQueueEvent[] = []
    queue.subscribe((e) => events.push(e))
    const refused = new ApiError(409, 'SESSION_COMPLETED', 'session is completed', 'log-5')
    transport.fail = [refused]
    queue.enqueue(SESSION, answer('a'))
    await expect(queue.flush(SESSION)).rejects.toBe(refused)
    expect(queue.pendingCount(SESSION)).toBe(0)
    expect(events).toEqual([{ type: 'dropped', sessionId: SESSION, answers: [answer('a')], error: refused }])
  })

  it('persists unsent answers and resends them with the same ids after a reload', async () => {
    const { transport, storage, queue } = setup()
    transport.fail = [new TypeError('offline')]
    queue.enqueue(SESSION, answer('a'))
    await queue.flush(SESSION).catch(() => undefined)
    expect(storage.getItem(ANSWER_QUEUE_STORAGE_KEY)).toContain('"a"')

    const reloaded = new FakeTransport()
    const next = new AnswerQueue(reloaded, storage)
    const events: AnswerQueueEvent[] = []
    next.subscribe((e) => events.push(e))
    next.resendStored()
    await tick()
    expect(reloaded.calls.map(ids)).toEqual([['a']])
    expect(events[0]).toMatchObject({ type: 'results', sessionId: SESSION })
    expect(storage.getItem(ANSWER_QUEUE_STORAGE_KEY)).toBeNull()
  })

  it('ignores corrupt stored data', () => {
    const storage = new MemoryStorage()
    storage.setItem(ANSWER_QUEUE_STORAGE_KEY, '{not json')
    const queue = new AnswerQueue(new FakeTransport(), storage)
    expect(queue.pendingCount(SESSION)).toBe(0)
  })

  it('splits a large flush into requests of at most 50 answers', async () => {
    const { transport, queue } = setup(1_000)
    for (let i = 0; i < 120; i++) queue.enqueue(SESSION, answer(`a${i}`))
    await queue.flush(SESSION)
    expect(transport.calls.map((c) => c.length)).toEqual([50, 50, 20])
  })

  it('never sends the same answers twice when flushes overlap', async () => {
    const { transport, queue } = setup()
    queue.enqueue(SESSION, answer('a'))
    const first = queue.flush(SESSION)
    const second = queue.flush(SESSION)
    await Promise.all([first, second])
    expect(transport.calls.map(ids)).toEqual([['a']])
  })

  it('sends with keepalive when the tab is hidden and does not resend accepted answers', async () => {
    const { transport, queue } = setup()
    queue.enqueue(SESSION, answer('a'))
    queue.flushOnHide()
    await tick()
    expect(transport.keepaliveCalls.map(ids)).toEqual([['a']])
    await queue.flush(SESSION)
    expect(transport.calls).toHaveLength(0)
  })

  it('keeps answers a keepalive send did not get accepted, for the next flush', async () => {
    const { transport, queue } = setup()
    transport.keepaliveAccepts = false
    queue.enqueue(SESSION, answer('a'))
    queue.flushOnHide()
    await queue.flush(SESSION)
    expect(transport.calls.map(ids)).toEqual([['a']])
  })
})
