/**
 * Data hooks for the admin screens. Each wraps a service call in the shared
 * async pattern (loading + error + refetch); the editable ones also let the
 * page apply each write's response without a reload.
 */
import { adminService } from '@/api/services/adminService'
import { inviteService } from '@/api/services/inviteService'
import { useAsync } from '@/hooks/useAsync'
import { useEditableAsync } from './useEditableAsync'

/** Channels the signed-in user may edit (all of them for global grants). */
export const useAdminChannels = () => useAsync('admin-channels', () => adminService.listChannels())

export const useAdminChannel = (id: string) => useEditableAsync(`admin-channel:${id}`, () => adminService.getChannel(id))

/** Bump `version` after a write to reload the history. */
export const useChannelHistory = (id: string, version = 0) =>
  useAsync(`admin-channel-history:${id}:${version}`, () => adminService.getChannelHistory(id))

export const useAdminCourses = (channelId?: string) =>
  useEditableAsync(`admin-courses:${channelId ?? ''}`, () => adminService.listCourses(channelId))

/** `id === 'new'` skips the request: the editor starts empty. */
export const useAdminCourse = (id: string) =>
  useEditableAsync(`admin-course:${id}`, () => (id === 'new' ? Promise.resolve(null) : adminService.getCourse(id)))

export const useInvites = () => useEditableAsync('admin-invites', () => inviteService.listInvites())

/** Grants for one user; an empty email skips the request. */
export const useUserGrants = (email: string) =>
  useEditableAsync(`admin-grants:${email}`, () => (email ? adminService.listGrants(email) : Promise.resolve([])))

export const useInvitePreview = (token: string) => useAsync(`invite:${token}`, () => inviteService.previewInvite(token))
