import type { KanaScriptId } from '@/lib/content/kana/scriptIds'
import type { KanjiLevelId } from '@/types/kanji'
import type { LearningTrack, UnitProgressStep, UnitType } from '@/types/learn'
import type { FinalTestResult, LearningPathState, LocalPathRecord, UnitProgress } from '@/types/learningPath'
import { learnService } from '@/api/services/learnService'
import { kanjiTrack } from '@/lib/learn/practiceSession'
import { EMPTY_LOCAL_PATH, mergePath, parseLocalPath, unitsBySlug } from '@/lib/learn/unitProgress'

export type { FinalTestResult, LearningPathState, SkipTestBest, UnitProgress, UnitStep } from '@/types/learningPath'

// One store per course (kana script or kanji level). Unit steps and quiz
// results live on the learn API (GET /learn/units, PUT .../progress; quizzes
// are recorded by the server when a test completes). Printing, tested-out
// units, test bests and the certificate name have no API yet, so they are
// kept in this browser under the signed-in user's id. Guests get an empty
// path and nothing is stored for them.

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
  let local: LocalPathRecord = EMPTY_LOCAL_PATH
  let state: LearningPathState = EMPTY
  // Bumped on every user change so a late response for the previous user is dropped.
  let generation = 0

  const localKey = () => (user ? `${LOCAL_KEY_PREFIX}:${user.userId}:${course.id}` : null)
  const apiTrack = () => (user?.verified ? course.track : null)

  function publish() {
    state = mergePath(server, local)
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
    try {
      const units = await learnService.getUnits(track)
      if (gen !== generation) return
      server = unitsBySlug(units)
      publish()
    } catch {
      /* the path shows what it had; the next page visit loads again */
    }
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
      const key = localKey()
      local = key ? readLocal(key) : EMPTY_LOCAL_PATH
      publish()
      void reload()
    },

    /** Loads the server's units again, e.g. after a unit quiz was completed. */
    reload,

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

    recordFinalTest(score: number, passed: boolean, now = new Date()) {
      const prev = local.finalTest
      const finalTest: FinalTestResult = {
        ...prev,
        best: Math.max(prev?.best ?? 0, score),
        passedAt: prev?.passedAt ?? (passed ? now.toISOString() : undefined),
      }
      commitLocal({ ...local, finalTest })
    },

    /**
     * Result of a skip test. `passedUnitIds` are marked as tested out (already
     * skipped units keep their date); units not passed are left as they were.
     */
    recordSkipTest(scope: string, score: number, passedUnitIds: string[], now = new Date()) {
      const units = { ...local.units }
      for (const id of passedUnitIds) {
        units[id] = { ...units[id], skippedAt: units[id]?.skippedAt ?? now.toISOString() }
      }
      const skipTests = { ...local.skipTests, [scope]: Math.max(local.skipTests?.[scope] ?? 0, score) }
      commitLocal({ ...local, units, skipTests })
    },

    /** Puts a tested-out unit back into the normal step-by-step flow. */
    undoSkip(unitId: string) {
      if (!local.units[unitId]?.skippedAt) return
      patchLocalUnit(unitId, ({ skippedAt: _skipped, ...rest }) => rest)
    },

    setCertificateName(name: string) {
      commitLocal({ ...local, finalTest: { best: local.finalTest?.best ?? 0, ...local.finalTest, certificateName: name } })
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
