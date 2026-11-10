import type { FooterLink } from '@/types'
import { mockFooterLinks } from '@/api/mock/navigation'

// ─── Swap mock data for real fetch calls when API is ready ────────────────────
// Example real implementation:
//   const res = await fetch('/api/navigation')
//   return res.json()

export const navigationService = {
  getFooterLinks: async (): Promise<FooterLink[]> => {
    return mockFooterLinks
  },
}
