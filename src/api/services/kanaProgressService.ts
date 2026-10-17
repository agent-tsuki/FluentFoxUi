import type {
  DailyGoal,
  KanaGrade,
  KanaMastery,
  KanaProgress,
  KanaProgressState,
  KanaReviewCard,
} from '@/types/kanaProgress'
import type { KanaScriptId } from '@/lib/content/kana/scriptIds'

// Progress lives in this browser only for now, one store per script. Every
// read and write goes through this service, so syncing to the account later
// means changing this file only — components and hooks keep the same API.

/** Hiragana keeps its original key so existing progress keeps working. */
const STORAGE_KEYS: Record<KanaScriptId, string> = {
  hiragana: 'ff-kana-progress-v1',
  katakana: 'ff-katakana-progress-v1',
}
const DAILY_GOAL_SIZE = 5
/** A kana counts as mastered once FSRS expects it to stick for a week. */
const MASTERED_STABILITY_DAYS = 7
/** ts-fsrs State.Review; kept local so the chart page doesn't load ts-fsrs. */
const STATE_REVIEW = 2

const EMPTY_STATE: KanaProgressState = { version: 1, items: {} }

function localDate(now: Date): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toStoredCard(card: {
  due: Date
  last_review?: Date
} & Omit<KanaReviewCard, 'due' | 'last_review'>): KanaReviewCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString(),
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

function createKanaProgressStore(storageKey: string) {
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

    /**
     * Schedules the next review with FSRS and ticks the kana off today's goal.
     * ts-fsrs is loaded on first use so pages that only show mastery stay light.
     */
    async recordReview(id: string, grade: KanaGrade, now: Date = new Date()): Promise<void> {
      const { fsrs, createEmptyCard, Rating } = await import('ts-fsrs')
      const ratings = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy } as const
      const scheduler = fsrs({ enable_fuzz: true })
      const stored = state.items[id]?.card
      const card = stored
        ? {
            ...stored,
            due: new Date(stored.due),
            last_review: stored.last_review ? new Date(stored.last_review) : undefined,
          }
        : createEmptyCard(now)
      const { card: next } = scheduler.next(card, now, ratings[grade])

      updateItem(id, (item) => ({
        ...item,
        seenAt: item.seenAt ?? now.toISOString(),
        card: toStoredCard(next),
      }))
      store.markGoalDone(id, now)
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
