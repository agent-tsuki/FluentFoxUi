/**
 * `/audio/*` API client. `getInfo` and `findClips` are public; `speak` needs a
 * signed-in user with a verified email (call it only then: a 401 would end the
 * session). Clip URLs always come from these responses: the client never
 * guesses one, so the CDN is never asked for a clip that does not exist.
 * Methods unwrap the `{status, data}` envelope.
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'

export interface AudioInfo {
  enabled: boolean
  /** Main voice's CDN folder; names saved clips (base_url + "/" + sha256(sentence) + ext) and marks older folders to drop. */
  base_url?: string
  ext?: string
  /** Credit line to show for the main voice, e.g. "VOICEVOX:冥鳴ひまり". */
  credit?: string
  /** The second voice's folder (a dialogue's other speaker), named like base_url; missing when the API has none. */
  alt_base_url?: string
  alt_credit?: string
  /** The listening cast: each voice key's folder (named like base_url) and credit. */
  voices?: Record<string, { base_url: string; credit?: string }>
}

/**
 * Which voice speaks: "main", "alt" (a dialogue's second voice) or a cast key
 * from `AudioInfo.voices`, e.g. "f1" or "m2" (f… female, m… male).
 */
export type SpeechVoice = string

export interface SpeechSegment {
  text: string
  /** Missing while the clip is not ready yet (limits, or no voice up). */
  url?: string
  voice?: string
}

export interface SpeechResult {
  items: { segments: SpeechSegment[] }[]
  credits: string[]
  /** Some segments have no url yet; ask again for those texts later. */
  pending: boolean
}

/** The API accepts at most this many texts per request. */
export const SPEECH_MAX_TEXTS = 20

/** The request body; `voice` is left out for the main voice (callers send only voices the API lists, see `availableVoice`). */
const speechBody = (texts: string[], voice: SpeechVoice) => (voice === 'main' ? { texts } : { texts, voice })

export const audioService = {
  getInfo: async (): Promise<AudioInfo> => (await apiClient.get<ApiResponse<AudioInfo>>('/audio/info')).data,
  /** Where the clips that already exist are; never generates (segments without a url do not exist yet). */
  findClips: async (texts: string[], voice: SpeechVoice = 'main'): Promise<SpeechResult> =>
    (await apiClient.post<ApiResponse<SpeechResult>>('/audio/clips', speechBody(texts, voice))).data,
  /** Like findClips, generating the missing clips (a few per request). */
  speak: async (texts: string[], voice: SpeechVoice = 'main'): Promise<SpeechResult> =>
    (await apiClient.post<ApiResponse<SpeechResult>>('/audio/speech', speechBody(texts, voice))).data,
}
