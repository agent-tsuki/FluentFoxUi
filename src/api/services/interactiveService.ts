import type { DragWidgetData, NewsletterData } from '@/types'
import { mockDragWidget, mockNewsletter } from '@/api/mock/interactive'

// ─── Swap mock data for real fetch calls when API is ready ────────────────────

export const interactiveService = {
  getDragWidget: async (): Promise<DragWidgetData> => {
    return mockDragWidget
  },

  getNewsletterConfig: async (): Promise<NewsletterData> => {
    return mockNewsletter
  },

  subscribeNewsletter: async (email: string): Promise<{ success: boolean }> => {
    // Replace with: return fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }).then(r => r.json())
    console.log('Subscribing email:', email)
    return { success: true }
  },
}
