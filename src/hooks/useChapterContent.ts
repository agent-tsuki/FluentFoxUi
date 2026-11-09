import { grammarService } from '@/api/services/grammarService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import type { ChapterContent } from '@/types/grammar'

/** A grammar chapter's words and sentences from the content API (public), for the Vocabulary and Listening tabs. */
export function useChapterContent(level: string, chapter: number): AsyncState<ChapterContent> {
  const key = level.toLowerCase()
  return useAsync(`grammar-chapter-content/${key}/${chapter}`, () => grammarService.getChapterContent(key, `ch${chapter}`))
}
