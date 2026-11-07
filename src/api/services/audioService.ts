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
}

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

export const audioService = {
  getInfo: async (): Promise<AudioInfo> => (await apiClient.get<ApiResponse<AudioInfo>>('/audio/info')).data,
  /** Where the clips that already exist are; never generates (segments without a url do not exist yet). */
  findClips: async (texts: string[]): Promise<SpeechResult> =>
    (await apiClient.post<ApiResponse<SpeechResult>>('/audio/clips', { texts })).data,
  /** Like findClips, generating the missing clips (a few per request). */
  speak: async (texts: string[]): Promise<SpeechResult> =>
    (await apiClient.post<ApiResponse<SpeechResult>>('/audio/speech', { texts })).data,
}
