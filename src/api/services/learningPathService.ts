import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import type { KanjiLevelId } from '@/types/kanji'
import type { LearningTrack, TestHistoryEntry, TestKind, UnitProgressStep, UnitType } from '@/types/learn'
import type { CourseScopes, FinalTestResult, LearningPathState, LocalPathRecord, UnitProgress } from '@/types/learningPath'
import { learnService } from '@/api/services/learnService'
import { kanjiTrack } from '@/lib/learn/practiceSession'
import { pathTestsFromHistory, withLocalAttempt } from '@/lib/learn/testHistory'
import { EMPTY_LOCAL_PATH, mergePath, parseLocalPath, unitsBySlug } from '@/lib/learn/unitProgress'

export type { FinalTestResult, LearningPathState, SkipTestBest, UnitProgress, UnitStep } from '@/types/learningPath'

// One store per course (kana script or kanji level). Unit steps and quiz
// results live on the learn API (GET /learn/units, PUT .../progress; tests
// are recorded by the server when they complete). Tested-out units and skip /
// final test bests come from GET /learn/tests/history. Printing, "put back in
// the path" and the certificate name have no API, so they are kept in this
// browser under the signed-in user's id. Guests get an empty path and
// nothing is stored for them.

const LOCAL_KEY_PREFIX = 'ff-path-v2'

interface Course {
  /** Store id, also part of the local storage key. */
  id: string
  unitType: UnitType
  /** Null when the API has no track for the course (kanji levels other than N5). */
  track: LearningTrack | null
}

export interface PathUser {
  userId: string
  /** Only verified learners may call the learn API. */
  verified: boolean
}

type Listener = () => void

/** One course's guided-path progress: unit steps, quizzes, skip tests, final test. */
export type LearningPathStore = ReturnType<typeof createLearningPathStore>

const EMPTY: LearningPathState = { version: 1, units: {} }

function readLocal(key: string): LocalPathRecord {
  try {
    return parseLocalPath(localStorage.getItem(key))
  } catch {
    return EMPTY_LOCAL_PATH
  }
}

function createLearningPathStore(course: Course) {
  const listeners = new Set<Listener>()
  let user: PathUser | null = null
  let server: Record<string, UnitProgress> = {}
  let history: TestHistoryEntry[] = []
  // Which units each skip scope covers; set by the course once its content is known.
  let scopes: CourseScopes = { groups: [] }
  let local: LocalPathRecord = EMPTY_LOCAL_PATH
  let state: LearningPathState = EMPTY
  // Bumped on every user change so a late response for the previous user is dropped.
  let generation = 0

  const localKey = () => (user ? `${LOCAL_KEY_PREFIX}:${user.userId}:${course.id}` : null)
  const apiTrack = () => (user?.verified ? course.track : null)

  function publish() {
    const tests = course.track ? pathTestsFromHistory(history, course.track, scopes) : undefined
    state = mergePath(server, local, tests)
    listeners.forEach((l) => l())
  }

  function commitLocal(next: LocalPathRecord) {
    const key = localKey()
    if (!key) return
    local = next
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      /* storage full or blocked: keep it in memory for this visit */
    }
    publish()
  }

  function patchServerUnit(slug: string, patch: (u: UnitProgress) => UnitProgress) {
    server = { ...server, [slug]: patch(server[slug] ?? {}) }
    publish()
  }

  async function reload(): Promise<void> {
    const track = apiTrack()
    if (!track) return
    const gen = generation
    const [units, tests] = await Promise.allSettled([learnService.getUnits(track), learnService.getTestHistory(track)])
    if (gen !== generation) return
    // Either half failing keeps what it had; the next page visit loads again.
    if (units.status === 'fulfilled') server = unitsBySlug(units.value)
    if (tests.status === 'fulfilled') history = tests.value
    publish()
  }

  /** Shows a test result at once, then reloads the server's history. */
  function recordAttempt(kind: TestKind, scope: string, score: number, passed: boolean, now: Date) {
    const track = apiTrack()
    if (!track) return
    history = withLocalAttempt(history, { kind, track, scope, passed, share: score, at: now.toISOString() })
    publish()
    void reload()
  }

  async function markStep(slug: string, step: UnitProgressStep, field: keyof UnitProgress) {
    const track = apiTrack()
    if (!track || server[slug]?.[field]) return
    const gen = generation
    patchServerUnit(slug, (u) => ({ ...u, [field]: new Date().toISOString() }))
    try {
      const saved = await learnService.updateUnitProgress(course.unitType, slug, track, { step })
      if (gen !== generation) return
      server = { ...server, ...unitsBySlug([saved]) }
      publish()
    } catch {
      await reload()
    }
  }

  function patchLocalUnit(slug: string, patch: (u: LocalPathRecord['units'][string]) => LocalPathRecord['units'][string]) {
    commitLocal({ ...local, units: { ...local.units, [slug]: patch(local.units[slug] ?? {}) } })
  }

  return {
    getState(): LearningPathState {
      return state
    },

    subscribe(listener: Listener): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    /** Switches to the signed-in user (null for guests) and loads their path. */
    setUser(next: PathUser | null) {
      if (next?.userId === user?.userId && next?.verified === user?.verified) return
      generation += 1
      user = next
      server = {}
      history = []
      const key = localKey()
      local = key ? readLocal(key) : EMPTY_LOCAL_PATH
      publish()
      void reload()
    },

    /** Loads the server's units again, e.g. after a unit quiz was completed. */
    reload,

    /** The groups the course's skip tests cover, so passed skip tests can mark units tested out. */
    setScopes(next: CourseScopes) {
      scopes = next
      publish()
    },

    markWatched(unitId: string) {
      void markStep(unitId, 'watched', 'watchedAt')
    },

    /** Every character of the unit opened (the Learn step). */
    markTraced(unitId: string) {
      void markStep(unitId, 'traced', 'tracedAt')
    },

    markWritten(unitId: string) {
      void markStep(unitId, 'written', 'writtenAt')
    },

    markPractised(unitId: string) {
      void markStep(unitId, 'practised', 'practisedAt')
    },

    markPrinted(unitId: string, now = new Date()) {
      patchLocalUnit(unitId, (u) => ({ ...u, printedAt: now.toISOString() }))
    },

    /**
     * The server records unit quizzes when the test completes; this shows the
     * result at once and then reloads the server's numbers.
     */
    recordQuiz(unitId: string, score: number, passed: boolean, now = new Date()) {
      if (!apiTrack()) return
      patchServerUnit(unitId, (u) => ({
        ...u,
        quizBest: Math.max(u.quizBest ?? 0, score),
        quizPassedAt: u.quizPassedAt ?? (passed ? now.toISOString() : undefined),
      }))
      void reload()
    },

    /** The server records the final test when it completes; this shows the result at once. */
    recordFinalTest(score: number, passed: boolean, now = new Date()) {
      recordAttempt('final', 'all', score, passed, now)
    },

    /**
     * Result of a skip test, recorded by the server when it completes. A pass
     * marks every unit in `scope` as tested out (see setScopes).
     */
    recordSkipTest(scope: string, score: number, passed: boolean, now = new Date()) {
      recordAttempt('skip', scope, score, passed, now)
    },

    /** Puts a tested-out unit back into the normal step-by-step flow (on this device). */
    undoSkip(unitId: string, now = new Date()) {
      if (!state.units[unitId]?.skippedAt) return
      patchLocalUnit(unitId, (u) => ({ ...u, skipUndoneAt: now.toISOString() }))
    },

    /** The API has no place for the certificate name, so it stays on this device. */
    setCertificateName(name: string) {
      commitLocal({ ...local, certificateName: name })
    },
  }
}

const stores = new Map<string, LearningPathStore>()
let currentUser: PathUser | null = null

function storeFor(course: Course): LearningPathStore {
  let store = stores.get(course.id)
  if (!store) {
    store = createLearningPathStore(course)
    store.setUser(currentUser)
    stores.set(course.id, store)
  }
  return store
}

/** Call on sign-in, sign-out and email verification: every course's path follows the user. */
export function setPathUser(user: PathUser | null): void {
  currentUser = user
  stores.forEach((store) => store.setUser(user))
}

/** The path store for a kana script. */
export function getLearningPath(script: KanaScriptId): LearningPathStore {
  return storeFor({ id: script, unitType: 'kana', track: script })
}

/** One kanji level's path store (units, quizzes, test-outs, level test). */
export function getKanjiPath(level: KanjiLevelId): LearningPathStore {
  return storeFor({ id: `kanji-${level}`, unitType: 'kanji', track: kanjiTrack(level) })
}

/**
 * Hook point for a combined "Kana master" certificate: each script's final
 * test result, read from its own store.
 */
export function getFinalTests(scripts: readonly KanaScriptId[]): Partial<Record<KanaScriptId, FinalTestResult>> {
  return Object.fromEntries(scripts.map((id) => [id, getLearningPath(id).getState().finalTest]))
}
