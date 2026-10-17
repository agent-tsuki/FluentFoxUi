/** How well a learner knows one kana, derived from its review history. */
export type KanaMastery = 'new' | 'seen' | 'learning' | 'mastered'

/** Review answer, mapped onto FSRS ratings (Again / Hard / Good / Easy). */
export type KanaGrade = 'again' | 'hard' | 'good' | 'easy'

/**
 * FSRS scheduling state, stored as plain JSON (dates as ISO strings) so it can
 * move to the backend later without a format change.
 */
export interface KanaReviewCard {
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  /** 0 New, 1 Learning, 2 Review, 3 Relearning (FSRS State). */
  state: number
  last_review?: string
}

export interface KanaProgress {
  /** Kana id from the chart data, e.g. 'ka', 'kya'. */
  id: string
  /** When the learner first opened this kana's detail sheet. */
  seenAt?: string
  /** Set once the learner has traced every stroke correctly. */
  tracedAt?: string
  card?: KanaReviewCard
}

/** "Today's 5": a stable daily goal, picked once per local day. */
export interface DailyGoal {
  /** Local date, YYYY-MM-DD. */
  date: string
  ids: string[]
  /** Ids from `ids` the learner has reviewed today. */
  doneIds: string[]
}

export interface KanaProgressState {
  version: 1
  items: Record<string, KanaProgress>
  goal?: DailyGoal
}
