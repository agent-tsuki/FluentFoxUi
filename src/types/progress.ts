/**
 * Wire shapes of the `/progress/*` API (backend plan: docs/learning-plan.md §7.4,
 * FluentFox internal/progress/dto.go). snake_case on purpose: these are the
 * exact JSON bodies; the dashboard alone is camelCase (DashboardData).
 * Login + verified email required.
 */
import type { DashboardData } from '@/types'
import type { CardFacet, CardState, GradeLabel, GradeReason, LearningTrack, PracticeMode, QuestionType, SrsItemType } from '@/types/learn'

/**
 * New · Learning (learning/relearning or stability < 1 d) · Familiar (1–7 d) ·
 * Strong (7–21 d) · Mastered (≥ 21 d). A kanji takes the lower of its two cards.
 */
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered'

export type ItemsPerLevel = Record<MasteryLevel, number>

// ─── Overview ────────────────────────────────────────────────────────────────

/**
 * One item's level, for chart colours and kanji stages.
 * ASSUMPTION: the backend does not send this list yet (see TrackOverview.items).
 */
export interface ItemLevelEntry {
  item_id: string
  /** Kana character or kanji char. */
  char: string
  level: MasteryLevel
}

export interface TrackOverview {
  track: LearningTrack
  total_items: number
  items_per_level: ItemsPerLevel
  /** 0–100. */
  mastered_pct: number
  /** Share of reviews recalled over the last 30 days, 0–1; null without reviews. */
  retention_30d: number | null
  /** Mean time of correct answers in the last 30 days; null without any. */
  avg_answer_ms: number | null
  /**
   * Every item of the track with its level. Not in the backend DTO yet:
   * until it is, chart cells and kanji stages show New.
   */
  items?: ItemLevelEntry[]
}

export interface TodayStats {
  answers: number
  correct: number
  active_ms: number
  new_learned: number
  /** Hiragana and katakana share this limit. */
  new_kana_left: number
  new_kanji_left: number
  reviews_left: number
  goal_answers: number
  goal_met: boolean
  due_now: number
}

export interface StreakInfo {
  /** Days in a row with the goal met; an unfinished today does not break it. */
  current: number
  longest: number
}

export interface RetentionInfo {
  /** Share of reviews recalled in the last 30 days; null without reviews. */
  actual: number | null
  /** The learner's desired retention. */
  target: number
}

/** GET /progress/overview */
export interface ProgressOverview {
  tracks: TrackOverview[]
  today: TodayStats
  streak: StreakInfo
  /** "Your recall vs target"; absent when the user hid retention. */
  retention?: RetentionInfo
}

// ─── Forecast & calendar ─────────────────────────────────────────────────────

export interface ForecastDay {
  /** Local study date, YYYY-MM-DD. Overdue reviews count on the first day. */
  date: string
  /** Tracks with nothing due are left out. */
  by_track: Partial<Record<LearningTrack, number>>
  total: number
}

/** GET /progress/forecast?days= (1–60, default 14) */
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

/** GET /progress/calendar?from=&to= (default: the 364 days before today, and today) */
export interface ProgressCalendar {
  /** Every date of the range, oldest first. */
  days: CalendarDay[]
  current_streak: number
  /** Over all time, not only the range. */
  longest_streak: number
  /** Days of the range with answers. */
  active_days: number
}

// ─── Weakness & confusions ───────────────────────────────────────────────────

export interface PracticeSuggestion {
  track: LearningTrack
  mode: PracticeMode
  /** Unit slug for mode 'unit'. */
  unit?: string
  /** Two characters for mode 'lookalike', such as "ぬ:め". */
  pair?: string
}

export interface WeakItem {
  card_id: string
  item_type: SrsItemType
  item_id: string
  facet: CardFacet
  track: LearningTrack
  /** Kana character or kanji char. */
  char: string
  level: MasteryLevel
  /** Weakness score, 0–1 (higher is weaker). */
  score: number
  recall: number
  lapse_rate: number
  /** Answer time over the learner's usual; 0 without timed answers. */
  time_ratio: number
  confusion_share: number
  /** Readable sentences from the server. */
  reasons: string[]
  suggestion: PracticeSuggestion
}

/** GET /progress/weak?track=&limit= */
export interface WeakItemsResponse {
  items: WeakItem[]
}

export interface WeakGroup {
  track: LearningTrack
  /** 'unit', or 'kana_group' for dakuten, combo or foreign. */
  kind: 'unit' | 'kana_group'
  unit_id?: string
  /** Unit slug or kana group key. */
  slug: string
  title: string
  reviews: number
  lapse_rate: number
  time_ratio: number
  reason: string
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
  track: LearningTrack
  /** The item asked. */
  target: ConfusionSide
  /** The item picked instead. */
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
  /** Recall chance now, 0–1; null for a new card. */
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
  /** Null for analytics-only answers. */
  label: GradeLabel | null
  reason: GradeReason
  active_ms: number
}

export interface ItemStats {
  answers: number
  correct: number
  accuracy: number | null
  reviews: number
  /** Share of reviews recalled; null without reviews. */
  retention: number | null
  avg_answer_ms: number | null
}

/** GET /progress/items/{type}/{id}?track= (id: kana slug or character, kanji char, or item id) */
export interface ItemHistory {
  item_type: SrsItemType
  item_id: string
  track: LearningTrack
  char: string
  level: MasteryLevel
  cards: ItemCardProgress[]
  stats: ItemStats
  /** Last 20 answers, newest first. */
  answers: ItemAnswer[]
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** GET /progress/dashboard: the frontend `DashboardData` shape (camelCase). */
export type ProgressDashboard = DashboardData
