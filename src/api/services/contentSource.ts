/**
 * Shared plumbing for the public `/content/*` API (kana charts, kanji levels).
 *
 * - Every response carries `strokes_base_url` (R2). The latest one is kept
 *   here so stroke loaders know where to fetch from; without it they use the
 *   files bundled with the app.
 * - Until the backend serves a path (or when it is unreachable), callers get
 *   the bundled data, which stays in the repo as the seed source.
 * - Valid public responses are also kept in localStorage for seven days, so a
 *   return visit can render course content immediately. No account, progress,
 *   answer, or authentication data is stored here.
 * - The result is cached per path for the session, so an API that does not
 *   serve a level yet is asked once, not on every search.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { StrokesLocation } from '@/types/content'

let strokesBaseUrl: string | null = null

const LOCAL_CACHE_PREFIX = 'foxsensei:public-content:v1:'
const LOCAL_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const CACHEABLE_COURSE_PATH = /^\/content\/(?:kana\/[^/]+|kanji\/n[1-5]\/(?:index|detail))$/

interface LocalContentRecord {
  cachedAt: number
  data: unknown
  strokesBaseUrl: string | null
}

/** R2 base URL from the latest content response, or null to use bundled stroke files. */
export function getStrokesBaseUrl(): string | null {
  return strokesBaseUrl
}

function normaliseStrokesBaseUrl(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value.replace(/\/+$/, '') : null
}

function rememberStrokesBaseUrl(value: unknown) {
  const baseUrl = normaliseStrokesBaseUrl(value)
  if (baseUrl) strokesBaseUrl = baseUrl
}

function contentStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    // Privacy mode and storage policy can block localStorage. The in-memory
    // cache and bundled fallback still keep the course usable.
    return null
  }
}

function localCacheKey(path: string): string {
  return `${LOCAL_CACHE_PREFIX}${encodeURIComponent(path)}`
}

/** Keep durable storage bounded to whole public course payloads, never per-item lookups. */
function canCacheLocally(path: string): boolean {
  return CACHEABLE_COURSE_PATH.test(path)
}

function removeLocalContent(path: string) {
  if (!canCacheLocally(path)) return
  try {
    contentStorage()?.removeItem(localCacheKey(path))
  } catch {
    // A full or blocked store must never stop a course from loading.
  }
}

function readLocalContent(path: string): LocalContentRecord | null {
  if (!canCacheLocally(path)) return null
  try {
    const raw = contentStorage()?.getItem(localCacheKey(path))
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      removeLocalContent(path)
      return null
    }
    const record = parsed as Partial<LocalContentRecord>
    if (typeof record.cachedAt !== 'number' || !Number.isFinite(record.cachedAt) || !('data' in record)) {
      removeLocalContent(path)
      return null
    }
    return {
      cachedAt: record.cachedAt,
      data: record.data,
      strokesBaseUrl: normaliseStrokesBaseUrl(record.strokesBaseUrl),
    }
  } catch {
    removeLocalContent(path)
    return null
  }
}

function writeLocalContent(path: string, data: object, sourceStrokesBaseUrl: string | null) {
  if (!canCacheLocally(path)) return
  try {
    const record: LocalContentRecord = { cachedAt: Date.now(), data, strokesBaseUrl: sourceStrokesBaseUrl }
    contentStorage()?.setItem(localCacheKey(path), JSON.stringify(record))
  } catch {
    // Quota failures and JSON/storage errors should be invisible to learners.
  }
}

/**
 * GET a public content path and unwrap the `{status, data}` envelope. The
 * `strokes_base_url` is remembered and removed, so callers get exactly the
 * frontend type the bundled data has.
 */
async function fetchContent<T extends object>(path: string): Promise<{ data: T; strokesBaseUrl: string | null }> {
  const res = await apiClient.get<ApiResponse<T & StrokesLocation>>(path)
  const { strokes_base_url, ...data } = res.data
  return { data: data as unknown as T, strokesBaseUrl: normaliseStrokesBaseUrl(strokes_base_url) }
}

const contentCache = new Map<string, Promise<unknown>>()

/**
 * The API payload for `path`, or the bundled data when the API call fails for
 * any reason (backend not deployed yet, level not served yet, offline,
 * unexpected shape). Content is public and identical in both, so the learner
 * never sees the difference. `isValid` rejects an API payload the UI cannot use.
 */
export function loadContent<T extends object>(
  path: string,
  bundled: () => Promise<T>,
  isValid: (data: T) => boolean = () => true,
): Promise<T> {
  const hit = contentCache.get(path) as Promise<T> | undefined
  if (hit) return hit

  const local = readLocalContent(path)
  if (local && Date.now() - local.cachedAt < LOCAL_CACHE_MAX_AGE_MS && isValid(local.data as T)) {
    rememberStrokesBaseUrl(local.strokesBaseUrl)
    const cached = Promise.resolve(local.data as T)
    contentCache.set(path, cached)
    return cached
  }
  if (local && !isValid(local.data as T)) removeLocalContent(path)

  const load = fetchContent<T>(path)
    .then(({ data, strokesBaseUrl: sourceStrokesBaseUrl }) => {
      if (!isValid(data)) throw new Error(`Unexpected content shape for ${path}`)
      rememberStrokesBaseUrl(sourceStrokesBaseUrl)
      writeLocalContent(path, data, sourceStrokesBaseUrl)
      return data
    })
    .catch(() => {
      // An expired cache is still a better offline experience than a blank
      // course. It is revalidated as soon as the next uncached visit succeeds.
      if (local && isValid(local.data as T)) {
        rememberStrokesBaseUrl(local.strokesBaseUrl)
        return local.data as T
      }
      return bundled().then((data) => {
        if (isValid(data)) writeLocalContent(path, data, null)
        return data
      })
    })
  contentCache.set(path, load)
  // Only when the bundled data failed too (e.g. a chunk load error): allow a retry.
  load.catch(() => contentCache.delete(path))
  return load
}

/**
 * GET static stroke JSON. Plain fetch, not apiClient: R2 is another origin
 * and must never receive the Authorization header. Resolves null for a
 * missing or non-JSON file; rejects on network errors.
 */
export async function fetchStrokeJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  // The SPA fallback answers unknown local paths with index.html, so check the type too.
  if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null
  return res.json().catch(() => null)
}
