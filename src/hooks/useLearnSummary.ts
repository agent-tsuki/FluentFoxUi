import { useSyncExternalStore } from 'react'
import { learnService } from '@/api/services/learnService'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import type { LearnSummary, LearningTrack } from '@/types/learn'

let version = 0
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Call after a session completes so due badges reload. */
export function invalidateLearnSummary(): void {
  version += 1
  listeners.forEach((listener) => listener())
}

export interface LearnSummaryState {
  /** Undefined for guests, unverified users, while loading, or when the API failed. */
  summary: LearnSummary | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * GET /learn/summary for the signed-in, verified learner (optionally one
 * track). Guests never call the API: the summary needs login.
 */
export function useLearnSummary(track?: LearningTrack): LearnSummaryState {
  const { user } = useAuth()
  const current = useSyncExternalStore(subscribe, () => version)
  const enabled = Boolean(user?.emailVerified)
  const key = enabled ? `learn-summary-${user?.userId}-${track ?? 'all'}-${current}` : 'learn-summary-off'
  const { data, isLoading, error, refetch } = useAsync(key, () =>
    enabled ? learnService.getSummary(track) : Promise.resolve(undefined),
  )
  return { summary: data, isLoading: enabled && isLoading, error, refetch }
}
