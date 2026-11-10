import { grammarService } from '@/api/services/grammarService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import type { ChapterContent } from '@/types/grammar'

/** A grammar chapter's words and sentences from the content API (public), for the Vocabulary and Listening steps. `undefined` loads nothing. */
export function useChapterContent(level: string, chapter: number | undefined): AsyncState<ChapterContent | undefined> {
  const key = level.toLowerCase()
  return useAsync(`grammar-chapter-content/${key}/${chapter ?? '-'}`, () =>
    chapter === undefined ? Promise.resolve(undefined) : grammarService.getChapterContent(key, `ch${chapter}`),
  )
}
