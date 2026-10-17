import { useEffect, useSyncExternalStore } from 'react'
import { getKanaProgress, masteryOf, type KanaProgressStore } from '@/api/services/kanaProgressService'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { DailyGoal, KanaMastery, KanaProgressState } from '@/types/kanaProgress'

/** The current script's progress store, for writes (markSeen, recordReview, …). */
export function useKanaProgressStore(): KanaProgressStore {
  return getKanaProgress(useKanaScript().id)
}

/** Live kana progress for the current script; re-renders whenever any kana's progress changes. */
export function useKanaProgress(): {
  state: KanaProgressState
  mastery: (id: string) => KanaMastery
} {
  const store = useKanaProgressStore()
  const state = useSyncExternalStore(store.subscribe, store.getState)
  return { state, mastery: (id: string) => masteryOf(state.items[id]) }
}

/**
 * Today's goal for the given chart order. The goal is created in an effect
 * (it writes to storage), so the first render may return undefined.
 */
export function useDailyGoal(orderedIds: string[]): DailyGoal | undefined {
  const store = useKanaProgressStore()
  const { state } = useKanaProgress()
  const key = orderedIds.join(',')

  useEffect(() => {
    if (orderedIds.length > 0) store.getDailyGoal(orderedIds)
    // `key` stands in for the array so a new array with the same ids is a no-op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, store])

  return state.goal
}
