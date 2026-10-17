/**
 * `/progress/*` API client (backend plan §7.4). Login and a verified email
 * are required. Methods unwrap the `{status, data}` envelope.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { LearningTrack, SrsItemType } from '@/types/learn'
import type {
  ConfusionsResponse,
  ItemHistory,
  ProgressCalendar,
  ProgressDashboard,
  ProgressForecast,
  ProgressOverview,
  WeakGroupsResponse,
  WeakItemsResponse,
} from '@/types/progress'

type QueryValue = string | number | undefined

/** Builds `path?a=1&b=2`, skipping undefined values. */
function withQuery(path: string, params: Record<string, QueryValue>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}

async function get<T>(path: string): Promise<T> {
  return (await apiClient.get<ApiResponse<T>>(path)).data
}

export interface CalendarRange {
  /** Local dates, YYYY-MM-DD. */
  from?: string
  to?: string
}

export const progressService = {
  getOverview(): Promise<ProgressOverview> {
    return get('/progress/overview')
  },

  getForecast(days?: number): Promise<ProgressForecast> {
    return get(withQuery('/progress/forecast', { days }))
  },

  getCalendar(range: CalendarRange = {}): Promise<ProgressCalendar> {
    return get(withQuery('/progress/calendar', { from: range.from, to: range.to }))
  },

  async getWeakItems(track?: LearningTrack, limit?: number): Promise<WeakItemsResponse['items']> {
    return (await get<WeakItemsResponse>(withQuery('/progress/weak', { track, limit }))).items
  },

  async getWeakGroups(track?: LearningTrack): Promise<WeakGroupsResponse['groups']> {
    return (await get<WeakGroupsResponse>(withQuery('/progress/weak-groups', { track }))).groups
  },

  async getConfusions(track?: LearningTrack, limit?: number): Promise<ConfusionsResponse['pairs']> {
    return (await get<ConfusionsResponse>(withQuery('/progress/confusions', { track, limit }))).pairs
  },

  getItemHistory(itemType: SrsItemType, itemId: string): Promise<ItemHistory> {
    return get(`/progress/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}`)
  },

  getDashboard(): Promise<ProgressDashboard> {
    return get('/progress/dashboard')
  },
}
