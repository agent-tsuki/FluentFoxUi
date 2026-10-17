import { describe, expect, it } from 'vitest'
import { StudyRecorder, type StudyRecorderDeps } from '@/lib/learn/studyRecorder'
import type { AnswerRequestItem, LearnQuestion, SessionResult, SessionStart } from '@/types/learn'

function question(char: string, facet: LearnQuestion['facet'] = 'recognition'): LearnQuestion {
  return {
    card_id: `card-${char}-${facet}`,
    item_type: 'kana',
    item_id: `item-${char}`,
    facet,
    question_type: 'kana_speed',
    prompt: char,
    correct_answer: 'x',
    char,
  }
}

function start(id: string, chars: string[] = ['か']): SessionStart {
  return {
    session: { id, kind: 'practice', track: 'hiragana', scope: 'weak', started_at: '' },
    questions: chars.map((c) => question(c)),
  }
}

function answer(id: string): AnswerRequestItem {
  return {
    client_event_id: id,
    card_id: 'card',
    question_type: 'kana_speed',
    shown_at: '',
    duration_ms: 1,
    idle_ms: 0,
    first_input_ms: null,
    attempts: 1,
    hints_used: 0,
    answer_revealed: false,
    audio_replays: 0,
  }
}

function completed(id: string): SessionResult {
  return {
    session: { id, kind: 'practice', track: 'hiragana', scope: null, started_at: '', completed_at: '' },
    answer_count: 1,
    correct_count: 1,
    active_ms: 1,
    counts: { strong: 0, good: 1, shaky: 0, missed: 0 },
    cards: [],
  }
}

/** Hand-written fake: sessions s1, s2, … and a log of what reached the queue. */
function fakeDeps(opts: { failStart?: boolean; failComplete?: number } = {}) {
  let started = 0
  let completes = 0
  const log: string[] = []
  const deps: StudyRecorderDeps = {
    start: async () => {
      started += 1
      if (opts.failStart) throw new Error('offline')
      return start(`s${started}`, started === 1 ? ['か'] : ['き'])
    },
    enqueue: (sessionId, a) => log.push(`enqueue ${sessionId} ${a.client_event_id}`),
    flush: async (sessionId) => log.push(`flush ${sessionId}`),
    complete: async (sessionId) => {
      completes += 1
      if (opts.failComplete && completes <= opts.failComplete) throw new Error('server')
      log.push(`complete ${sessionId}`)
      return completed(sessionId)
    },
  }
  return { deps, log, starts: () => started }
}

describe('StudyRecorder', () => {
  it('starts one session however often open is called', async () => {
    const { deps, starts } = fakeDeps()
    const r = new StudyRecorder(deps)
    await Promise.all([r.open(), r.open()])
    await r.open()
    expect(starts()).toBe(1)
    expect(r.getSnapshot().status).toBe('ready')
    expect(r.getSnapshot().session?.session.id).toBe('s1')
  })

  it('knows the cards of the session by item and facet', async () => {
    const r = new StudyRecorder(fakeDeps().deps)
    await r.open()
    expect(r.card('か', 'recognition')?.card_id).toBe('card-か-recognition')
    expect(r.card('か', 'meaning')).toBeUndefined()
    expect(r.card('き', 'recognition')).toBeUndefined()
  })

  it('holds answers given while the session is starting and sends them once it has started', async () => {
    const { deps, log } = fakeDeps()
    const r = new StudyRecorder(deps)
    const opening = r.open()
    r.record(answer('a1'))
    expect(log).toEqual([])
    await opening
    expect(log).toEqual(['enqueue s1 a1'])
  })

  it('flushes, then completes the session on finish', async () => {
    const { deps, log } = fakeDeps()
    const r = new StudyRecorder(deps)
    await r.open()
    r.record(answer('a1'))
    const result = await r.finish()
    expect(result?.session.id).toBe('s1')
    expect(log).toEqual(['enqueue s1 a1', 'flush s1', 'complete s1'])
    expect(r.getSnapshot().status).toBe('finished')
  })

  it('does not complete a session nobody answered', async () => {
    const { deps, log } = fakeDeps()
    const r = new StudyRecorder(deps)
    await r.open()
    expect(await r.finish()).toBeNull()
    expect(log).toEqual([])
  })

  it('opens a new session for an answer given after finishing (play again), keeping earlier cards', async () => {
    const { deps, log } = fakeDeps()
    const r = new StudyRecorder(deps)
    await r.open()
    r.record(answer('a1'))
    await r.finish()
    r.record(answer('a2'))
    await r.open()
    expect(log[log.length - 1]).toBe('enqueue s2 a2')
    expect(r.card('か', 'recognition')).toBeDefined()
    expect(r.card('き', 'recognition')).toBeDefined()
  })

  it('starts a fresh session on restart even though one is open', async () => {
    const { deps, starts } = fakeDeps()
    const r = new StudyRecorder(deps)
    await r.open()
    await r.restart()
    expect(starts()).toBe(2)
    expect(r.getSnapshot().session?.session.id).toBe('s2')
  })

  it('reports a failed start and can try again', async () => {
    const { deps } = fakeDeps({ failStart: true })
    const r = new StudyRecorder(deps)
    await expect(r.open()).rejects.toThrow('offline')
    expect(r.getSnapshot().status).toBe('start-error')
    expect(r.getSnapshot().error?.message).toBe('offline')
  })

  it('keeps the session after a failed completion so finishing again completes it', async () => {
    const { deps, log } = fakeDeps({ failComplete: 1 })
    const r = new StudyRecorder(deps)
    await r.open()
    r.record(answer('a1'))
    await expect(r.finish()).rejects.toThrow('server')
    expect(r.getSnapshot().status).toBe('finish-error')
    const result = await r.finish()
    expect(result?.session.id).toBe('s1')
    expect(log.filter((l) => l.startsWith('complete'))).toEqual(['complete s1'])
  })

  it('tells subscribers about every status change', async () => {
    const r = new StudyRecorder(fakeDeps().deps)
    const seen: string[] = []
    r.subscribe(() => seen.push(r.getSnapshot().status))
    await r.open()
    r.record(answer('a1'))
    await r.finish()
    expect(seen).toEqual(['starting', 'ready', 'finishing', 'finished'])
  })
})
