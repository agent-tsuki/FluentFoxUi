/**
 * `/profile/tutorials` API client: which in-app tutorials the signed-in,
 * verified user has skipped or finished. Maps snake_case to the domain type.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { TutorialKey, TutorialState, TutorialStatus, TutorialUpdate } from '@/types/tutorial'

interface ApiTutorial {
  key: TutorialKey
  status: TutorialStatus
  version: number
  last_step: number | null
  completed_at: string | null
  updated_at: string | null
}

function toTutorial(t: ApiTutorial): TutorialState {
  return {
    key: t.key,
    status: t.status,
    version: t.version,
    lastStep: t.last_step,
    completedAt: t.completed_at,
    updatedAt: t.updated_at,
  }
}

export const tutorialService = {
  async list(): Promise<TutorialState[]> {
    const res = await apiClient.get<ApiResponse<{ tutorials: ApiTutorial[] }>>('/profile/tutorials')
    return res.data.tutorials.map(toTutorial)
  },

  async update(key: TutorialKey, update: TutorialUpdate): Promise<TutorialState> {
    const res = await apiClient.put<ApiResponse<ApiTutorial>>(`/profile/tutorials/${encodeURIComponent(key)}`, {
      status: update.status,
      version: update.version,
      last_step: update.lastStep,
    })
    return toTutorial(res.data)
  },
}
