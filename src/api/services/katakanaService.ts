import type { KanaSection } from '@/types'
import { mockKatakanaSections } from '@/api/mock/katakana'

// ─── Swap mock data for real fetch() calls when API is ready ──────────────────
// getSections: fetch('/api/kana/katakana/sections').then(r => r.json())

export const katakanaService = {
  getSections: async (): Promise<KanaSection[]> => {
    return mockKatakanaSections
  },
}
