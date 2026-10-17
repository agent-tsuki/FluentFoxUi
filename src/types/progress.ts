/**
 * Wire shapes of the `/progress/*` API (backend plan: docs/learning-plan.md §7.4).
 * snake_case on purpose: these are the exact JSON bodies. Login + verified email required.
 */
import type { DashboardData } from '@/types'
import type { CardFacet, CardState, GradeLabel, GradeReason, LearningTrack, PracticeMode, QuestionType, SrsItemType } from '@/types/learn'

/**
 * New · Learning (learning/relearning or stability < 1 d) · Familiar (1–7 d) ·
 * Strong (7–21 d) · Mastered (≥ 21 d). A kanji takes the lower of its two cards.
 */
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered'

// ─── Overview ────────────────────────────────────────────────────────────────

export interface TrackOverview {
  track: LearningTrack
  items_per_level: Record<MasteryLevel, number>
  mastered_pct: number
  /** Share of reviews recalled over the last 30 days, 0–1; null without reviews. */
  retention_30d: number | null
  avg_answer_ms: number | null
}

export interface TodayStats {
  answers: number
  correct: number
  active_ms: number
  goal_answers: number
  goal_met: boolean
  due_now: number
}

export interface StreakInfo {
  current: number
  longest: number
}

/** GET /progress/overview */
export interface ProgressOverview {
  tracks: TrackOverview[]
  today: TodayStats
  streak: StreakInfo
  /** "Your recall vs target"; absent when the user hid retention. */
  retention?: { actual: number | null; target: number }
}

// ─── Forecast & calendar ─────────────────────────────────────────────────────

export interface ForecastDay {
  /** Local date, YYYY-MM-DD. Overdue reviews count on the first day. */
  date: string
  by_track: Partial<Record<LearningTrack, number>>
  total: number
}

/** GET /progress/forecast?days= */
export interface ProgressForecast {
  days: ForecastDay[]
}

export interface CalendarDay {
  date: string
  answers: number
  minutes: number
  /** 0–1; null on days without answers. */
  accuracy: number | null
  goal_met: boolean
}

/** GET /progress/calendar?from=&to= */
export interface ProgressCalendar {
  days: CalendarDay[]
  current_streak: number
  longest_streak: number
  active_days: number
}

// ─── Weakness & confusions ───────────────────────────────────────────────────

export interface PracticeSuggestion {
  track: LearningTrack
  mode: PracticeMode
  unit?: string
  pair?: string
}

export interface WeakItem {
  item_type: SrsItemType
  item_id: string
  track: LearningTrack
  /** Kana character or kanji char. */
  char: string
  level: MasteryLevel
  /** Weakness score, 0–1 (higher is weaker). */
  score: number
  recall: number
  lapse_rate: number
  time_ratio: number
  confusion_share: number
  reasons: string[]
  suggestion: PracticeSuggestion
}

/** GET /progress/weak?track=&limit= */
export interface WeakItemsResponse {
  items: WeakItem[]
}

export interface WeakGroup {
  track: LearningTrack
  unit_id: string
  slug: string
  title: string
  reviews: number
  lapse_rate: number
  time_ratio: number
  suggestion: PracticeSuggestion
}

/** GET /progress/weak-groups?track= */
export interface WeakGroupsResponse {
  groups: WeakGroup[]
}

export interface ConfusionSide {
  item_id: string
  char: string
}

export interface ConfusionPair {
  item_type: SrsItemType
  target: ConfusionSide
  chosen: ConfusionSide
  times: number
  last_at: string
}

/** GET /progress/confusions?track=&limit= */
export interface ConfusionsResponse {
  pairs: ConfusionPair[]
}

// ─── Item history ────────────────────────────────────────────────────────────

export interface ItemCardProgress {
  card_id: string
  facet: CardFacet
  state: CardState
  level: MasteryLevel
  /** Recall chance now, 0–1. */
  recall: number | null
  stability: number
  difficulty: number
  reps: number
  lapses: number
  next_due: string | null
  last_review_at: string | null
  is_leech: boolean
}

export interface ItemAnswer {
  card_id: string
  question_type: QuestionType
  answered_at: string
  correct: boolean
  label: GradeLabel | null
  reason: GradeReason
  active_ms: number
}

/** GET /progress/items/{type}/{id} */
export interface ItemHistory {
  item_type: SrsItemType
  item_id: string
  char: string
  level: MasteryLevel
  cards: ItemCardProgress[]
  /** Last 20 answers, newest first. */
  answers: ItemAnswer[]
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** GET /progress/dashboard: the existing frontend `DashboardData` shape. */
export type ProgressDashboard = DashboardData
