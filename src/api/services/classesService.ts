/**
 * Classes service: the public `GET /classes` list and `GET /classes/{slug}` detail.
 *
 * - Maps the API's snake_case into the camelCase domain types in `@/types/classes`.
 * - When the API cannot be reached (network error or a 5xx), the bundled
 *   seed data in `api/mock/classes` is served instead, like the other public
 *   content services do. It is imported lazily so it stays out of the page chunk.
 *   A 404 is a real answer (unknown or hidden course) and is never masked.
 * - Successful responses are kept for the session, so switching tabs back and
 *   forth renders instantly (see `peekClasses` / `peekClassDetail`).
 */
import { apiClient } from '@/api/client'
import { ApiError } from '@/api/errors'
import type {
  ApiClassChannelProfile,
  ApiClassChannelSummary,
  ApiClassCourseCard,
  ApiClassCourseDetail,
  ApiClassesList,
  ApiClassVideo,
  ApiResponse,
} from '@/types/api'
import type {
  ClassChannelProfile,
  ClassChannelSummary,
  ClassCourseCard,
  ClassCourseDetail,
  ClassesFilters,
  ClassesList,
  ClassVideo,
} from '@/types/classes'
import type { JlptLevel } from '@/types'

const ALL_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

// ── Mapping ───────────────────────────────────────────────────────────────────

function toChannelSummary(c: ApiClassChannelSummary): ClassChannelSummary {
  return {
    slug:            c.slug,
    name:            c.name,
    avatarUrl:       c.avatar_url ?? null,
    accentColor:     c.accent_color ?? null,
    subscriberCount: c.subscriber_count ?? null,
  }
}

export function toCourseCard(c: ApiClassCourseCard): ClassCourseCard {
  return {
    slug:             c.slug,
    title:            c.title,
    summary:          c.summary ?? '',
    level:            c.level,
    platform:         c.platform,
    isFree:           c.is_free,
    isFeatured:       c.is_featured,
    thumbnailUrl:     c.thumbnail_url ?? null,
    videoCount:       c.video_count ?? 0,
    totalDurationSec: c.total_duration_sec ?? 0,
    tags:             c.tags ?? [],
    channel:          toChannelSummary(c.channel),
  }
}

/** Every level appears once, in N5 → N1 order, even if the API leaves one out. */
export function toClassesList(res: ApiClassesList): ClassesList {
  const levels = res.meta.levels ?? []
  return {
    items: (res.items ?? []).map(toCourseCard),
    meta: {
      levels: ALL_LEVELS.map(level => {
        const found = levels.find(l => l.level === level)
        return found ? { level, count: found.count, locked: found.locked } : { level, count: 0, locked: true }
      }),
      stats: {
        courseCount:  res.meta.stats?.course_count ?? 0,
        channelCount: res.meta.stats?.channel_count ?? 0,
      },
    },
  }
}

function toVideo(v: ApiClassVideo): ClassVideo {
  return {
    youtubeVideoId: v.youtube_video_id,
    title:          v.title,
    thumbnailUrl:   v.thumbnail_url ?? null,
    durationSec:    v.duration_sec ?? 0,
    position:       v.position,
  }
}

function toChannelProfile(c: ApiClassChannelProfile): ClassChannelProfile {
  return {
    slug:             c.slug,
    name:             c.name,
    platform:         c.platform,
    url:              c.url,
    handle:           c.handle || null,
    youtubeChannelId: c.youtube_channel_id || null,
    avatarUrl:        c.avatar_url || null,
    bannerUrl:        c.banner_url || null,
    description:      c.description ?? '',
    introVideoId:     c.intro_video_id || null,
    subscriberCount:  c.subscriber_count ?? null,
    videoCount:       c.video_count ?? null,
    accentColor:      c.accent_color || null,
    teachingStyle:    c.teaching_style ?? '',
    bestFor:          c.best_for ?? [],
    notFor:           c.not_for ?? [],
    pros:             c.pros ?? [],
    cons:             c.cons ?? [],
    verdict:          c.verdict ?? '',
  }
}

export function toCourseDetail(d: ApiClassCourseDetail): ClassCourseDetail {
  return {
    slug:             d.slug,
    title:            d.title,
    summary:          d.summary ?? '',
    level:            d.level,
    platform:         d.platform,
    url:              d.url,
    playlistId:       d.playlist_id || null,
    isFree:           d.is_free,
    priceNote:        d.price_note ?? '',
    thumbnailUrl:     d.thumbnail_url ?? null,
    tags:             d.tags ?? [],
    whatYouLearn:     d.what_you_learn ?? [],
    curriculum:       (d.curriculum ?? []).map(s => ({ title: s.title, topics: s.topics ?? [] })),
    totalDurationSec: d.total_duration_sec ?? 0,
    lastSyncedAt:     d.last_synced_at ?? null,
    videos:           (d.videos ?? []).map(toVideo).sort((a, b) => a.position - b.position),
    channel:          toChannelProfile(d.channel),
    moreFromChannel:  (d.more_from_channel ?? []).map(toCourseCard),
    similar:          (d.similar ?? []).map(toCourseCard),
  }
}

// ── Requests ──────────────────────────────────────────────────────────────────

/** `?level=N5&platform=youtube&free=true`, or '' with no filters. Stable order, so it doubles as a cache key. */
export function classesQuery(filters: ClassesFilters = {}): string {
  const params = new URLSearchParams()
  if (filters.level) params.set('level', filters.level)
  if (filters.platform) params.set('platform', filters.platform)
  if (filters.freeOnly) params.set('free', 'true')
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** Unreachable API (offline, backend down): fall back to the bundled seed data. */
function isUnreachable(err: unknown): boolean {
  return err instanceof ApiError && (err.errorCode === 'NETWORK_ERROR' || err.httpStatus >= 500)
}

/** True for "this course does not exist or is not published". Pages show their 404 state. */
export function isClassNotFound(err: unknown): boolean {
  return err instanceof ApiError && err.httpStatus === 404
}

const listCache = new Map<string, ClassesList>()
const detailCache = new Map<string, ClassCourseDetail>()

export function peekClasses(filters: ClassesFilters = {}): ClassesList | undefined {
  return listCache.get(classesQuery(filters))
}

export function peekClassDetail(slug: string): ClassCourseDetail | undefined {
  return detailCache.get(slug)
}

export const classesService = {
  async listClasses(filters: ClassesFilters = {}): Promise<ClassesList> {
    const query = classesQuery(filters)
    let raw: ApiClassesList
    try {
      raw = (await apiClient.get<ApiResponse<ApiClassesList>>(`/classes${query}`)).data
    } catch (err) {
      if (!isUnreachable(err)) throw err
      const mock = await import('@/api/mock/classes')
      // Not cached: the next visit should try the API again.
      return toClassesList(mock.mockClassesList(filters))
    }
    const list = toClassesList(raw)
    listCache.set(query, list)
    return list
  },

  async getClassDetail(slug: string): Promise<ClassCourseDetail> {
    let raw: ApiClassCourseDetail
    try {
      raw = (await apiClient.get<ApiResponse<ApiClassCourseDetail>>(`/classes/${encodeURIComponent(slug)}`)).data
    } catch (err) {
      if (!isUnreachable(err)) throw err
      const mock = await import('@/api/mock/classes')
      const found = mock.mockClassDetail(slug)
      if (!found) throw new ApiError(404, 'CLASS_NOT_FOUND', 'Course not found', '')
      return toCourseDetail(found)
    }
    const detail = toCourseDetail(raw)
    detailCache.set(slug, detail)
    return detail
  },
}
