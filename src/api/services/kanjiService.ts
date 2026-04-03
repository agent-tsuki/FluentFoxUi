import type { KanjiGroup } from '@/types'
import { mockKanjiGroups } from '@/api/mock/kanji'

// ─── Swap mock data for real fetch() calls when API is ready ──────────────────
// getGroups: fetch('/api/kana/kanji/groups').then(r => r.json())
// getByLevel: fetch(`/api/kana/kanji/${level}`).then(r => r.json())

export const kanjiService = {
  getGroups: async (): Promise<KanjiGroup[]> => {
    return mockKanjiGroups
  },

  getByLevel: async (level: string): Promise<KanjiGroup | undefined> => {
    return mockKanjiGroups.find((g) => g.level === level)
  },
}
