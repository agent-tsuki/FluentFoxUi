import type { QuizConfigData, QuizCategory, QuizJlptLevel } from '@/types'
import { mockQuizConfig } from '@/api/mock/quiz'

// ─── Swap mock data for real fetch calls when API is ready ────────────────────

export const quizService = {
  getConfig: async (): Promise<QuizConfigData> => {
    return mockQuizConfig
  },

  startQuiz: async (config: {
    level: QuizJlptLevel
    category: QuizCategory
    selectedKanji: string[]
  }): Promise<{ success: boolean }> => {
    // Replace with: return fetch('/api/quiz/start', { method: 'POST', body: JSON.stringify(config) }).then(r => r.json())
    console.log('Starting quiz with config:', config)
    return { success: true }
  },
}
