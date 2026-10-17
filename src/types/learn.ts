/**
 * Wire shapes of the `/learn/*` API (backend plan: docs/learning-plan.md §3, §7.2).
 * Field names stay snake_case because these are the exact JSON bodies; map to
 * UI shapes in hooks, not here. Every `/learn/*` call needs login + a verified email.
 */

// ─── Enums (plan §3) ──────────────────────────────────────────────────────────

export type LearningTrack = 'hiragana' | 'katakana' | 'kanji_n5'
export type SrsItemType = 'kana' | 'kanji'
export type CardFacet = 'recognition' | 'meaning' | 'reading' | 'writing'
export type SessionKind = 'lesson' | 'review' | 'practice' | 'unit_quiz' | 'skip_test' | 'final_test'
export type TestKind = 'unit_quiz' | 'skip' | 'final'
export type UnitType = 'kana' | 'kanji'
export type AnswerMode = 'choice' | 'typed' | 'mixed'
export type GuideLevel = 'full' | 'faded' | 'none'
export type PracticeMode = 'weak' | 'unit' | 'lookalike' | 'speed' | 'match'
export type UnitProgressStep = 'watched' | 'traced' | 'written' | 'practised'

export type QuestionType =
  | 'kana_mcq_romaji'
  | 'kana_mcq_kana'
  | 'kana_typed'
  | 'kana_listen'
  | 'kana_build'
  | 'kana_lookalike'
  | 'kana_speed'
  | 'kana_match'
  | 'kana_trace'
  | 'kanji_meaning_mcq'
  | 'kanji_meaning_typed'
  | 'kanji_reading_mcq'
  | 'kanji_reading_typed'
  | 'kanji_listen'
  | 'kanji_lookalike'

export type GradeReason =
  | 'fast'
  | 'normal'
  | 'slow'
  | 'mcq_cap'
  | 'typo'
  | 'hint'
  | 'replay'
  | 'wrong'
  | 'revealed'
  | 'too_fast'
  | 'idle'
  | 'stroke_errors'
  | 'analytics_only'

/** 0 New, 1 Learning, 2 Review, 3 Relearning (go-fsrs). */
export type CardState = 0 | 1 | 2 | 3

/** User-facing grade labels: Easy → strong, Good → good, Hard → shaky, Again → missed. */
export type GradeLabel = 'strong' | 'good' | 'shaky' | 'missed'

// ─── Summary ──────────────────────────────────────────────────────────────────

export interface LearnNextUnit {
  type: UnitType
  id: string
  slug: string
  title: string
}

export interface LearnGoalProgress {
  answers_today: number
  goal_answers: number
  met: boolean
}

/** GET /learn/summary?track= */
export interface LearnSummary {
  due_now: number
  due_today: number
  new_left_today: number
  learned: number
  next_unit: LearnNextUnit | null
  goal: LearnGoalProgress
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface StudySession {
  id: string
  kind: SessionKind
  track: LearningTrack | null
  scope: string | null
  started_at: string
}

/** One question as the server builds it. It carries its answer so the UI can mark ✓/✗ instantly. */
export interface LearnQuestion {
  card_id: string
  item_type: SrsItemType
  item_id: string
  facet: CardFacet
  question_type: QuestionType
  /** The character, word or audio text shown to the learner. */
  prompt: string
  /** Multiple-choice options (absent for typed questions). */
  options?: string[]
  correct_answer: string
  /** Other answers the server also accepts (synonyms, alt romaji). */
  accepted_answers?: string[]
  card_state?: CardState
  /** The kana or kanji the card is about (the prompt may be romaji, a meaning or a word). */
  char?: string
  /** 8+ lapses: after a miss the UI shows the mnemonic and look-alike comparison. */
  is_leech?: boolean
}

/** A new item a lesson teaches before its check quiz. */
export interface LessonItem {
  item_type: SrsItemType
  item_id: string
  /** Kana character or kanji char; the full content comes from `/content/*`. */
  char: string
  /** Kana only. */
  romaji?: string
  /** Kanji only. */
  meanings?: string[]
  /** Kanji only. */
  key_reading?: string
}

/** Response of every session-start endpoint (lessons, reviews, practice, tests). */
export interface SessionStart {
  session: StudySession
  questions: LearnQuestion[]
  /** Lessons only: the new items, in path order. */
  items?: LessonItem[]
}

export interface StartLessonRequest {
  track: LearningTrack
}

export interface StartReviewRequest {
  track?: LearningTrack
}

export interface StartPracticeRequest {
  track: LearningTrack
  mode: PracticeMode
  /** Unit slug, required for mode 'unit'. */
  unit?: string
  /** Look-alike pair, e.g. "ぬ:め", for mode 'lookalike'; the learner's mix-ups when omitted. */
  pair?: string
}

/** Tests ask every facet of every item in scope once; unanswered questions count as wrong. */
export interface StartTestRequest {
  kind: TestKind
  track: LearningTrack
  /** unit_quiz: unit slug; skip: kana group key, kanji group slug or 'all'; final: ignored. */
  scope: string
}

// ─── Answers ─────────────────────────────────────────────────────────────────

/** One answer as the client reports it. `answer_text` for typed questions, `chosen_option` for choices. */
export interface AnswerRequestItem {
  client_event_id: string
  card_id: string
  question_type: QuestionType
  /** ISO timestamp the question appeared. */
  shown_at: string
  duration_ms: number
  idle_ms: number
  first_input_ms: number | null
  answer_text?: string
  chosen_option?: string
  options?: string[]
  attempts: number
  hints_used: number
  answer_revealed: boolean
  audio_replays: number
  audio_ms?: number
  stroke_errors?: number
  stroke_count?: number
  guide_level?: GuideLevel
}

/** POST /learn/sessions/{id}/answers (1–50 answers). */
export interface SubmitAnswersRequest {
  answers: AnswerRequestItem[]
}

export interface AnswerResultItem {
  client_event_id: string
  correct: boolean
  correct_answer: string
  label: GradeLabel
  reason: GradeReason
  active_ms: number
  usual_ms: number
  next_due: string | null
  /** The card is in a learning step: show it again at the end of the session. */
  requeue: boolean
}

export interface SubmitAnswersResponse {
  results: AnswerResultItem[]
}

// ─── Completion ──────────────────────────────────────────────────────────────

export type GradeCounts = Record<GradeLabel, number>

export interface SessionCardResult {
  card_id: string
  item_type: SrsItemType
  item_id: string
  facet: CardFacet
  /** Kana character or kanji char, for the result list. */
  char: string
  label: GradeLabel
  reason: GradeReason
  /** From the card's first graded answer in the session. */
  active_ms?: number
  usual_ms?: number
  next_due: string | null
}

export interface SessionTestScore {
  kind: TestKind
  /** Questions right on the first answer. */
  score: number
  /** Questions in the test, answered or not. */
  total: number
  passed: boolean
  /** Share needed to pass, 0–1. */
  pass_mark: number
}

/** POST /learn/sessions/{id}/complete: the result screen. */
export interface SessionResult {
  session: StudySession & { completed_at: string }
  answer_count: number
  correct_count: number
  active_ms: number
  counts: GradeCounts
  cards: SessionCardResult[]
  test?: SessionTestScore
}

// ─── Settings, unit progress, notes ──────────────────────────────────────────

/** GET / PUT /learn/settings. Ranges are enforced by the server (plan §4.2). */
export interface LearningSettings {
  desired_retention: number
  new_kana_per_day: number
  new_kanji_per_day: number
  max_reviews_per_day: number
  session_size: number
  lesson_size: number
  daily_goal_answers: number
  day_starts_at_hour: number
  answer_mode: AnswerMode
  show_retention: boolean
}

export type LearningSettingsUpdate = Partial<LearningSettings>

/** PUT /learn/units/{type}/{slug}/progress?track= body (the step's first time is kept). */
export interface UnitProgressRequest {
  step: UnitProgressStep
}

export interface UnitProgressData {
  unit_type: UnitType
  unit_id: string
  unit_slug: string
  track: LearningTrack
  watched_at: string | null
  traced_at: string | null
  written_at: string | null
  practised_at: string | null
  /** Best unit quiz score, 0–100. */
  quiz_best_pct: number | null
  /** Set when a unit quiz was passed. */
  completed_at: string | null
}

/** GET /learn/units?track=: every unit of the track(s) in path order; steps not done are null. */
export interface UnitProgressList {
  units: UnitProgressData[]
}

/** GET / PUT /learn/kanji/{char}/note. */
export interface KanjiNote {
  text: string
  updated_at: string | null
}
