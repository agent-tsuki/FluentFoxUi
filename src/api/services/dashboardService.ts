import type { DashboardData } from '@/types'
import { mockDashboardData } from '@/api/mock/dashboard'

// ─── Swap mock calls for real fetch calls when API is ready ───────────────────

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    return mockDashboardData
  },
}
