import { useCallback, useState } from 'react'
import { learnService } from '@/api/services/learnService'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import { invalidateLearnSummary } from '@/hooks/useLearnSummary'
import type { LearningSettings, LearningSettingsUpdate } from '@/types/learn'

export interface LearningSettingsState {
  settings: LearningSettings | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
  /** PUTs the changed fields; resolves with the server's copy. */
  save: (update: LearningSettingsUpdate) => Promise<LearningSettings>
}

/**
 * GET / PUT /learn/settings for the signed-in, verified learner. A save
 * replaces the loaded copy and reloads the learn summary, whose goal and
 * daily limits depend on these settings.
 */
export function useLearningSettings(): LearningSettingsState {
  const { user } = useAuth()
  const enabled = Boolean(user?.emailVerified)
  const key = enabled ? `learn-settings-${user?.userId}` : 'learn-settings-off'
  // Tagged with the key so a save never leaks into another user's view.
  const [saved, setSaved] = useState<{ key: string; value: LearningSettings } | undefined>()
  const { data, isLoading, error, refetch } = useAsync(key, () =>
    enabled ? learnService.getSettings() : Promise.resolve(undefined),
  )

  const save = useCallback(async (update: LearningSettingsUpdate) => {
    const next = await learnService.updateSettings(update)
    setSaved({ key, value: next })
    invalidateLearnSummary()
    return next
  }, [key])

  const settings = saved?.key === key ? saved.value : data
  return { settings, isLoading: enabled && isLoading, error, refetch, save }
}
