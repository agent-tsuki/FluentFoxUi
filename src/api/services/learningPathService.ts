import type { KanaScriptId } from '@/lib/content/kana/scriptIds'

// Guided path progress per kana script, stored in this browser only (like
// kanaProgressService). When the backend exists, only this file changes.

/** The five steps of a unit. 'learn' is derived from kana progress, not stored. */
export type UnitStep = 'watch' | 'learn' | 'practise' | 'print' | 'quiz'

export interface UnitProgress {
  watchedAt?: string
  practisedAt?: string
  printedAt?: string
  /** Best row-quiz score, 0–1. */
  quizBest?: number
  quizPassedAt?: string
  /** Set when the learner tested out of this unit with a skip test. */
  skippedAt?: string
}

export interface FinalTestResult {
  /** Best score, 0–1. */
  best: number
  passedAt?: string
  /** Name the learner typed for the certificate. */
  certificateName?: string
}

/** Best score per skip scope ('all' | a group id), 0–1. */
export type SkipTestBest = Partial<Record<string, number>>

export interface LearningPathState {
  version: 1
  units: Record<string, UnitProgress>
  finalTest?: FinalTestResult
  skipTests?: SkipTestBest
}

/** Hiragana keeps its original key so existing progress keeps working. */
const STORAGE_KEYS: Record<KanaScriptId, string> = {
  hiragana: 'ff-hiragana-path-v1',
  katakana: 'ff-katakana-path-v1',
}
const EMPTY: LearningPathState = { version: 1, units: {} }

type Listener = () => void

/** One script's guided-path progress: unit steps, quizzes, skip tests, final test. */
export type LearningPathStore = ReturnType<typeof createLearningPathStore>

function createLearningPathStore(storageKey: string) {
  const listeners = new Set<Listener>()
  let state: LearningPathState = load()

  function load(): LearningPathState {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return EMPTY
      const parsed = JSON.parse(raw) as LearningPathState
      return parsed?.version === 1 && parsed.units ? parsed : EMPTY
    } catch {
      return EMPTY
    }
  }

  function commit(next: LearningPathState) {
    state = next
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      /* keep in memory for this session */
    }
    listeners.forEach((l) => l())
  }

  function patchUnit(unitId: string, patch: (u: UnitProgress) => UnitProgress) {
    commit({ ...state, units: { ...state.units, [unitId]: patch(state.units[unitId] ?? {}) } })
  }

  return {
    getState(): LearningPathState {
      return state
    },

    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    markWatched(unitId: string, now = new Date()) {
      if (state.units[unitId]?.watchedAt) return
      patchUnit(unitId, (u) => ({ ...u, watchedAt: now.toISOString() }))
    },

    markPractised(unitId: string, now = new Date()) {
      patchUnit(unitId, (u) => ({ ...u, practisedAt: now.toISOString() }))
    },

    markPrinted(unitId: string, now = new Date()) {
      patchUnit(unitId, (u) => ({ ...u, printedAt: now.toISOString() }))
    },

    /** Keeps the best score; `passed` uses the script's unit-quiz pass mark. */
    recordQuiz(unitId: string, score: number, passed: boolean, now = new Date()) {
      patchUnit(unitId, (u) => ({
        ...u,
        quizBest: Math.max(u.quizBest ?? 0, score),
        quizPassedAt: u.quizPassedAt ?? (passed ? now.toISOString() : undefined),
      }))
    },

    recordFinalTest(score: number, passed: boolean, now = new Date()) {
      const prev = state.finalTest
      commit({
        ...state,
        finalTest: {
          ...prev,
          best: Math.max(prev?.best ?? 0, score),
          passedAt: prev?.passedAt ?? (passed ? now.toISOString() : undefined),
        },
      })
    },

    /**
     * Result of a skip test. `passedUnitIds` are marked as tested out (already
     * skipped units keep their date); units not passed are left as they were.
     */
    recordSkipTest(scope: string, score: number, passedUnitIds: string[], now = new Date()) {
      const units = { ...state.units }
      for (const id of passedUnitIds) {
        units[id] = { ...units[id], skippedAt: units[id]?.skippedAt ?? now.toISOString() }
      }
      const skipTests = { ...state.skipTests, [scope]: Math.max(state.skipTests?.[scope] ?? 0, score) }
      commit({ ...state, units, skipTests })
    },

    /** Puts a tested-out unit back into the normal step-by-step flow. */
    undoSkip(unitId: string) {
      if (!state.units[unitId]?.skippedAt) return
      patchUnit(unitId, ({ skippedAt: _skipped, ...rest }) => rest)
    },

    setCertificateName(name: string) {
      commit({ ...state, finalTest: { best: state.finalTest?.best ?? 0, ...state.finalTest, certificateName: name } })
    },

    reset() {
      commit(EMPTY)
    },
  }
}

const stores = new Map<KanaScriptId, LearningPathStore>()

/** The path store for a script (created, and read from storage, on first use). */
export function getLearningPath(script: KanaScriptId): LearningPathStore {
  let store = stores.get(script)
  if (!store) {
    store = createLearningPathStore(STORAGE_KEYS[script])
    stores.set(script, store)
  }
  return store
}

/**
 * Hook point for a combined "Kana master" certificate: each script's final
 * test result, read from its own store.
 */
export function getFinalTests(scripts: readonly KanaScriptId[]): Partial<Record<KanaScriptId, FinalTestResult>> {
  return Object.fromEntries(scripts.map((id) => [id, getLearningPath(id).getState().finalTest]))
}
