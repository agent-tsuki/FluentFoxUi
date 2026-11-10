/**
 * The welcome tour's state for the signed-in user: loaded once per user from
 * the API, written optimistically (local copy first, then PUT). A failed PUT
 * is kept on this device and retried on the next load, so a learner who
 * skipped never sees the tour again because of a network blip.
 */
import { create } from 'zustand'
import { tutorialService } from '@/api/services/tutorialService'
import type { TutorialStatus, TutorialUpdate } from '@/types/tutorial'
import { WELCOME_VERSION, effectiveStatus, parseLocalRecord, type LocalTutorialRecord } from '@/lib/tutorial/tutorialState'

const KEY = 'welcome'
const localKey = (userId: string) => `ff-tutorial:${userId}:${KEY}`

function readLocal(userId: string): LocalTutorialRecord | null {
  try {
    return parseLocalRecord(localStorage.getItem(localKey(userId)))
  } catch {
    return null
  }
}

function writeLocal(userId: string, record: LocalTutorialRecord): void {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(record))
  } catch {
    /* storage blocked: the API write still records it */
  }
}

interface TutorialStore {
  userId: string | null
  /** Null until loaded, or when the API could not say (then the tour stays hidden). */
  welcome: TutorialUpdate | null
  /** Opened on purpose (Settings → Replay, or ?tour=welcome): shows whatever the status. */
  replaying: boolean
  load: (userId: string) => Promise<void>
  reset: () => void
  record: (status: Exclude<TutorialStatus, 'pending'>, lastStep: number) => void
  replay: () => void
}

let generation = 0

export const useTutorialStore = create<TutorialStore>((set, get) => {
  async function send(userId: string, update: TutorialUpdate) {
    try {
      await tutorialService.update(KEY, update)
      if (get().userId === userId) writeLocal(userId, { ...update, synced: true })
    } catch {
      /* stays unsynced; load() retries it */
    }
  }

  return {
    userId: null,
    welcome: null,
    replaying: false,

    async load(userId) {
      const gen = ++generation
      const local = readLocal(userId)
      // Show what this device knows at once; the server answer refines it.
      set({ userId, welcome: local && !local.synced ? effectiveStatus(null, local) : null, replaying: false })
      if (local && !local.synced) void send(userId, { status: local.status, version: local.version, lastStep: local.lastStep })
      try {
        const server = (await tutorialService.list()).find((t) => t.key === KEY) ?? null
        if (gen !== generation) return
        set({ welcome: effectiveStatus(server, readLocal(userId)) })
      } catch {
        /* API without the endpoint or offline: keep the tour hidden rather than nag */
      }
    },

    reset() {
      generation += 1
      set({ userId: null, welcome: null, replaying: false })
    },

    record(status, lastStep) {
      const { userId } = get()
      if (!userId) return
      const update: TutorialUpdate = { status, version: WELCOME_VERSION, lastStep }
      writeLocal(userId, { ...update, synced: false })
      set({ welcome: update, replaying: false })
      void send(userId, update)
    },

    replay() {
      set({ replaying: true })
    },
  }
})
