import { grammarService } from '@/api/services/grammarService'
import { useAsync } from '@/hooks/useAsync'

/**
 * The chapter list (id + title) of a grammar level, for navigation and progress.
 * Available synchronously, so the sidebar renders on the first frame.
 */
export function useGrammarChapters(level: string) {
  return useAsync(
    `grammar-list/${level}`,
    () => grammarService.listChapters(level),
    () => grammarService.peekChapters(level),
  )
}
