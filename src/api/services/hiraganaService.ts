import type { KanaSection } from '@/types'
import { mockHiraganaSections } from '@/api/mock/hiragana'

// ─── Swap mock data for real fetch() calls when API is ready ──────────────────
// getSections: fetch('/api/kana/hiragana/sections').then(r => r.json())

export const hiraganaService = {
  getSections: async (): Promise<KanaSection[]> => {
    return mockHiraganaSections
  },
}
