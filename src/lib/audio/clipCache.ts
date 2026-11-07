/**
 * Spoken clips kept in the browser's Cache Storage: fetched once from the CDN,
 * then played from here, offline too. No permission is needed; the audio pack
 * also asks the browser to keep this storage (navigator.storage.persist).
 */

const CACHE_NAME = 'ff-audio-v1'

const cacheAvailable = () => typeof caches !== 'undefined'

async function openCache(): Promise<Cache | null> {
  if (!cacheAvailable()) return null
  try {
    return await caches.open(CACHE_NAME)
  } catch {
    return null // Storage blocked (private mode, disabled site data).
  }
}

export async function hasClip(url: string): Promise<boolean> {
  const cache = await openCache()
  return Boolean(await cache?.match(url))
}

/** The saved copy of a clip, without going to the network. */
export async function savedClip(url: string): Promise<Blob | null> {
  const cache = await openCache()
  const hit = await cache?.match(url)
  return hit ? hit.blob() : null
}

/**
 * The clip at `url`, a URL the API listed: from the cache, else from the CDN
 * (then saved). Null when it can't be downloaded.
 *
 * A clip asked for before it existed (older app versions guessed URLs) may
 * still have a 404 kept at Cloudflare's edge for hours. The API says the clip
 * is there, so a 404 is retried once with a one-off query string, which goes
 * past that edge copy. The clip is saved under the plain URL.
 */
export async function loadClip(url: string, signal?: AbortSignal): Promise<Blob | null> {
  const saved = await savedClip(url)
  if (saved) return saved
  let res = await download(url, signal)
  if (res?.status === HTTP_NOT_FOUND) res = await download(`${url}${url.includes('?') ? '&' : '?'}fresh=${Date.now().toString(36)}`, signal)
  if (!res?.ok) return null
  const cache = await openCache()
  if (cache) await cache.put(url, res.clone()).catch(() => {})
  return res.blob()
}

const HTTP_NOT_FOUND = 404

async function download(url: string, signal?: AbortSignal): Promise<Response | null> {
  try {
    // no-store: the browser's HTTP cache may hold that old 404 too. Clips are
    // kept in Cache Storage instead, so this costs nothing on later plays.
    return await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store', signal })
  } catch (error) {
    if (signal?.aborted) throw error
    return null
  }
}

export async function deleteClips(urls: readonly string[]): Promise<void> {
  const cache = await openCache()
  if (!cache) return
  await Promise.all(urls.map((url) => cache.delete(url)))
}

/** Asks the browser not to clear saved audio when space runs low (silent in Chrome, a prompt in Firefox). */
export async function keepClipsPersistent(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist()
  } catch {
    // Not supported: clips stay cached, just without the guarantee.
  }
}

/**
 * Deletes saved clips outside `keepPrefix`, e.g. a whole old folder
 * (".../audio/v1/") after the API moved to new rendering settings (".../audio/v2/"),
 * so an outdated clip can never play again.
 */
export async function pruneClips(keepPrefix: string): Promise<number> {
  const cache = await openCache()
  if (!cache) return 0
  const stale = (await cache.keys()).filter((req) => !req.url.startsWith(keepPrefix))
  await Promise.all(stale.map((req) => cache.delete(req)))
  return stale.length
}

export const clipStorageSupported = cacheAvailable
