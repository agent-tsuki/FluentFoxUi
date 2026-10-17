/**
 * Shared plumbing for the public `/content/*` API (kana charts, kanji levels).
 *
 * - Every response carries `strokes_base_url` (R2). The latest one is kept
 *   here so stroke loaders know where to fetch from; without it they use the
 *   files bundled with the app.
 * - Until the backend serves a path (or when it is unreachable), callers get
 *   the bundled data, which stays in the repo as the seed source.
 * - The result (API or bundled) is cached per path for the session, so an API
 *   that does not serve a level yet is asked once, not on every search.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type { StrokesLocation } from '@/types/content'

let strokesBaseUrl: string | null = null

/** R2 base URL from the latest content response, or null to use bundled stroke files. */
export function getStrokesBaseUrl(): string | null {
  return strokesBaseUrl
}

/**
 * GET a public content path and unwrap the `{status, data}` envelope. The
 * `strokes_base_url` is remembered and removed, so callers get exactly the
 * frontend type the bundled data has.
 */
async function fetchContent<T extends object>(path: string): Promise<T> {
  const res = await apiClient.get<ApiResponse<T & StrokesLocation>>(path)
  const { strokes_base_url, ...data } = res.data
  if (strokes_base_url) strokesBaseUrl = strokes_base_url.replace(/\/+$/, '')
  return data as unknown as T
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
  const load = fetchContent<T>(path)
    .then((data) => {
      if (!isValid(data)) throw new Error(`Unexpected content shape for ${path}`)
      return data
    })
    .catch(() => bundled())
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
