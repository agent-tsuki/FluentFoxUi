import { beforeEach, describe, expect, it, vi } from 'vitest'

const speak = vi.fn()
const findClips = vi.fn()
const loadClip = vi.fn()
const savedClip = vi.fn()
const getAudioInfo = vi.fn()

vi.mock('@/api/services/audioService', () => ({
  audioService: { speak: (...a: unknown[]) => speak(...a), findClips: (...a: unknown[]) => findClips(...a) },
}))
vi.mock('@/lib/audio/clipCache', () => ({
  loadClip: (...a: unknown[]) => loadClip(...a),
  savedClip: (...a: unknown[]) => savedClip(...a),
}))
vi.mock('@/lib/audio/audioInfo', async (orig) => ({
  ...(await orig<typeof import('@/lib/audio/audioInfo')>()),
  getAudioInfo: () => getAudioInfo(),
}))

const { loadSpeech, preloadSpeech } = await import('./loadSpeech')

/** Captured before any test fakes the clock. */
const realSetTimeout = globalThis.setTimeout

/** Steps fake time (the retry waits) until `work` settles, yielding to real async work (hashing) between steps. */
async function runWithFakeTime<T>(work: Promise<T>): Promise<T> {
  let settled = false
  void work.finally(() => (settled = true)).catch(() => undefined)
  while (!settled) {
    await vi.advanceTimersByTimeAsync(1_000)
    await new Promise((resolve) => realSetTimeout(resolve, 0))
  }
  return work
}

const INFO = { enabled: true, base_url: 'https://cdn.test/audio/v1/voicevox-14', ext: '.mp3' }
const ASA = 'https://cdn.test/audio/v1/voicevox-14/1ba626dd871ec1ff07633de4c85693e2fed2ceb5e619601804187c86275cf2fb.mp3'
const blob = (name: string) => new Blob([name])
const listed = (url?: string) => ({ items: [{ segments: [{ text: 'あさ', ...(url ? { url } : {}) }] }], credits: [], pending: !url })

describe('loadSpeech', () => {
  beforeEach(() => {
    speak.mockReset()
    findClips.mockReset()
    loadClip.mockReset().mockResolvedValue(blob('clip'))
    savedClip.mockReset().mockResolvedValue(null)
    getAudioInfo.mockReset().mockResolvedValue(INFO)
  })

  it('plays a clip saved in the browser without any request', async () => {
    savedClip.mockResolvedValue(blob('saved'))
    const clips = await loadSpeech(' あさ ', { canGenerate: true })
    expect(clips).toHaveLength(1)
    expect(savedClip).toHaveBeenCalledWith(ASA)
    expect(speak).not.toHaveBeenCalled()
    expect(findClips).not.toHaveBeenCalled()
    expect(loadClip).not.toHaveBeenCalled()
  })

  it('fetches only the CDN URL the API lists for a guest', async () => {
    findClips.mockResolvedValue(listed(ASA))
    expect(await loadSpeech('あさ', { canGenerate: false })).toHaveLength(1)
    expect(findClips).toHaveBeenCalledWith(['あさ'], 'main')
    expect(loadClip).toHaveBeenCalledWith(ASA, undefined)
    expect(speak).not.toHaveBeenCalled()
  })

  it('asks for the second voice, and names its saved copy in that voice’s folder', async () => {
    getAudioInfo.mockResolvedValue({ ...INFO, alt_base_url: 'https://cdn.test/audio/v1/voicevox-13' })
    const alt = ASA.replace('voicevox-14', 'voicevox-13')
    findClips.mockResolvedValue(listed(alt))
    expect(await loadSpeech('あさ', { canGenerate: false, voice: 'alt' })).toHaveLength(1)
    expect(savedClip).toHaveBeenCalledWith(alt)
    expect(findClips).toHaveBeenCalledWith(['あさ'], 'alt')
  })

  it('uses the main voice for the second speaker when the API has no second voice', async () => {
    findClips.mockResolvedValue(listed(ASA))
    expect(await loadSpeech('あさ', { canGenerate: false, voice: 'alt' })).toHaveLength(1)
    expect(savedClip).toHaveBeenCalledWith(ASA)
    expect(findClips).toHaveBeenCalledWith(['あさ'], 'main')
  })

  it('gives guests the browser voice, and asks the CDN nothing, when no clip exists', async () => {
    findClips.mockResolvedValue(listed())
    expect(await loadSpeech('あさ', { canGenerate: false })).toBeNull()
    expect(loadClip).not.toHaveBeenCalled()
  })

  it('asks the API to find or generate the clip for a verified learner', async () => {
    speak.mockResolvedValue(listed('https://cdn.test/fallback.mp3'))
    const clips = await loadSpeech('あさ', { canGenerate: true })
    expect(speak).toHaveBeenCalledWith(['あさ'], 'main')
    expect(findClips).not.toHaveBeenCalled()
    expect(loadClip).toHaveBeenCalledWith('https://cdn.test/fallback.mp3', undefined)
    expect(clips).toHaveLength(1)
  })

  it('falls back when the API has not made every sentence yet', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    speak.mockResolvedValue({ items: [{ segments: [{ text: 'はい。' }, { text: 'いいえ。', url: 'u' }] }], credits: [], pending: true })
    expect(await runWithFakeTime(loadSpeech('はい。いいえ。', { canGenerate: true }))).toBeNull()
    vi.useRealTimers()
    expect(loadClip).not.toHaveBeenCalled()
  })

  it('does nothing when recorded audio is off', async () => {
    getAudioInfo.mockResolvedValue({ enabled: false })
    expect(await loadSpeech('あさ', { canGenerate: true })).toBeNull()
    expect(savedClip).not.toHaveBeenCalled()
  })

  it('shares one request between a preload and a tap on the same text', async () => {
    let release: (v: unknown) => void = () => {}
    speak.mockReturnValue(new Promise((r) => (release = r)))
    preloadSpeech(['あさ', 'あさ'], true)
    const tap = loadSpeech('あさ', { canGenerate: true })
    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(1))
    release(listed(ASA))
    expect(await tap).toHaveLength(1)
    expect(speak).toHaveBeenCalledTimes(1)
  })

  it('asks again after a request has finished', async () => {
    findClips.mockResolvedValue(listed())
    await loadSpeech('あさ', { canGenerate: false })
    await loadSpeech('あさ', { canGenerate: false })
    expect(findClips).toHaveBeenCalledTimes(2)
  })

  it('makes its own request when the preload it joined found no clip', async () => {
    let release: (v: unknown) => void = () => {}
    speak.mockReturnValueOnce(new Promise((r) => (release = r))).mockResolvedValue(listed(ASA))
    preloadSpeech(['あさ'], true)
    const tap = loadSpeech('あさ', { canGenerate: true })
    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(1))
    release(listed())
    expect(await tap).toHaveLength(1)
    expect(speak).toHaveBeenCalledTimes(2)
  })

  it('asks again while the API is still making the clip, then plays it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    speak.mockResolvedValueOnce(listed()).mockResolvedValueOnce(listed()).mockResolvedValue(listed(ASA))
    const clips = await runWithFakeTime(loadSpeech('あさ', { canGenerate: true }))
    vi.useRealTimers()
    expect(clips).toHaveLength(1)
    expect(speak).toHaveBeenCalledTimes(3)
  })

  it('gives up after its retries', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    speak.mockResolvedValue(listed())
    const clips = await runWithFakeTime(loadSpeech('あさ', { canGenerate: true }))
    vi.useRealTimers()
    expect(clips).toBeNull()
    expect(speak).toHaveBeenCalledTimes(3)
  })
})
