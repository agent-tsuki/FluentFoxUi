import type { NavItem, FooterLink } from '@/types'
import { mockNavItems, mockFooterLinks } from '@/api/mock/navigation'

// ─── Swap mock data for real fetch calls when API is ready ────────────────────
// Example real implementation:
//   const res = await fetch('/api/navigation')
//   return res.json()

export const navigationService = {
  getNavItems: async (): Promise<NavItem[]> => {
    return mockNavItems
  },

  getFooterLinks: async (): Promise<FooterLink[]> => {
    return mockFooterLinks
  },
}
