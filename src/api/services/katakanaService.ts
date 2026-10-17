import type { KanaSection } from '@/types'
import { kanaContentService } from '@/api/services/kanaContentService'

// Served by GET /content/kana/katakana, with the bundled chart as the fallback (see kanaContentService).

export const katakanaService = {
  getSections: (): Promise<KanaSection[]> => kanaContentService.getSections('katakana'),
}
