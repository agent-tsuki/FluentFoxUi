/**
 * Shared plumbing for the public `/content/*` API (kana charts, kanji levels).
 *
 * - Every response carries `strokes_base_url` (R2). The latest one is kept
 *   here so stroke loaders know where to fetch from; without it they use the
 *   files bundled with the app.
 * - First visits render the bundled data straight away (it stays in the repo
 *   as the seed source); the API copy is fetched in the background once the
 *   page has settled and used from the next visit on. See loadContent.
 * - Valid public responses are also kept in localStorage for seven days, so a
 *   return visit can render course content immediately. No account, progress,
 *   answer, or authentication data is stored here.
 * - The result is cached per path for the session, so an API that does not
 *   serve a level yet is asked once, not on every search.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { StrokesLocation } from '@/types/content'
import { whenPageSettles } from '@/lib/afterPageSettles'

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
 * Course content for `path`, without ever waiting on the network for the first
 * screen (stale-while-revalidate):
 *
 * 1. A fresh copy saved by an earlier visit (localStorage, 7 days) is used as is.
 * 2. Otherwise the learner sees content immediately: an expired saved copy if
 *    there is one, else the data bundled with the app. Content is public and
 *    identical in both, so the learner never sees the difference.
 * 3. The API copy is then fetched in the background, once the page has settled
 *    (so it never competes with the first paint on slow networks or a cold
 *    backend), and saved for the next visit.
 *
 * If the bundled data itself fails to load (e.g. a chunk error), the API is
 * asked directly. `isValid` rejects a payload the UI cannot use.
 */
export function loadContent<T extends object>(
  path: string,
  bundled: () => Promise<T>,
  isValid: (data: T) => boolean = () => true,
): Promise<T> {
  const hit = contentCache.get(path) as Promise<T> | undefined
  if (hit) return hit

  const local = readLocalContent(path)
  const localIsValid = local !== null && isValid(local.data as T)
  if (local && !localIsValid) removeLocalContent(path)

  if (local && localIsValid && Date.now() - local.cachedAt < LOCAL_CACHE_MAX_AGE_MS) {
    rememberStrokesBaseUrl(local.strokesBaseUrl)
    const cached = Promise.resolve(local.data as T)
    contentCache.set(path, cached)
    return cached
  }

  const fromApi = () =>
    fetchContent<T>(path).then(({ data, strokesBaseUrl: sourceStrokesBaseUrl }) => {
      if (!isValid(data)) throw new Error(`Unexpected content shape for ${path}`)
      rememberStrokesBaseUrl(sourceStrokesBaseUrl)
      writeLocalContent(path, data, sourceStrokesBaseUrl)
      return data
    })
  // A failed refresh is harmless: the learner already has content, and the
  // next visit tries again.
  const refreshLater = () => whenPageSettles(() => void fromApi().catch(() => {}))

  let load: Promise<T>
  if (local && localIsValid) {
    rememberStrokesBaseUrl(local.strokesBaseUrl)
    load = Promise.resolve(local.data as T)
    refreshLater()
  } else {
    load = bundled()
      .then((data) => {
        if (!isValid(data)) throw new Error(`Unexpected bundled content for ${path}`)
        refreshLater()
        return data
      })
      .catch(() => fromApi())
  }
  contentCache.set(path, load)
  // Only when every source failed: allow a retry.
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
