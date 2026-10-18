/**
 * Profile service: GET/PATCH /profile, avatars and signed-in devices.
 * Maps the API's snake_case into the camelCase domain types the UI uses.
 */
import { apiClient } from '@/api/client'
import type {
  ApiAvatar,
  ApiProfile,
  ApiProfileUpdate,
  ApiResponse,
  ApiSession,
  MessageApiResponse,
} from '@/types/api'
import type { DeviceSession, JlptLevel, ProfileAvatar, ProfileUpdatePayload, UserProfile } from '@/types'
import { shrinkImage } from '@/lib/profile/shrinkImage'

function toAvatar(a: ApiAvatar): ProfileAvatar {
  return { kind: a.kind, presetId: a.preset_id ?? null, url: a.url }
}

function toSession(s: ApiSession): DeviceSession {
  return {
    id:         s.id,
    browser:    s.browser,
    os:         s.os,
    deviceType: s.device_type,
    ipApprox:   s.ip_approx,
    location: {
      countryCode: s.location.country_code,
      region:      s.location.region,
      city:        s.location.city,
      latitude:    s.location.latitude,
      longitude:   s.location.longitude,
      source:      s.location.source,
      accuracyM:   s.location.accuracy_m,
    },
    isVpn:      s.is_vpn,
    isCurrent:  s.is_current,
    createdAt:  s.created_at,
    lastUsedAt: s.last_used_at,
  }
}

function toProfile(p: ApiProfile): UserProfile {
  return {
    id:             p.user_id,
    username:       p.username,
    email:          p.email,
    firstName:      p.first_name,
    lastName:       p.last_name ?? '',
    bio:            p.bio ?? '',
    nativeLanguage: p.native_language,
    countryCode:    p.country_code ?? '',
    city:           p.city ?? '',
    targetLevel:    (p.target_level as JlptLevel | null) ?? null,
    timeZone:       p.time_zone ?? '',
    dailyReminder:  p.daily_reminder,
    reminderTime:   p.reminder_time ?? '',
    avatar:         toAvatar(p.avatar),
    joinedAt:       p.joined_at,
    lastLoginAt:    p.last_login_at,
    lastLogin:      p.last_login ? toSession(p.last_login) : null,
  }
}

function toUpdate(p: ProfileUpdatePayload): ApiProfileUpdate {
  return {
    first_name:      p.firstName,
    last_name:       p.lastName,
    bio:             p.bio,
    native_language: p.nativeLanguage,
    country_code:    p.countryCode,
    city:            p.city,
    target_level:    p.targetLevel,
    time_zone:       p.timeZone,
    avatar_preset:   p.avatarPreset,
  }
}

export interface LocationUpdate {
  latitude:  number
  longitude: number
  accuracyM: number
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<ApiProfile>>('/profile')
    return toProfile(res.data)
  },

  /** Returns the saved profile, so the UI shows exactly what the server stored. */
  async updateProfile(payload: ProfileUpdatePayload): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<ApiProfile>>('/profile', toUpdate(payload))
    return toProfile(res.data)
  },

  async uploadAvatar(file: File): Promise<ProfileAvatar> {
    const image = await shrinkImage(file)
    const res = await apiClient.putBlob<ApiResponse<ApiAvatar>>('/profile/avatar', image)
    return toAvatar(res.data)
  },

  /** Drops the user's own choice: the Google/X picture or the default shows again. */
  async removeAvatar(): Promise<ProfileAvatar> {
    const res = await apiClient.delete<ApiResponse<ApiAvatar>>('/profile/avatar')
    return toAvatar(res.data)
  },

  async listSessions(): Promise<DeviceSession[]> {
    const res = await apiClient.get<ApiResponse<ApiSession[]>>('/profile/sessions')
    return res.data.map(toSession)
  },

  async revokeSession(id: string): Promise<void> {
    await apiClient.delete<MessageApiResponse>(`/profile/sessions/${encodeURIComponent(id)}`)
  },

  async revokeOtherSessions(): Promise<number> {
    const res = await apiClient.post<ApiResponse<{ revoked: number }>>('/profile/sessions/revoke-others')
    return res.data.revoked
  },

  async updateCurrentLocation(location: LocationUpdate): Promise<DeviceSession> {
    const res = await apiClient.put<ApiResponse<ApiSession>>('/profile/sessions/current/location', {
      latitude:   location.latitude,
      longitude:  location.longitude,
      accuracy_m: location.accuracyM,
    })
    return toSession(res.data)
  },
}
