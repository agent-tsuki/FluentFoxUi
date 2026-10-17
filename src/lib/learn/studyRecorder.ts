/**
 * One practice run or test on the learn API, framework-free so it can be
 * unit tested; React code uses it through `useStudyRecorder`.
 *
 *  - `open()` starts a session (POST /learn/practice or /learn/tests).
 *  - `record()` hands each answer to the answer queue. An answer recorded
 *    after the session was finished (a practice "Play again") opens a new
 *    session first, since the server refuses answers to a completed one.
 *  - `finish()` flushes the queue and completes the session; the result
 *    carries the test score for tests.
 *
 * Card ids depend only on the user, item and facet, so a card seen in any
 * session of this run can be answered in a later one.
 */
import type { AnswerRequestItem, CardFacet, LearnQuestion, SessionResult, SessionStart } from '@/types/learn'
import { cardKey, questionChar } from './practiceSession'

export interface StudyRecorderDeps {
  start: () => Promise<SessionStart>
  enqueue: (sessionId: string, answer: AnswerRequestItem) => void
  flush: (sessionId: string) => Promise<unknown>
  complete: (sessionId: string) => Promise<SessionResult>
}

export type StudyRecorderStatus = 'starting' | 'ready' | 'start-error' | 'finishing' | 'finished' | 'finish-error'

export interface StudyRecorderSnapshot {
  status: StudyRecorderStatus
  error: Error | null
  /** The latest session start (its questions), null until one has started. */
  session: SessionStart | null
  /** The latest completed session's result. */
  result: SessionResult | null
}

interface OpenSession {
  id: string
  answered: number
}

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)))

export class StudyRecorder {
  private snapshot: StudyRecorderSnapshot = { status: 'starting', error: null, session: null, result: null }
  private readonly listeners = new Set<() => void>()
  private readonly cards = new Map<string, LearnQuestion>()
  private current: OpenSession | null = null
  private opening: Promise<SessionStart> | null = null
  private finishing: Promise<SessionResult | null> | null = null
  /** Answers recorded while a session is being opened. */
  private buffered: AnswerRequestItem[] = []

  constructor(private readonly deps: StudyRecorderDeps) {}

  getSnapshot = (): StudyRecorderSnapshot => this.snapshot

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** The card this run has for an item, from any of its sessions' questions. */
  card(char: string, facet: CardFacet): LearnQuestion | undefined {
    return this.cards.get(cardKey(char, facet))
  }

  /** Starts a session unless one is open or opening. */
  open(): Promise<SessionStart> {
    if (this.opening) return this.opening
    if (this.current && this.snapshot.session) return Promise.resolve(this.snapshot.session)
    this.set({ status: 'starting', error: null })
    const opening = this.deps.start().then(
      (data) => {
        this.opening = null
        this.current = { id: data.session.id, answered: 0 }
        for (const q of data.questions) this.cards.set(cardKey(questionChar(q), q.facet), q)
        this.set({ status: 'ready', session: data })
        this.drainBuffer()
        return data
      },
      (err: unknown) => {
        this.opening = null
        this.buffered = []
        this.set({ status: 'start-error', error: toError(err) })
        throw err
      },
    )
    this.opening = opening
    return opening
  }

  /** Leaves the open session as it is and starts a fresh one (a test's Retry). */
  restart(): Promise<SessionStart> {
    this.current = null
    this.buffered = []
    this.set({ result: null })
    return this.open()
  }

  record(answer: AnswerRequestItem): void {
    if (this.current && !this.opening) {
      this.deps.enqueue(this.current.id, answer)
      this.current.answered += 1
      return
    }
    this.buffered.push(answer)
    // Reopening after a finish; a failure is reported through the status.
    this.open().catch(() => undefined)
  }

  /**
   * Sends every queued answer and completes the session. Resolves null when
   * nothing was answered (the empty session is simply left open).
   */
  finish(): Promise<SessionResult | null> {
    this.finishing ??= this.runFinish().finally(() => {
      this.finishing = null
    })
    return this.finishing
  }

  private async runFinish(): Promise<SessionResult | null> {
    if (this.opening) await this.opening.catch(() => undefined)
    const open = this.current
    if (!open || open.answered === 0) return null
    this.set({ status: 'finishing', error: null })
    try {
      await this.deps.flush(open.id)
      const result = await this.deps.complete(open.id)
      if (this.current === open) this.current = null
      this.set({ status: 'finished', result })
      return result
    } catch (err) {
      this.set({ status: 'finish-error', error: toError(err) })
      throw err
    }
  }

  private drainBuffer(): void {
    const answers = this.buffered
    this.buffered = []
    answers.forEach((a) => this.record(a))
  }

  private set(patch: Partial<StudyRecorderSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch }
    this.listeners.forEach((l) => l())
  }
}
