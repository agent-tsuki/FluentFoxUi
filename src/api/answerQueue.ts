/**
 * Answer queue: buffers graded answers per study session and sends them to
 * `POST /learn/sessions/{id}/answers` (backend plan §8.4).
 *
 *  - Flushes every `ANSWER_FLUSH_EVERY` answers, on an explicit `flush`
 *    (session complete) and when the tab is hidden (`fetch` keepalive).
 *  - Unsent answers are kept in localStorage and resent with the same
 *    `client_event_id` after a reload; the server is idempotent on that id,
 *    so a resend of an answer it already stored just returns the stored result.
 *  - Flushes of one session run one at a time, so answers are never sent twice
 *    by this tab in parallel.
 *  - Results reach callers through `flush()`'s return value, `getResult()` and
 *    `subscribe()` (which also reports answers resent after a reload).
 */
import { ApiError } from '@/api/errors'
import { learnService } from '@/api/services/learnService'
import { getAccessToken, useAuthTokenStore } from '@/store/authStore'
import type { AnswerRequestItem, AnswerResultItem } from '@/types/learn'

export const ANSWER_FLUSH_EVERY = 5
/** Server limit per request. */
export const MAX_ANSWERS_PER_REQUEST = 50
export const ANSWER_QUEUE_STORAGE_KEY = 'ff-answer-queue-v1'

export interface AnswerTransport {
  submit(sessionId: string, answers: AnswerRequestItem[]): Promise<AnswerResultItem[]>
  /** Must survive page unload. Resolves null when the answers were not accepted. */
  submitKeepalive(sessionId: string, answers: AnswerRequestItem[]): Promise<AnswerResultItem[] | null>
}

export interface QueueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type AnswerQueueEvent =
  | { type: 'results'; sessionId: string; results: AnswerResultItem[] }
  /** The server refused these answers for good (e.g. the session is completed or not this user's). */
  | { type: 'dropped'; sessionId: string; answers: AnswerRequestItem[]; error: ApiError }

type PendingBySession = Record<string, AnswerRequestItem[]>

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/**
 * True when resending can never succeed. Auth problems (401, unverified email),
 * timeouts, rate limits and server errors are worth retrying later.
 */
function isPermanentRejection(err: unknown): err is ApiError {
  if (!(err instanceof ApiError)) return false
  const { httpStatus, errorCode } = err
  if (httpStatus < 400 || httpStatus >= 500) return false
  if (httpStatus === 401 || httpStatus === 408 || httpStatus === 429) return false
  return !(httpStatus === 403 && errorCode === 'EMAIL_NOT_VERIFIED')
}

function readStored(storage: QueueStorage | null): PendingBySession {
  try {
    const raw = storage?.getItem(ANSWER_QUEUE_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, AnswerRequestItem[]] => Array.isArray(entry[1])))
  } catch {
    return {}
  }
}

export class AnswerQueue {
  private readonly pending: PendingBySession
  private readonly inFlight = new Map<string, Set<string>>()
  private readonly keepaliveSends = new Map<string, Promise<void>>()
  private readonly chains = new Map<string, Promise<unknown>>()
  private readonly results = new Map<string, Map<string, AnswerResultItem>>()
  private readonly listeners = new Set<(event: AnswerQueueEvent) => void>()

  constructor(
    private readonly transport: AnswerTransport,
    private readonly storage: QueueStorage | null,
    private readonly flushEvery: number = ANSWER_FLUSH_EVERY,
  ) {
    this.pending = readStored(storage)
  }

  /** Buffers one answer and flushes in the background once enough are waiting. */
  enqueue(sessionId: string, answer: AnswerRequestItem): void {
    const list = (this.pending[sessionId] ??= [])
    const id = answer.client_event_id
    if (list.some((a) => a.client_event_id === id) || this.getResult(sessionId, id)) return
    list.push(answer)
    this.persist()
    if (this.unsent(sessionId).length >= this.flushEvery) {
      // Failures keep the answers queued; the next flush or reload retries them.
      this.flush(sessionId).catch(() => undefined)
    }
  }

  /**
   * Sends every queued answer of the session and resolves with their results.
   * Call before completing a session. Rejects when the network or server
   * fails (answers stay queued) or when the server refused them for good.
   */
  flush(sessionId: string): Promise<AnswerResultItem[]> {
    const previous = this.chains.get(sessionId) ?? Promise.resolve()
    const run = previous.catch(() => undefined).then(() => this.sendPending(sessionId))
    this.chains.set(sessionId, run)
    const clear = () => {
      if (this.chains.get(sessionId) === run) this.chains.delete(sessionId)
    }
    run.then(clear, clear)
    return run
  }

  /** Resends answers stored by an earlier page load. Needs a signed-in user. */
  resendStored(): void {
    for (const sessionId of Object.keys(this.pending)) this.flush(sessionId).catch(() => undefined)
  }

  /** Tab hidden or closing: best-effort keepalive send of everything not already on its way. */
  flushOnHide(): void {
    for (const sessionId of Object.keys(this.pending)) {
      const unsent = this.unsent(sessionId)
      if (unsent.length === 0) continue
      const sends = chunk(unsent, MAX_ANSWERS_PER_REQUEST).map((answers) => this.sendKeepalive(sessionId, answers))
      const done = Promise.all(sends).then(() => undefined)
      this.keepaliveSends.set(sessionId, done)
      done.finally(() => {
        if (this.keepaliveSends.get(sessionId) === done) this.keepaliveSends.delete(sessionId)
      })
    }
  }

  getResult(sessionId: string, clientEventId: string): AnswerResultItem | undefined {
    return this.results.get(sessionId)?.get(clientEventId)
  }

  getResults(sessionId: string): AnswerResultItem[] {
    return [...(this.results.get(sessionId)?.values() ?? [])]
  }

  pendingCount(sessionId: string): number {
    return this.pending[sessionId]?.length ?? 0
  }

  subscribe(listener: (event: AnswerQueueEvent) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private async sendPending(sessionId: string): Promise<AnswerResultItem[]> {
    // A keepalive send of the same answers may still be running; let it land first.
    await this.keepaliveSends.get(sessionId)
    const collected: AnswerResultItem[] = []
    for (const answers of chunk(this.unsent(sessionId), MAX_ANSWERS_PER_REQUEST)) {
      this.setInFlight(sessionId, answers, true)
      try {
        const results = await this.transport.submit(sessionId, answers)
        this.accept(sessionId, answers, results)
        collected.push(...results)
      } catch (err) {
        if (isPermanentRejection(err)) this.drop(sessionId, answers, err)
        throw err
      } finally {
        this.setInFlight(sessionId, answers, false)
      }
    }
    return collected
  }

  private async sendKeepalive(sessionId: string, answers: AnswerRequestItem[]): Promise<void> {
    this.setInFlight(sessionId, answers, true)
    try {
      const results = await this.transport.submitKeepalive(sessionId, answers)
      if (results) this.accept(sessionId, answers, results)
    } catch {
      // Still queued and persisted: the next flush or page load resends it.
    } finally {
      this.setInFlight(sessionId, answers, false)
    }
  }

  private unsent(sessionId: string): AnswerRequestItem[] {
    const sending = this.inFlight.get(sessionId)
    return (this.pending[sessionId] ?? []).filter((a) => !sending?.has(a.client_event_id))
  }

  private setInFlight(sessionId: string, answers: AnswerRequestItem[], sending: boolean): void {
    let ids = this.inFlight.get(sessionId)
    if (!ids) this.inFlight.set(sessionId, (ids = new Set()))
    for (const a of answers) {
      if (sending) ids.add(a.client_event_id)
      else ids.delete(a.client_event_id)
    }
    if (ids.size === 0) this.inFlight.delete(sessionId)
  }

  private accept(sessionId: string, answers: AnswerRequestItem[], results: AnswerResultItem[]): void {
    let stored = this.results.get(sessionId)
    if (!stored) this.results.set(sessionId, (stored = new Map()))
    for (const r of results) stored.set(r.client_event_id, r)
    this.remove(sessionId, answers)
    this.emit({ type: 'results', sessionId, results })
  }

  private drop(sessionId: string, answers: AnswerRequestItem[], error: ApiError): void {
    this.remove(sessionId, answers)
    this.emit({ type: 'dropped', sessionId, answers, error })
  }

  private remove(sessionId: string, answers: AnswerRequestItem[]): void {
    const ids = new Set(answers.map((a) => a.client_event_id))
    const left = (this.pending[sessionId] ?? []).filter((a) => !ids.has(a.client_event_id))
    if (left.length > 0) this.pending[sessionId] = left
    else delete this.pending[sessionId]
    this.persist()
  }

  private persist(): void {
    try {
      if (Object.keys(this.pending).length === 0) this.storage?.removeItem(ANSWER_QUEUE_STORAGE_KEY)
      else this.storage?.setItem(ANSWER_QUEUE_STORAGE_KEY, JSON.stringify(this.pending))
    } catch {
      /* storage full or blocked: answers still go out from memory */
    }
  }

  private emit(event: AnswerQueueEvent): void {
    this.listeners.forEach((listener) => listener(event))
  }
}

function browserStorage(): QueueStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export const answerQueue = new AnswerQueue(
  {
    submit: (sessionId, answers) => learnService.submitAnswers(sessionId, answers),
    submitKeepalive: (sessionId, answers) => learnService.submitAnswersKeepalive(sessionId, answers),
  },
  browserStorage(),
)

let started = false

/** Wires the queue to the page lifecycle. Call once at startup. */
export function startAnswerQueue(): void {
  if (started || typeof window === 'undefined') return
  started = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') answerQueue.flushOnHide()
  })
  window.addEventListener('pagehide', () => answerQueue.flushOnHide())
  // Stored answers need a token: resend once the session is restored on load, or after a login.
  useAuthTokenStore.subscribe((state, previous) => {
    if (state.accessToken && !previous.accessToken) answerQueue.resendStored()
  })
  if (getAccessToken()) answerQueue.resendStored()
}
