import type { FlashCardData } from '@/types'
import { mockFlashCards } from '@/api/mock/flashcard'

// ─── Swap mock data for real fetch calls when API is ready ────────────────────

export const flashcardService = {
  getAll: async (): Promise<FlashCardData[]> => {
    return mockFlashCards
  },

  getById: async (id: string): Promise<FlashCardData | undefined> => {
    return mockFlashCards.find((card) => card.id === id)
  },
}
