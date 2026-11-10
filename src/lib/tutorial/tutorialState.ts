import type { TutorialState, TutorialStatus, TutorialUpdate } from '@/types/tutorial'

/** Bump when the welcome tour changes enough that everyone should see it again. */
export const WELCOME_VERSION = 1

const STATUSES: readonly TutorialStatus[] = ['pending', 'skipped', 'completed']

/** What this device last recorded, kept so a failed save never shows the tour twice. */
export interface LocalTutorialRecord {
  status: TutorialStatus
  version: number
  lastStep?: number
  /** False until the API accepted it; retried on the next load. */
  synced: boolean
}

export function parseLocalRecord(raw: string | null): LocalTutorialRecord | null {
  if (!raw) return null
  try {
    const v: unknown = JSON.parse(raw)
    if (typeof v !== 'object' || v === null) return null
    const r = v as Record<string, unknown>
    if (!STATUSES.includes(r.status as TutorialStatus) || typeof r.version !== 'number') return null
    return {
      status: r.status as TutorialStatus,
      version: r.version,
      lastStep: typeof r.lastStep === 'number' ? r.lastStep : undefined,
      synced: r.synced === true,
    }
  } catch {
    return null
  }
}

/**
 * The status to act on: an unsynced local write is newer than the server's
 * answer (the PUT failed after the learner skipped), so it wins.
 */
export function effectiveStatus(server: TutorialState | null, local: LocalTutorialRecord | null): TutorialUpdate | null {
  if (local && !local.synced) return { status: local.status, version: local.version, lastStep: local.lastStep }
  if (server) return { status: server.status, version: server.version, lastStep: server.lastStep ?? undefined }
  return null
}

/** Show when pending, or when what was skipped or finished was an older tour. */
export function shouldShow(state: TutorialUpdate | null, version: number = WELCOME_VERSION): boolean {
  if (!state) return false
  return state.status === 'pending' || state.version < version
}
