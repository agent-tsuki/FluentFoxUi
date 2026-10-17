import type {
  DailyGoal,
  KanaGrade,
  KanaMastery,
  KanaProgress,
  KanaProgressState,
  KanaReviewCard,
} from '@/types/kanaProgress'
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'

// Reviews, lessons and their schedule live on the learn API. This browser
// record, one per script, serves the flows the API does not cover yet
// (practice modes, unit quizzes, tests, the chart's mastery colours): it keeps
// what was seen, traced and answered, but no longer schedules anything.

/** Hiragana keeps its original key so existing progress keeps working. */
const STORAGE_KEYS: Record<KanaScriptId, string> = {
  hiragana: 'ff-kana-progress-v1',
  katakana: 'ff-katakana-progress-v1',
}
const DAILY_GOAL_SIZE = 5
/** A kana counts as mastered once FSRS expects it to stick for a week. */
const MASTERED_STABILITY_DAYS = 7
/** FSRS State.Review, as stored by the old browser scheduler. */
const STATE_REVIEW = 2
/** FSRS State.Learning: what a newly answered item is recorded as. */
const STATE_LEARNING = 1

const EMPTY_STATE: KanaProgressState = { version: 1, items: {} }

function localDate(now: Date): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** The record after one practice answer: counts it, keeps any earlier schedule fields as they were. */
function practisedCard(previous: KanaReviewCard | undefined, grade: KanaGrade, now: Date): KanaReviewCard {
  return {
    due: previous?.due ?? now.toISOString(),
    stability: previous?.stability ?? 0,
    difficulty: previous?.difficulty ?? 0,
    elapsed_days: previous?.elapsed_days ?? 0,
    scheduled_days: previous?.scheduled_days ?? 0,
    learning_steps: previous?.learning_steps ?? 0,
    reps: (previous?.reps ?? 0) + 1,
    lapses: (previous?.lapses ?? 0) + (grade === 'again' ? 1 : 0),
    state: previous?.state ?? STATE_LEARNING,
    last_review: now.toISOString(),
  }
}

export function masteryOf(item: KanaProgress | undefined): KanaMastery {
  if (!item) return 'new'
  const card = item.card
  if (card && card.state === STATE_REVIEW && card.stability >= MASTERED_STABILITY_DAYS) return 'mastered'
  if (card && card.reps > 0) return 'learning'
  if (item.seenAt || item.tracedAt) return 'seen'
  return 'new'
}

type Listener = () => void

/** One script's kana progress: mastery, FSRS reviews and today's goal. */
export type KanaProgressStore = ReturnType<typeof createKanaProgressStore>

/**
 * A progress store under its own storage key. The kanji course reuses it
 * (kanjiProgressService): item ids there are review-card ids (`日:m`, `日:r`)
 * and kanji chars (`日`, for seen / written).
 */
export function createKanaProgressStore(storageKey: string) {
  const listeners = new Set<Listener>()
  let state: KanaProgressState = load()

  function load(): KanaProgressState {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return EMPTY_STATE
      const parsed = JSON.parse(raw) as KanaProgressState
      return parsed?.version === 1 && parsed.items ? parsed : EMPTY_STATE
    } catch {
      return EMPTY_STATE
    }
  }

  function commit(next: KanaProgressState) {
    state = next
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      /* storage full or blocked: keep the in-memory state for this session */
    }
    listeners.forEach((listener) => listener())
  }

  function updateItem(id: string, patch: (item: KanaProgress) => KanaProgress) {
    const current = state.items[id] ?? { id }
    commit({ ...state, items: { ...state.items, [id]: patch(current) } })
  }

  const store = {
    /** Current snapshot. Stable identity until something changes. */
    getState(): KanaProgressState {
      return state
    },

    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    get(id: string): KanaProgress | undefined {
      return state.items[id]
    },

    mastery(id: string): KanaMastery {
      return masteryOf(state.items[id])
    },

    markSeen(id: string, now: Date = new Date()) {
      if (state.items[id]?.seenAt) return
      updateItem(id, (item) => ({ ...item, seenAt: now.toISOString() }))
    },

    markTraced(id: string, now: Date = new Date()) {
      updateItem(id, (item) => ({
        ...item,
        seenAt: item.seenAt ?? now.toISOString(),
        tracedAt: now.toISOString(),
      }))
    },

    /** Records one practice answer (see `recordReviews`). */
    async recordReview(id: string, grade: KanaGrade, now: Date = new Date()): Promise<void> {
      await store.recordReviews([id], grade, now)
    },

    /**
     * Records practice answers in one write and ticks them off today's goal.
     * Nothing is scheduled here: graded reviews go through the learn API.
     * Async so callers written for the old lazily loaded scheduler keep working.
     */
    async recordReviews(ids: readonly string[], grade: KanaGrade, now: Date = new Date()): Promise<void> {
      if (ids.length === 0) return
      const items = { ...state.items }
      for (const id of ids) {
        const item = items[id] ?? { id }
        items[id] = { ...item, seenAt: item.seenAt ?? now.toISOString(), card: practisedCard(item.card, grade, now) }
      }
      commit({ ...state, items })
      ids.forEach((id) => store.markGoalDone(id, now))
    },

    /**
     * Kana to review now: overdue first (oldest due first), then never-reviewed
     * kana in chart order. `orderedIds` is the chart order of eligible kana.
     */
    getDue(orderedIds: string[], limit: number, now: Date = new Date()): string[] {
      const nowMs = now.getTime()
      const overdue = orderedIds
        .filter((id) => {
          const card = state.items[id]?.card
          return card !== undefined && new Date(card.due).getTime() <= nowMs
        })
        .sort((a, b) => new Date(state.items[a]!.card!.due).getTime() - new Date(state.items[b]!.card!.due).getTime())
      const fresh = orderedIds.filter((id) => !state.items[id]?.card)
      return [...overdue, ...fresh].slice(0, limit)
    },

    /**
     * Today's goal: the first five not-yet-mastered kana in chart order, fixed
     * for the rest of the local day so the target doesn't move mid-session.
     */
    getDailyGoal(orderedIds: string[], now: Date = new Date()): DailyGoal {
      const today = localDate(now)
      if (state.goal?.date === today) return state.goal
      const ids = orderedIds.filter((id) => masteryOf(state.items[id]) !== 'mastered').slice(0, DAILY_GOAL_SIZE)
      const goal: DailyGoal = { date: today, ids, doneIds: [] }
      commit({ ...state, goal })
      return goal
    },

    markGoalDone(id: string, now: Date = new Date()) {
      const goal = state.goal
      if (!goal || goal.date !== localDate(now) || !goal.ids.includes(id) || goal.doneIds.includes(id)) return
      commit({ ...state, goal: { ...goal, doneIds: [...goal.doneIds, id] } })
    },

    /** For a future "reset progress" setting and for tests. */
    reset() {
      commit(EMPTY_STATE)
    },
  }
  return store
}

const stores = new Map<KanaScriptId, KanaProgressStore>()

/** The progress store for a script (created, and read from storage, on first use). */
export function getKanaProgress(script: KanaScriptId): KanaProgressStore {
  let store = stores.get(script)
  if (!store) {
    store = createKanaProgressStore(STORAGE_KEYS[script])
    stores.set(script, store)
  }
  return store
}
