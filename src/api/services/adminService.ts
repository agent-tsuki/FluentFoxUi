/**
 * Admin service: the signed-in user's permissions, the permission manager, and
 * the admin classes API (channels, courses, sync, history).
 * Every call is checked on the server; the UI only hides what it can't do.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type {
  AdminChannel,
  AdminCourse,
  ApiAdminChannel,
  ApiAdminCourse,
  ApiChangeLogEntry,
  ApiGrantRecord,
  ApiMyPermissions,
  ChangeLogEntry,
  ChannelOverrideField,
  ChannelTextUpdate,
  CourseInput,
  NewChannelInput,
  CourseVisibilityInput,
  GrantRecord,
  MyPermissions,
  NewGrantInput,
} from '@/types/admin'
import { shrinkImage } from '@/lib/profile/shrinkImage'
import {
  fromChannelUpdate,
  fromCourseInput,
  toAdminChannel,
  toAdminCourse,
  toChangeLogEntry,
  toGrantRecord,
  toMyPermissions,
} from './adminMappers'

const CHANNELS = '/admin/classes/channels'
const COURSES = '/admin/classes/courses'
const enc = encodeURIComponent

// ─── My permissions (cached per user) ────────────────────────────────────────
// The navbar and the admin layout both ask; one request serves both.

let permissionsCache: { userId: string; value: MyPermissions } | null = null
let permissionsInFlight: { userId: string; promise: Promise<MyPermissions> } | null = null
// Bumped on clear so every usePermissions() instance reloads (e.g. the navbar after an invite is accepted).
let permissionsVersion = 0
const permissionListeners = new Set<() => void>()

function isGrantRecord(r: GrantRecord | null): r is GrantRecord {
  return r !== null
}

export const adminService = {
  /** Cached value for `userId`, if already loaded (sync, for first-frame renders). */
  peekMyPermissions(userId: string): MyPermissions | undefined {
    return permissionsCache?.userId === userId ? permissionsCache.value : undefined
  },

  async getMyPermissions(userId: string): Promise<MyPermissions> {
    const cached = adminService.peekMyPermissions(userId)
    if (cached) return cached
    if (permissionsInFlight?.userId === userId) return permissionsInFlight.promise
    const promise = apiClient
      .get<ApiResponse<ApiMyPermissions>>('/admin/me/permissions')
      .then(res => {
        const value = toMyPermissions(res.data)
        permissionsCache = { userId, value }
        return value
      })
      .finally(() => {
        if (permissionsInFlight?.promise === promise) permissionsInFlight = null
      })
    permissionsInFlight = { userId, promise }
    return promise
  },

  /** Forget the cached permissions (after accepting an invite, or on sign-out). */
  clearMyPermissions(): void {
    permissionsCache = null
    permissionsInFlight = null
    permissionsVersion += 1
    permissionListeners.forEach(listener => listener())
  },

  /** For useSyncExternalStore: changes whenever the cached permissions are cleared. */
  getPermissionsVersion(): number {
    return permissionsVersion
  },

  subscribePermissions(listener: () => void): () => void {
    permissionListeners.add(listener)
    return () => permissionListeners.delete(listener)
  },

  // ─── Permission manager ────────────────────────────────────────────────────

  async listGrants(userEmail: string): Promise<GrantRecord[]> {
    const res = await apiClient.get<ApiResponse<ApiGrantRecord[] | null>>(`/admin/permissions?user_email=${enc(userEmail)}`)
    return (res.data ?? []).map(toGrantRecord).filter(isGrantRecord)
  },

  async addGrant(input: NewGrantInput): Promise<void> {
    await apiClient.post('/admin/permissions', {
      user_email:    input.userEmail.trim().toLowerCase(),
      permission:    input.permission,
      resource_type: input.resourceType,
      resource_id:   input.resourceType === '' ? '' : input.resourceId,
    })
  },

  async removeGrant(id: string): Promise<void> {
    await apiClient.delete(`/admin/permissions/${enc(id)}`)
  },

  // ─── Channels ─────────────────────────────────────────────────────────────

  async listChannels(): Promise<AdminChannel[]> {
    const res = await apiClient.get<ApiResponse<ApiAdminChannel[] | null>>(CHANNELS)
    return (res.data ?? []).map(toAdminChannel)
  },

  async getChannel(id: string): Promise<AdminChannel> {
    const res = await apiClient.get<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}`)
    return toAdminChannel(res.data)
  },

  /** Creates a hidden channel; the editor then syncs it from YouTube and publishes it. */
  async createChannel(input: NewChannelInput): Promise<AdminChannel> {
    const body: Record<string, unknown> = { slug: input.slug, platform: 'youtube', url: input.url, name: input.name }
    if (input.handle) body.handle = input.handle
    if (input.youtubeChannelId) body.youtube_channel_id = input.youtubeChannelId
    const res = await apiClient.post<ApiResponse<ApiAdminChannel>>(CHANNELS, body)
    return toAdminChannel(res.data)
  },

  async updateChannel(id: string, update: ChannelTextUpdate): Promise<AdminChannel> {
    const res = await apiClient.patch<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}`, fromChannelUpdate(update))
    return toAdminChannel(res.data)
  },

  async uploadChannelImage(id: string, kind: 'avatar' | 'banner', file: File): Promise<AdminChannel> {
    const image = await shrinkImage(file)
    const res = await apiClient.postBlob<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}/${kind}`, image)
    return toAdminChannel(res.data)
  },

  /** Accepts a YouTube video id or a full YouTube URL; the API extracts the id. */
  async setIntroVideo(id: string, videoIdOrUrl: string): Promise<AdminChannel> {
    const res = await apiClient.patch<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}/intro-video`, { video_id: videoIdOrUrl.trim() })
    return toAdminChannel(res.data)
  },

  /** "Reset to YouTube": clears the custom value so the synced one shows again. */
  async resetChannelField(id: string, field: ChannelOverrideField): Promise<AdminChannel> {
    const res = await apiClient.delete<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}/custom/${field}`)
    return toAdminChannel(res.data)
  },

  async setChannelPublished(id: string, isPublished: boolean): Promise<AdminChannel> {
    const res = await apiClient.patch<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}/visibility`, { is_published: isPublished })
    return toAdminChannel(res.data)
  },

  async syncChannel(id: string): Promise<AdminChannel> {
    const res = await apiClient.post<ApiResponse<ApiAdminChannel>>(`${CHANNELS}/${enc(id)}/sync`)
    return toAdminChannel(res.data)
  },

  async getChannelHistory(id: string): Promise<ChangeLogEntry[]> {
    const res = await apiClient.get<ApiResponse<ApiChangeLogEntry[] | null>>(`${CHANNELS}/${enc(id)}/history`)
    return (res.data ?? []).map(toChangeLogEntry)
  },

  // ─── Courses ──────────────────────────────────────────────────────────────

  async listCourses(channelId?: string): Promise<AdminCourse[]> {
    const query = channelId ? `?channel_id=${enc(channelId)}` : ''
    const res = await apiClient.get<ApiResponse<ApiAdminCourse[] | null>>(`${COURSES}${query}`)
    return (res.data ?? []).map(toAdminCourse)
  },

  async getCourse(id: string): Promise<AdminCourse> {
    const res = await apiClient.get<ApiResponse<ApiAdminCourse>>(`${COURSES}/${enc(id)}`)
    return toAdminCourse(res.data)
  },

  async createCourse(input: CourseInput): Promise<AdminCourse> {
    const res = await apiClient.post<ApiResponse<ApiAdminCourse>>(COURSES, fromCourseInput(input))
    return toAdminCourse(res.data)
  },

  async updateCourse(id: string, input: CourseInput): Promise<AdminCourse> {
    const res = await apiClient.patch<ApiResponse<ApiAdminCourse>>(`${COURSES}/${enc(id)}`, fromCourseInput(input))
    return toAdminCourse(res.data)
  },

  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`${COURSES}/${enc(id)}`)
  },

  async setCourseVisibility(id: string, input: CourseVisibilityInput): Promise<AdminCourse> {
    const body: Record<string, boolean> = { is_published: input.isPublished }
    if (input.isFeatured !== undefined) body.is_featured = input.isFeatured
    const res = await apiClient.patch<ApiResponse<ApiAdminCourse>>(`${COURSES}/${enc(id)}/visibility`, body)
    return toAdminCourse(res.data)
  },

  async syncPlaylist(id: string): Promise<AdminCourse> {
    const res = await apiClient.post<ApiResponse<ApiAdminCourse>>(`${COURSES}/${enc(id)}/sync-playlist`)
    return toAdminCourse(res.data)
  },
}
