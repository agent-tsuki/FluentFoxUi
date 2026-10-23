import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/errors'
import {
  classesQuery,
  classesService,
  isClassNotFound,
  peekClasses,
  toClassesList,
  toCourseDetail,
} from '@/api/services/classesService'
import type { ApiClassCourseCard, ApiClassCourseDetail, ApiClassesList } from '@/types/api'

const api = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/api/client', () => ({ apiClient: api }))


const card: ApiClassCourseCard = {
  slug: 'misa-n5-complete',
  title: 'Complete N5',
  summary: 'Beginner course',
  level: 'N5',
  platform: 'youtube',
  is_free: true,
  is_featured: false,
  thumbnail_url: 'https://i.ytimg.com/vi/x/hq.jpg',
  video_count: 180,
  total_duration_sec: 36000,
  tags: ['Grammar'],
  channel: { slug: 'misa', name: 'Japanese Ammo with Misa', avatar_url: 'https://a', accent_color: '#E53935', subscriber_count: 660000 },
}

const list: ApiClassesList = {
  items: [card],
  meta: { levels: [{ level: 'N5', count: 4, locked: false }, { level: 'N4', count: 0, locked: true }], stats: { course_count: 4, channel_count: 4 } },
}

const detail: ApiClassCourseDetail = {
  slug: 'misa-n5-complete',
  title: 'Complete N5',
  summary: 'Beginner course',
  level: 'N5',
  platform: 'youtube',
  url: 'https://www.youtube.com/playlist?list=PL1',
  playlist_id: 'PL1',
  is_free: true,
  price_note: null,
  thumbnail_url: null,
  tags: null,
  what_you_learn: ['Kana'],
  curriculum: [{ title: 'Unit 1', topics: null }],
  total_duration_sec: 600,
  last_synced_at: '2026-10-22T08:00:00Z',
  videos: [
    { youtube_video_id: 'bbbbbbbbbbb', title: 'Two', thumbnail_url: null, duration_sec: 300, position: 2 },
    { youtube_video_id: 'aaaaaaaaaaa', title: 'One', thumbnail_url: 'https://t', duration_sec: 300, position: 1 },
  ],
  channel: {
    slug: 'misa', name: 'Misa', platform: 'youtube', url: 'https://www.youtube.com/@JapaneseAmmowithMisa', handle: '@JapaneseAmmowithMisa',
    youtube_channel_id: 'UCBSyd8tXJoEJKIXfrwkPdbA', avatar_url: 'https://a', banner_url: '', description: null,
    intro_video_id: 'WYYaf711IEM', subscriber_count: 660000, video_count: 500, accent_color: '#E53935',
    teaching_style: 'Warm', best_for: ['Beginners'], not_for: null, pros: ['Clear'], cons: null, verdict: 'Great',
  },
  more_from_channel: null,
  similar: [card],
}


describe('mapping', () => {
  it('maps a list to camelCase and fills in every level', () => {
    const out = toClassesList(list)
    expect(out.items[0]).toEqual({
      slug: 'misa-n5-complete', title: 'Complete N5', summary: 'Beginner course', level: 'N5', platform: 'youtube',
      isFree: true, isFeatured: false, thumbnailUrl: 'https://i.ytimg.com/vi/x/hq.jpg', videoCount: 180, totalDurationSec: 36000,
      tags: ['Grammar'],
      channel: { slug: 'misa', name: 'Japanese Ammo with Misa', avatarUrl: 'https://a', accentColor: '#E53935', subscriberCount: 660000 },
    })
    expect(out.meta.levels.map(l => [l.level, l.locked])).toEqual([['N5', false], ['N4', true], ['N3', true], ['N2', true], ['N1', true]])
    expect(out.meta.stats).toEqual({ courseCount: 4, channelCount: 4 })
  })

  it('maps a detail, normalising nulls and ordering videos by position', () => {
    const out = toCourseDetail(detail)
    expect(out.videos.map(v => v.youtubeVideoId)).toEqual(['aaaaaaaaaaa', 'bbbbbbbbbbb'])
    expect(out.videos[0]).toEqual({ youtubeVideoId: 'aaaaaaaaaaa', title: 'One', thumbnailUrl: 'https://t', durationSec: 300, position: 1 })
    expect(out.tags).toEqual([])
    expect(out.priceNote).toBe('')
    expect(out.curriculum).toEqual([{ title: 'Unit 1', topics: [] }])
    expect(out.lastSyncedAt).toBe('2026-10-22T08:00:00Z')
    expect(out.moreFromChannel).toEqual([])
    expect(out.similar).toHaveLength(1)
    expect(out.channel).toMatchObject({
      bannerUrl: null, description: '', introVideoId: 'WYYaf711IEM', youtubeChannelId: 'UCBSyd8tXJoEJKIXfrwkPdbA',
      bestFor: ['Beginners'], notFor: [], cons: [], verdict: 'Great', teachingStyle: 'Warm',
    })
  })
})

describe('YouTube media mapping', () => {
  it('maps the channel banner, playlist id and thumbnail', () => {
    const out = toCourseDetail({
      ...detail,
      thumbnail_url: 'https://i.ytimg.com/vi/pSvH9vH60Ig/hqdefault.jpg',
      channel: { ...detail.channel, banner_url: 'https://yt3.googleusercontent.com/banner=w2120' },
    })
    expect(out.playlistId).toBe('PL1')
    expect(out.thumbnailUrl).toBe('https://i.ytimg.com/vi/pSvH9vH60Ig/hqdefault.jpg')
    expect(out.channel.bannerUrl).toBe('https://yt3.googleusercontent.com/banner=w2120')
  })

  it('treats empty or missing media fields as absent', () => {
    const out = toCourseDetail({ ...detail, playlist_id: '', thumbnail_url: null, channel: { ...detail.channel, banner_url: null } })
    expect(out.playlistId).toBeNull()
    expect(out.thumbnailUrl).toBeNull()
    expect(out.channel.bannerUrl).toBeNull()
  })
})

describe('classesQuery', () => {
  it('builds a stable query string', () => {
    expect(classesQuery()).toBe('')
    expect(classesQuery({ level: 'N5', platform: 'youtube', freeOnly: true })).toBe('?level=N5&platform=youtube&free=true')
    expect(classesQuery({ freeOnly: false })).toBe('')
  })
})

describe('classesService', () => {
  it('requests the filtered list and caches it', async () => {
    api.get.mockResolvedValue({ status: 'success', data: list })
    const out = await classesService.listClasses({ level: 'N5', freeOnly: true })
    expect(api.get).toHaveBeenCalledWith('/classes?level=N5&free=true')
    expect(out.items).toHaveLength(1)
    expect(peekClasses({ level: 'N5', freeOnly: true })).toBe(out)
  })

  it('falls back to the bundled seed data when the API is unreachable', async () => {
    api.get.mockImplementation(() => Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Network request failed', '')))
    const out = await classesService.listClasses({ level: 'N5', platform: 'youtube' })
    expect(out.items.length).toBeGreaterThan(0)
    expect(out.items.every(c => c.platform === 'youtube')).toBe(true)
    expect(out.meta.levels.find(l => l.level === 'N4')?.locked).toBe(true)
  })

  it('keeps a 404 as not found and never masks it with seed data', async () => {
    api.get.mockImplementation(() => Promise.reject(new ApiError(404, 'CLASS_NOT_FOUND', 'not found', '')))
    const err = await classesService.getClassDetail('misa-n5-complete').catch((e: unknown) => e)
    expect(isClassNotFound(err)).toBe(true)
  })

  it('serves the same banners, playlists and thumbnails offline as the API', async () => {
    api.get.mockImplementation(() => Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Network request failed', '')))
    const out = await classesService.getClassDetail('cure-dolly-structural-grammar')
    expect(out.playlistId).toBe('PLg9uYxuZf8x_A-vcqqyOFZu06WlhnypWj')
    expect(out.url).toBe('https://www.youtube.com/playlist?list=PLg9uYxuZf8x_A-vcqqyOFZu06WlhnypWj')
    expect(out.thumbnailUrl).toBe('https://i.ytimg.com/vi/pSvH9vH60Ig/hqdefault.jpg')
    expect(out.channel.bannerUrl).toMatch(/^https:\/\/yt3\.googleusercontent\.com\/N1yd7VVW1cLL.+=w2120-/)
    expect(out.videos).toEqual([])

    const list = await classesService.listClasses({ level: 'N5' })
    const youtube = list.items.filter(c => c.platform === 'youtube')
    expect(youtube.length).toBe(6)
    expect(youtube.some(c => c.slug === 'onomappu-japanese-onomatopoeia')).toBe(true)
    expect(youtube.every(c => c.thumbnailUrl?.startsWith('https://i.ytimg.com/vi/'))).toBe(true)
    expect(list.items.find(c => c.slug === 'japanesepod101-n5-path')?.thumbnailUrl).toBe(
      'https://cdn.innovativelanguage.com/sns/thumbnail/site/thumb_fb_japanese.png',
    )
    expect(list.items.some(c => c.platform === 'udemy')).toBe(false)
  })

  it('serves the seeded Onomappu playlist videos offline', async () => {
    api.get.mockImplementation(() => Promise.reject(new ApiError(0, 'NETWORK_ERROR', 'Network request failed', '')))
    const out = await classesService.getClassDetail('onomappu-natural-japanese')
    expect(out.playlistId).toBe('PLNc4a4bdNUdtxwNxBIn6M58BoqQuAqlzr')
    expect(out.url).toBe('https://www.youtube.com/playlist?list=PLNc4a4bdNUdtxwNxBIn6M58BoqQuAqlzr')
    expect(out.videos).toHaveLength(30)
    expect(out.videos.map(v => v.position)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
    expect(out.videos[0].thumbnailUrl).toBe(`https://i.ytimg.com/vi/${out.videos[0].youtubeVideoId}/hqdefault.jpg`)

    const list = await classesService.listClasses({ level: 'N5', platform: 'youtube' })
    expect(list.items.find(c => c.slug === 'onomappu-japanese-onomatopoeia')?.videoCount).toBe(51)
  })

  it('serves seed detail offline and 404s an unknown slug', async () => {
    api.get.mockImplementation(() => Promise.reject(new ApiError(503, 'HTTP_ERROR', 'down', '')))
    const out = await classesService.getClassDetail('misa-n5-complete')
    expect(out.channel.introVideoId).toBe('WYYaf711IEM')
    const err = await classesService.getClassDetail('nope').catch((e: unknown) => e)
    expect(isClassNotFound(err)).toBe(true)
  })
})
