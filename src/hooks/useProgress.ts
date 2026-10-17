import { useMemo } from 'react'
import { progressService, type CalendarRange } from '@/api/services/progressService'
import { useAuth } from '@/context/AuthContext'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import { useLearnDataVersion } from '@/hooks/useLearnSummary'
import { levelsByChar } from '@/lib/learn/mastery'
import type { LearningTrack, SrsItemType } from '@/types/learn'
import type {
  ConfusionPair,
  ItemHistory,
  MasteryLevel,
  ProgressCalendar,
  ProgressDashboard,
  ProgressForecast,
  ProgressOverview,
  WeakGroup,
  WeakItem,
} from '@/types/progress'

/**
 * Progress API hooks (GET /progress/*). Guests and unverified users never
 * call the API: `data` stays undefined and nothing loads. Every key carries
 * the learn data version, so views reload after a session completes.
 */

function useProgressKey(name: string): string | null {
  const { user } = useAuth()
  const version = useLearnDataVersion()
  return user?.emailVerified ? `${name}-${user.userId}-${version}` : null
}

function useProgressAsync<T>(name: string, load: () => Promise<T>, peek?: (key: string) => T | undefined): AsyncState<T> {
  const key = useProgressKey(name)
  const state = useAsync<T | undefined>(
    key ?? `${name}-off`,
    () => (key ? load() : Promise.resolve(undefined)),
    key && peek ? () => peek(key) : undefined,
  )
  return { ...state, data: state.data ?? undefined, isLoading: key !== null && state.isLoading }
}

// The overview feeds the navbar, charts, course headers and the dashboard at
// once; one request per user and data version serves them all.
const overviewCache = new Map<string, Promise<ProgressOverview>>()
const overviewData = new Map<string, ProgressOverview>()

function loadOverview(key: string): Promise<ProgressOverview> {
  let load = overviewCache.get(key)
  if (!load) {
    load = progressService.getOverview().then((data) => {
      overviewData.set(key, data)
      return data
    })
    overviewCache.set(key, load)
    load.catch(() => overviewCache.delete(key))
  }
  return load
}

export function useProgressOverview(): AsyncState<ProgressOverview> {
  const key = useProgressKey('overview')
  return useProgressAsync('overview', () => loadOverview(key ?? ''), (k) => overviewData.get(k))
}

const NEW_LEVEL = (): MasteryLevel => 'new'

/**
 * One track's item levels by character (kana or kanji), for chart colours
 * and kanji stages. Every item reads New while loading, for guests, and
 * while the overview has no per-item list.
 */
export function useItemLevels(track: LearningTrack | null): (char: string) => MasteryLevel {
  const { data } = useProgressOverview()
  const items = track ? data?.tracks.find((t) => t.track === track)?.items : undefined
  return useMemo(() => {
    if (!items) return NEW_LEVEL
    const map = levelsByChar(items)
    return (char: string) => map.get(char) ?? 'new'
  }, [items])
}

export function useProgressForecast(days: number): AsyncState<ProgressForecast> {
  return useProgressAsync(`forecast-${days}`, () => progressService.getForecast(days))
}

export function useProgressCalendar(range: CalendarRange = {}): AsyncState<ProgressCalendar> {
  return useProgressAsync(`calendar-${range.from ?? ''}-${range.to ?? ''}`, () => progressService.getCalendar(range))
}

export function useWeakItems(track?: LearningTrack, limit?: number): AsyncState<WeakItem[]> {
  return useProgressAsync(`weak-${track ?? 'all'}-${limit ?? ''}`, () => progressService.getWeakItems(track, limit))
}

export function useWeakGroups(track?: LearningTrack): AsyncState<WeakGroup[]> {
  return useProgressAsync(`weak-groups-${track ?? 'all'}`, () => progressService.getWeakGroups(track))
}

export function useConfusions(track?: LearningTrack, limit?: number): AsyncState<ConfusionPair[]> {
  return useProgressAsync(`confusions-${track ?? 'all'}-${limit ?? ''}`, () => progressService.getConfusions(track, limit))
}

export function useItemHistory(itemType: SrsItemType, id: string, track?: LearningTrack): AsyncState<ItemHistory> {
  return useProgressAsync(`item-${itemType}-${id}-${track ?? ''}`, () => progressService.getItemHistory(itemType, id, track))
}

export function useProgressDashboard(): AsyncState<ProgressDashboard> {
  return useProgressAsync('dashboard', () => progressService.getDashboard())
}
