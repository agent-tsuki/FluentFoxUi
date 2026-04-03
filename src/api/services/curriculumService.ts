import type { CurriculumCardData } from '@/types'
import { mockCurriculumCards } from '@/api/mock/curriculum'

// ─── Swap mock data for real fetch calls when API is ready ────────────────────

export const curriculumService = {
  getCards: async (): Promise<CurriculumCardData[]> => {
    return mockCurriculumCards
  },
}
