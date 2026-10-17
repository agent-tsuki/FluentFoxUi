/**
 * Shapes the session result (`POST /learn/sessions/{id}/complete`) for the
 * result screen: counts per label, one row per card with its reason, its
 * time against the learner's usual time and when it comes back. Pure.
 */
import type { AnswerResultItem, GradeCounts, GradeLabel, GradeReason, SessionCardResult, SessionResult } from '@/types/learn'

/** Best first, as the result screen lists them. */
export const GRADE_LABELS: readonly GradeLabel[] = ['strong', 'good', 'shaky', 'missed']

export const GRADE_LABEL_TEXT: Record<GradeLabel, string> = {
  strong: 'Strong',
  good: 'Good',
  shaky: 'Shaky',
  missed: 'Missed',
}

/** One line per reason; the "why" a learner sees when tapping a row. */
export const GRADE_REASON_TEXT: Record<GradeReason, string> = {
  fast: 'Right, and faster than your usual time for this kind of question.',
  normal: 'Right, at about your usual speed.',
  slow: 'Right, but slower than your usual time, so it is marked as shaky.',
  mcq_cap: 'Right. Multiple choice can show at most Good; typing the answer can earn Strong.',
  typo: 'Right, with a small typo we accepted. Typos cap the grade at Good.',
  hint: 'Right, with a hint. Hints cap the grade.',
  replay: 'Right, after replaying the sound more than once. That caps the grade at Shaky.',
  wrong: 'The answer was wrong, so the card comes back soon.',
  revealed: 'The answer was shown before you answered, so it counts as missed.',
  too_fast: 'Right, but answered too quickly to time fairly, so time was not counted.',
  idle: 'Right, but the timer saw a long pause or a hidden tab, so time was not counted.',
  stroke_errors: 'Written with stroke mistakes, which lowers the grade.',
  analytics_only: 'Practice only: this answer does not change the schedule.',
}

export interface ResultRow extends SessionCardResult {
  /** Your active answer time and usual time for this question type, when the answer results are known. */
  activeMs: number | null
  usualMs: number | null
}

export interface ResultView {
  counts: GradeCounts
  rows: ResultRow[]
  /** Rows per label, each in session order. */
  byLabel: Record<GradeLabel, ResultRow[]>
}

function emptyCounts(): GradeCounts {
  return { strong: 0, good: 0, shaky: 0, missed: 0 }
}

/**
 * One row per card of the server's result. Times come from the card result;
 * when it has none, from this session's answer results (`answersByCard`: the
 * card's answers in the order given; the first one is the one that counted).
 * Counts come from the server when present, else from the rows.
 */
export function buildResultView(result: SessionResult, answersByCard: ReadonlyMap<string, readonly AnswerResultItem[]>): ResultView {
  const rows: ResultRow[] = result.cards.map((card) => {
    const first = answersByCard.get(card.card_id)?.[0]
    return { ...card, activeMs: card.active_ms ?? first?.active_ms ?? null, usualMs: card.usual_ms ?? first?.usual_ms ?? null }
  })
  const byLabel: Record<GradeLabel, ResultRow[]> = { strong: [], good: [], shaky: [], missed: [] }
  const counted = emptyCounts()
  for (const row of rows) {
    byLabel[row.label].push(row)
    counted[row.label] += 1
  }
  const counts = result.counts ? { ...emptyCounts(), ...result.counts } : counted
  return { counts, rows, byLabel }
}

/** "1.4 s" / "12 s". */
export function formatSeconds(ms: number): string {
  const s = ms / 1000
  return `${s < 10 ? s.toFixed(1) : Math.round(s)} s`
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** When a card comes back: "now", "in 10 min", "in 3 h", "tomorrow", "in 4 days". */
export function formatNextDue(nextDue: string | null, now: Date = new Date()): string {
  if (!nextDue) return 'not scheduled'
  const diff = new Date(nextDue).getTime() - now.getTime()
  if (Number.isNaN(diff)) return 'not scheduled'
  if (diff < MINUTE) return 'now'
  if (diff < HOUR) return `in ${Math.round(diff / MINUTE)} min`
  if (diff < DAY) return `in ${Math.round(diff / HOUR)} h`
  const days = Math.round(diff / DAY)
  return days === 1 ? 'tomorrow' : `in ${days} days`
}
