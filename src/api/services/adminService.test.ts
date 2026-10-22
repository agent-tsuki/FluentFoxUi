import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiAdminChannel, ApiAdminCourse } from '@/types/admin'

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), postBlob: vi.fn() }))
vi.mock('@/api/client', () => ({ apiClient: api }))

import { adminService } from './adminService'
import { inviteService } from './inviteService'
import { fromChannelUpdate, fromCourseInput, toAdminChannel, toGrants } from './adminMappers'

const field = (youtube: string | null, custom: string | null) => ({ youtube, custom, effective: custom ?? youtube })

const channel: ApiAdminChannel = {
  id: 'ch-1', slug: 'misa', platform: 'youtube', url: 'https://youtube.com/@misa', handle: '@misa',
  youtube_channel_id: 'UC1', subscriber_count: 660000, video_count: 400, accent_color: '#E53935',
  teaching_style: 'Energetic', best_for: ['Beginners'], not_for: null, pros: ['Clear'], cons: [], verdict: null,
  is_published: true, last_synced_at: '2026-10-01T00:00:00Z',
  fields: {
    name: field('Japanese Ammo', 'Misa'), avatar_url: field('https://yt/a.jpg', null),
    banner_url: field(null, null), description: field('From YT', null), intro_video_id: field('abc', null),
  },
}

const course: ApiAdminCourse = {
  id: 'co-1', slug: 'n5', channel_id: 'ch-1', title: 'N5', summary: null, level: 'N5', platform: 'youtube',
  url: 'https://youtube.com/playlist?list=PL1', playlist_id: 'PL1', thumbnail_url: null, is_free: true, price_note: null,
  tags: ['Grammar'], what_you_learn: null, curriculum: [{ title: 'Intro', topics: null }], total_duration_sec: 3600,
  videos: [{}, {}], is_published: false, is_featured: true, sort_order: 2, last_synced_at: null, channel: { name: 'Misa' },
}

beforeEach(() => {
  vi.clearAllMocks()
  adminService.clearMyPermissions()
})

describe('mappers', () => {
  it('maps an admin channel, defaulting null lists and keeping override sources', () => {
    const c = toAdminChannel(channel)
    expect(c.fields.name).toEqual({ youtube: 'Japanese Ammo', custom: 'Misa', effective: 'Misa' })
    expect(c.notFor).toEqual([])
    expect(c.verdict).toBe('')
    expect(c.youtubeChannelId).toBe('UC1')
  })

  it('falls back to top-level effective values when `fields` is missing', () => {
    const c = toAdminChannel({ ...channel, fields: undefined, name: 'Top' })
    expect(c.fields.name).toEqual({ youtube: null, custom: null, effective: 'Top' })
  })

  it('drops unknown permissions and normalises resource types', () => {
    expect(toGrants([
      { permission: 'classes.sync', resource_type: 'channel', resource_id: 'ch-1' },
      { permission: 'future.perm', resource_type: '', resource_id: '' },
      { permission: 'classes.publish', resource_type: 'weird', resource_id: 'x' },
    ])).toEqual([
      { permission: 'classes.sync', resourceType: 'channel', resourceId: 'ch-1' },
      { permission: 'classes.publish', resourceType: '', resourceId: 'x' },
    ])
  })

  it('sends only the channel keys that were set, in snake_case', () => {
    expect(fromChannelUpdate({ teachingStyle: 'Calm', bestFor: ['A'] })).toEqual({ teaching_style: 'Calm', best_for: ['A'] })
  })

  it('sends empty optional course strings as null', () => {
    const body = fromCourseInput({
      channelId: 'ch-1', slug: ' n5 ', title: 'N5', summary: '', level: 'N5', platform: 'udemy', url: 'u',
      playlistId: '  ', thumbnailUrl: '', isFree: false, priceNote: '$10', tags: [], whatYouLearn: [], curriculum: [], sortOrder: 1,
    })
    expect(body).toMatchObject({ slug: 'n5', playlist_id: null, thumbnail_url: null, channel_id: 'ch-1', is_free: false })
  })
})

describe('adminService', () => {
  it('caches my permissions per user and reloads after clear', async () => {
    api.get.mockResolvedValue({ status: 'success', data: { is_super_admin: false, grants: [{ permission: 'classes.sync', resource_type: '', resource_id: '' }] } })
    const first = await adminService.getMyPermissions('u1')
    await adminService.getMyPermissions('u1')
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(first.grants[0]).toEqual({ permission: 'classes.sync', resourceType: '', resourceId: '' })
    expect(adminService.peekMyPermissions('u2')).toBeUndefined()
    const version = adminService.getPermissionsVersion()
    adminService.clearMyPermissions()
    expect(adminService.getPermissionsVersion()).toBe(version + 1)
    await adminService.getMyPermissions('u1')
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('maps courses, including channel name and video count', async () => {
    api.get.mockResolvedValue({ status: 'success', data: [course] })
    const [c] = await adminService.listCourses('ch-1')
    expect(api.get).toHaveBeenCalledWith('/admin/classes/courses?channel_id=ch-1')
    expect(c).toMatchObject({ channelName: 'Misa', videoCount: 2, summary: '', priceNote: '', isFeatured: true })
    expect(c.curriculum).toEqual([{ title: 'Intro', topics: [] }])
  })

  it('sends visibility with is_featured only when given', async () => {
    api.patch.mockResolvedValue({ status: 'success', data: course })
    await adminService.setCourseVisibility('co-1', { isPublished: true })
    expect(api.patch).toHaveBeenCalledWith('/admin/classes/courses/co-1/visibility', { is_published: true })
  })

  it('resets a custom field via DELETE …/custom/{field}', async () => {
    api.delete.mockResolvedValue({ status: 'success', data: channel })
    await adminService.resetChannelField('ch-1', 'intro_video_id')
    expect(api.delete).toHaveBeenCalledWith('/admin/classes/channels/ch-1/custom/intro_video_id')
  })

  it('adds a grant with a lowercased email and blank id for global scope', async () => {
    api.post.mockResolvedValue({})
    await adminService.addGrant({ userEmail: ' T@Ex.com ', permission: 'classes.sync', resourceType: '', resourceId: 'ignored' })
    expect(api.post).toHaveBeenCalledWith('/admin/permissions', { user_email: 't@ex.com', permission: 'classes.sync', resource_type: '', resource_id: '' })
  })
})

describe('inviteService', () => {
  it('maps an invite preview with resource names', async () => {
    api.get.mockResolvedValue({ status: 'success', data: {
      email_masked: 'm***@gmail.com', status: 'pending', expires_at: '2026-10-29T00:00:00Z',
      grants: [{ permission: 'classes.channel.edit', resource_type: 'channel', resource_id: 'ch-1', resource_name: 'Misa' }],
    } })
    const p = await inviteService.previewInvite('tok/en')
    expect(api.get).toHaveBeenCalledWith('/invites/tok%2Fen')
    expect(p).toEqual({
      emailMasked: 'm***@gmail.com', status: 'pending', expiresAt: '2026-10-29T00:00:00Z',
      grants: [{ permission: 'classes.channel.edit', resourceType: 'channel', resourceId: 'ch-1', resourceName: 'Misa' }],
    })
  })

  it('creates an invite with snake_case grants', async () => {
    api.post.mockResolvedValue({ status: 'success', data: { id: 'i1', email: 'a@b.co', status: 'pending', grants: null, invited_by: null, expires_at: 'x', accepted_at: null, created_at: 'y' } })
    const invite = await inviteService.createInvite({ email: 'A@B.co', grants: [{ permission: 'classes.sync', resourceType: 'channel', resourceId: 'ch-1' }] })
    expect(api.post).toHaveBeenCalledWith('/admin/invites', { email: 'a@b.co', grants: [{ permission: 'classes.sync', resource_type: 'channel', resource_id: 'ch-1' }] })
    expect(invite.grants).toEqual([])
  })
})
