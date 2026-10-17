import type { KanaMastery } from '@/types/kanaProgress'

const neutral = (_id: string): KanaMastery => 'new'

/**
 * Kana mastery for the chart and unit colours. Mastery needs card stability
 * from the progress API (phase 6), which is not served yet, so every kana
 * shows as new until then.
 */
export function useKanaMastery(): (id: string) => KanaMastery {
  return neutral
}
