import type { UserProfile, ProfileUpdatePayload } from '@/types'
import { mockUserProfile } from '@/api/mock/profile'

// ─── Swap mock calls for real fetch calls when API is ready ───────────────────

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    return mockUserProfile
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<{ success: boolean }> => {
    // Replace with: return fetch('/api/profile', { method: 'PATCH', body: JSON.stringify(payload) }).then(r => r.json())
    console.log('Updating profile:', payload)
    return { success: true }
  },
}
