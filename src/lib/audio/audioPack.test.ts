import { beforeEach, describe, expect, it, vi } from 'vitest'

const speak = vi.fn()
const findClips = vi.fn()
const loadClip = vi.fn()
const hasClip = vi.fn()

vi.mock('@/api/services/audioService', () => ({
  SPEECH_MAX_TEXTS: 20,
  audioService: { speak: (...a: unknown[]) => speak(...a), findClips: (...a: unknown[]) => findClips(...a) },
}))
vi.mock('@/lib/audio/clipCache', () => ({
  loadClip: (...a: unknown[]) => loadClip(...a),
  hasClip: (...a: unknown[]) => hasClip(...a),
  deleteClips: vi.fn(),
  keepClipsPersistent: vi.fn(),
}))
vi.mock('@/lib/audio/audioInfo', async (orig) => ({
  ...(await orig<typeof import('@/lib/audio/audioInfo')>()),
  getAudioInfo: async () => ({ enabled: true, base_url: 'https://cdn.test/v', ext: '.mp3' }),
}))

const { downloadPack } = await import('./audioPack')

/** Captured before any test fakes the clock. */
const realSetTimeout = globalThis.setTimeout

/**
 * Steps fake time until `work` settles. Hashing (crypto.subtle) is truly
 * async, so each step also yields to the real event loop: otherwise the
 * clock could run out before the next wait is even scheduled.
 */
async function runWithFakeTime<T>(work: Promise<T>): Promise<T> {
  let settled = false
  void work.finally(() => (settled = true)).catch(() => undefined)
  while (!settled) {
    await vi.advanceTimersByTimeAsync(5_000)
    await new Promise((resolve) => realSetTimeout(resolve, 0))
  }
  return work
}

/** An API answer listing a url (`cdn-<text>`) for the texts in `listed`. */
const listing = (listed: Set<string>) => async (texts: string[]) => ({
  items: texts.map((text) => ({ segments: [{ text, ...(listed.has(text) ? { url: `cdn-${text}` } : {}) }] })),
  credits: [],
  pending: texts.some((t) => !listed.has(t)),
})

describe('downloadPack', () => {
  beforeEach(() => {
    speak.mockReset()
    findClips.mockReset()
    loadClip.mockReset().mockResolvedValue(new Blob(['x']))
    hasClip.mockReset().mockResolvedValue(false)
  })

  it('downloads only the clips the API lists, and reports the rest as missing for guests', async () => {
    findClips.mockImplementation(listing(new Set(['あ'])))
    const result = await downloadPack(['あ', 'い', 'う'], { canGenerate: false })
    expect(result).toEqual({ saved: 1, total: 3, missing: 2 })
    expect(loadClip).toHaveBeenCalledTimes(1)
    expect(loadClip).toHaveBeenCalledWith('cdn-あ', undefined)
    expect(speak).not.toHaveBeenCalled()
  })

  it('skips clips already saved in the browser', async () => {
    hasClip.mockResolvedValue(true)
    const result = await downloadPack(['あ'], { canGenerate: true })
    expect(result).toEqual({ saved: 1, total: 1, missing: 0 })
    expect(findClips).not.toHaveBeenCalled()
  })

  it('has missing clips generated in rounds until all are saved', async () => {
    findClips.mockImplementation(listing(new Set()))
    speak
      // The API makes a few clips per request; the rest come back pending.
      .mockImplementationOnce(listing(new Set(['い'])))
      .mockImplementationOnce(listing(new Set(['う'])))
    const progress: number[] = []
    const result = await downloadPack(['い', 'う'], { canGenerate: true, onProgress: (p) => progress.push(p.saved) })
    expect(result).toEqual({ saved: 2, total: 2, missing: 0 })
    expect(speak).toHaveBeenNthCalledWith(1, ['い', 'う'])
    expect(speak).toHaveBeenNthCalledWith(2, ['う'])
    expect(progress[progress.length - 1]).toBe(2)
  })

  it('waits and retries when the API makes no progress, then stops', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    findClips.mockImplementation(listing(new Set()))
    speak.mockImplementation(listing(new Set()))
    const result = await runWithFakeTime(downloadPack(['い'], { canGenerate: true }))
    vi.useRealTimers()
    expect(result.missing).toBe(1)
    // One first try plus one retry after each delay (5 s, 20 s, 45 s).
    expect(speak).toHaveBeenCalledTimes(4)
  })
})
