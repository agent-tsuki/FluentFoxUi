import { audioService, type AudioInfo } from '@/api/services/audioService'
import { pruneClips } from '@/lib/audio/clipCache'

const DISABLED: AudioInfo = { enabled: false }
let infoPromise: Promise<AudioInfo> | null = null
let infoValue: AudioInfo | null = null

/**
 * Where the main voice's clips live (`GET /audio/info`), fetched once per
 * visit. Any failure means "no recorded audio": the browser voice is used.
 * Saved clips from an older version folder are then cleared out.
 */
export function getAudioInfo(): Promise<AudioInfo> {
  infoPromise ??= audioService
    .getInfo()
    .then((info) => (info.enabled && info.base_url && info.ext ? info : DISABLED))
    .catch(() => DISABLED)
    .then((info) => {
      infoValue = info
      if (info.enabled && info.base_url) void pruneClips(versionRoot(info.base_url)).catch(() => {})
      return info
    })
  return infoPromise
}

/** ".../audio/v2/voicevox-14" -> ".../audio/v2/": every voice of the current rendering version. */
export function versionRoot(baseUrl: string): string {
  return baseUrl.slice(0, baseUrl.lastIndexOf('/') + 1)
}

/** The info if already loaded (for synchronous UI decisions), else null. */
export function peekAudioInfo(): AudioInfo | null {
  return infoValue
}

/** CDN URL of a sentence's clip in the main voice. */
export function clipUrl(info: AudioInfo, hash: string): string {
  return `${info.base_url}/${hash}${info.ext}`
}
