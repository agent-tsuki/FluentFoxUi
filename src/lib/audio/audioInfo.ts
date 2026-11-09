import { audioService, type AudioInfo, type SpeechVoice } from '@/api/services/audioService'
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

/** The voice the API will use: a cast or second voice only when it has it (else the main voice answers for it). */
export function availableVoice(info: AudioInfo, voice: SpeechVoice = 'main'): SpeechVoice {
  if (voice === 'alt') return info.alt_base_url ? 'alt' : 'main'
  return info.voices?.[voice] ? voice : 'main'
}

/** CDN URL of a sentence's clip in a voice (the main voice by default). */
export function clipUrl(info: AudioInfo, hash: string, voice: SpeechVoice = 'main'): string {
  const v = availableVoice(info, voice)
  const base = v === 'main' ? info.base_url : v === 'alt' ? info.alt_base_url : info.voices?.[v]?.base_url
  return `${base}/${hash}${info.ext}`
}

/** Every voice's credit line, once each (their licences ask for them to be shown). */
export function voiceCredits(info: AudioInfo): string[] {
  const all = [info.credit, info.alt_credit, ...Object.values(info.voices ?? {}).map((v) => v.credit)]
  return [...new Set(all.filter((c): c is string => Boolean(c)))]
}
