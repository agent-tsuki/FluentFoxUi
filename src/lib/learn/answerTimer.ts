/**
 * Measures one shown question and builds its answer payload for
 * `POST /learn/sessions/{id}/answers` (backend plan §7.2). Framework-free so
 * it can be unit tested; React code uses it through `useAnswerTimer`.
 *
 * The server grades from these signals: active time = duration − idle − audio.
 */
import type { AnswerRequestItem, GuideLevel, QuestionType } from '@/types/learn'

export interface AnswerClock {
  /** Monotonic milliseconds, for durations. */
  now(): number
  /** Wall-clock epoch milliseconds, for `shown_at`. */
  wallNow(): number
}

const systemClock: AnswerClock = {
  now: () => performance.now(),
  wallNow: () => Date.now(),
}

/** What the question component knows about the answer; the timer adds the timing signals. */
export interface AnswerDetails {
  card_id: string
  question_type: QuestionType
  answer_text?: string
  chosen_option?: string
  options?: string[]
  stroke_errors?: number
  stroke_count?: number
  guide_level?: GuideLevel
}

/** RFC 4122 v4 id. `crypto.randomUUID` needs a secure context, so plain-http dev hosts get the fallback. */
export function newClientEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export class AnswerTimer {
  private readonly clock: AnswerClock
  private eventId = ''
  private shownAtWall = 0
  private startedAt = 0
  private firstInputMs: number | null = null
  private idleMs = 0
  private hiddenSince: number | null = null
  private audioMs = 0
  private audioSince: number | null = null
  private audioPlays = 0
  private attempts = 0
  private hintsUsed = 0
  private revealed = false

  constructor(clock: AnswerClock = systemClock) {
    this.clock = clock
    this.start(false)
  }

  /**
   * Call when a question is shown. A new `client_event_id` is drawn here, not
   * in `build`, so building the same question twice gives the same id and
   * the server treats the second send as a repeat.
   */
  start(hidden: boolean): void {
    const now = this.clock.now()
    this.eventId = newClientEventId()
    this.shownAtWall = this.clock.wallNow()
    this.startedAt = now
    this.firstInputMs = null
    this.idleMs = 0
    this.hiddenSince = hidden ? now : null
    this.audioMs = 0
    this.audioSince = null
    this.audioPlays = 0
    this.attempts = 0
    this.hintsUsed = 0
    this.revealed = false
  }

  /** First keystroke, tap or tile move. Later calls are ignored. */
  markInput(): void {
    if (this.firstInputMs === null) this.firstInputMs = Math.round(this.clock.now() - this.startedAt)
  }

  /** Page Visibility: time while the tab is hidden counts as idle. */
  setHidden(hidden: boolean): void {
    const now = this.clock.now()
    if (hidden && this.hiddenSince === null) this.hiddenSince = now
    if (!hidden && this.hiddenSince !== null) {
      this.idleMs += now - this.hiddenSince
      this.hiddenSince = null
    }
  }

  /** Call when speech starts. Every play after the first counts as a replay. */
  audioStart(): void {
    this.audioPlays += 1
    if (this.audioSince === null) this.audioSince = this.clock.now()
  }

  /** Call from the speech `onend` / `onerror`. */
  audioStop(): void {
    if (this.audioSince === null) return
    this.audioMs += this.clock.now() - this.audioSince
    this.audioSince = null
  }

  /** One submitted try (the final answer included). */
  attempt(): void {
    this.attempts += 1
  }

  hint(): void {
    this.hintsUsed += 1
  }

  reveal(): void {
    this.revealed = true
  }

  /** The answer payload as of now. Open idle / audio intervals are counted up to now without closing them. */
  build(details: AnswerDetails): AnswerRequestItem {
    const now = this.clock.now()
    const idle = this.idleMs + (this.hiddenSince === null ? 0 : now - this.hiddenSince)
    const audio = this.audioMs + (this.audioSince === null ? 0 : now - this.audioSince)
    return {
      ...details,
      client_event_id: this.eventId,
      shown_at: new Date(this.shownAtWall).toISOString(),
      duration_ms: Math.round(now - this.startedAt),
      idle_ms: Math.round(idle),
      first_input_ms: this.firstInputMs,
      attempts: Math.max(1, this.attempts),
      hints_used: this.hintsUsed,
      answer_revealed: this.revealed,
      audio_replays: Math.max(0, this.audioPlays - 1),
      ...(this.audioPlays > 0 ? { audio_ms: Math.round(audio) } : {}),
    }
  }
}
