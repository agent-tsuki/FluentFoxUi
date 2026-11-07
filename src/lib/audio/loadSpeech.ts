import { audioService, type SpeechSegment } from '@/api/services/audioService'
import { clipUrl, getAudioInfo } from '@/lib/audio/audioInfo'
import { loadClip, savedClip } from '@/lib/audio/clipCache'
import { clipHash, sentences } from '@/lib/audio/speechText'
import { IS_DEV } from '@/lib/config'

export interface LoadSpeechOptions {
  /** Signed in with a verified email: may ask the API to generate missing clips. */
  canGenerate: boolean
  signal?: AbortSignal
  /** No development trace (preloading). */
  quiet?: boolean
}

/**
 * The recorded clips for a text, in order: the copies saved in the browser,
 * else the CDN URLs the API lists (`findClips`; for verified learners `speak`,
 * which also generates what is missing). The CDN is only asked for URLs the
 * API gave. Null when any sentence has no clip yet, so the caller falls back
 * to the browser voice for the whole text rather than mixing two voices.
 */
export async function loadSpeech(text: string, options: LoadSpeechOptions): Promise<Blob[] | null> {
  // A tap on a clip that is still preloading waits for that request instead of starting another.
  const key = `${options.canGenerate ? 'gen' : 'find'}:${text}`
  const running = inFlight.get(key)
  if (running) {
    const shared = await running
    // A preload that came back without a clip (the voices were busy) doesn't answer a tap: it asks itself.
    if (shared || options.quiet) return shared
  }
  return track(key, fetchSpeech(text, options))
}

function track(key: string, request: Promise<Blob[] | null>): Promise<Blob[] | null> {
  inFlight.set(key, request)
  return request.finally(() => {
    if (inFlight.get(key) === request) inFlight.delete(key)
  })
}

/**
 * The API generates two clips at a time and answers "not ready" (no url) for
 * one that would wait longer. A tap asks again this often, up to
 * PENDING_RETRIES times, before the browser voice takes over (the speech
 * hook's own limit, CLIP_WAIT_MS, still applies). Preloads don't retry.
 */
const PENDING_RETRY_MS = 1_500
const PENDING_RETRIES = 2

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason)
    }, { once: true })
  })

const inFlight = new Map<string, Promise<Blob[] | null>>()

/**
 * Fetches the clips for texts the learner is about to hear (the next
 * listening question) into the browser, so they play at once. Errors are
 * ignored: the tap itself will try again.
 */
export function preloadSpeech(texts: readonly string[], canGenerate: boolean): void {
  for (const text of new Set(texts)) {
    if (text.trim()) loadSpeech(text, { canGenerate, quiet: true }).catch(() => undefined)
  }
}

async function fetchSpeech(text: string, { canGenerate, signal, quiet = false }: LoadSpeechOptions): Promise<Blob[] | null> {
  const trace = quiet ? (_text: string, _why: string, clips: Blob[] | null = null) => clips : traceVoice
  const info = await getAudioInfo()
  const parts = sentences(text)
  if (!info.enabled || parts.length === 0) return trace(text, 'browser voice: recorded audio is off (/audio/info enabled=false)')

  const names = await Promise.all(parts.map(async (s) => clipUrl(info, await clipHash(s))))
  const saved = await Promise.all(names.map((name) => savedClip(name)))
  if (saved.every(Boolean)) return trace(text, 'recorded clip saved in the browser', saved as Blob[])

  let segments = await listClips(text, canGenerate)
  for (let retry = 0; canGenerate && !quiet && retry < PENDING_RETRIES && !allListed(segments); retry++) {
    await sleep(PENDING_RETRY_MS, signal)
    segments = await listClips(text, canGenerate)
  }
  if (!allListed(segments)) {
    return trace(
      text,
      canGenerate
        ? 'browser voice: the API could not make the clip yet (pending; check the API logs for "audio voice failed")'
        : 'browser voice: clip not made yet, and only signed-in verified users can have it made',
    )
  }
  const clips = await Promise.all(segments.map((s) => loadClip(s.url as string, signal)))
  return clips.every(Boolean)
    ? trace(text, 'recorded clip from the CDN', clips as Blob[])
    : trace(text, 'browser voice: the clip could not be downloaded from the CDN')
}

/** The text's clips as the API lists them: lookup only, or (verified learners) generating the missing ones. */
async function listClips(text: string, canGenerate: boolean): Promise<SpeechSegment[]> {
  const result = canGenerate ? await audioService.speak([text]) : await audioService.findClips([text])
  return result.items[0]?.segments ?? []
}

const allListed = (segments: SpeechSegment[]) => segments.length > 0 && segments.every((s) => s.url)

/** Development only: one console line per spoken text saying which voice was used and why. */
function traceVoice(text: string, why: string, clips: Blob[] | null = null): Blob[] | null {
  if (IS_DEV) console.info(`[audio] "${text}" → ${why}`)
  return clips
}
