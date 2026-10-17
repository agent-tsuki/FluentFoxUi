import type { KanaSection } from '@/types'
import { kanaContentService } from '@/api/services/kanaContentService'

// Served by GET /content/kana/hiragana, with the bundled chart as the fallback (see kanaContentService).

export const hiraganaService = {
  getSections: (): Promise<KanaSection[]> => kanaContentService.getSections('hiragana'),
}
