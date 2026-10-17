import { progressService } from '@/api/services/progressService'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import type { LearningTrack } from '@/types/learn'

/**
 * Reviews due per day (today first, overdue included) from
 * GET /progress/forecast, for one track or all. Undefined for guests and
 * while the API does not serve it, so callers simply hide the chart.
 */
export function useReviewForecast(track?: LearningTrack, days = 7): number[] | undefined {
  const { user } = useAuth()
  const enabled = Boolean(user?.emailVerified)
  const { data } = useAsync(enabled ? `forecast-${user?.userId}-${track ?? 'all'}-${days}` : 'forecast-off', async () => {
    if (!enabled) return undefined
    const res = await progressService.getForecast(days)
    return res.days.map((d) => (track ? d.by_track[track] ?? 0 : d.total))
  })
  return data
}
