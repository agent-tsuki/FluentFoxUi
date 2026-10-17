import { useEffect } from 'react'
import { grammarService } from '@/api/services/grammarService'
import { useAsync } from '@/hooks/useAsync'

interface Options {
  /** Chapter to prefetch once this one has loaded (typically the next chapter). */
  prefetchId?: number
}

/**
 * One grammar chapter's full content, loaded on demand (each chapter is its own
 * chunk). `id: undefined` means "no chapter" and resolves to `null` without loading.
 * `data` is `null` when the level has no such chapter.
 */
export function useGrammarChapter(level: string, id: number | undefined, { prefetchId }: Options = {}) {
  const state = useAsync(
    `grammar-chapter/${level}/${id ?? '-'}`,
    () => (id === undefined ? Promise.resolve(null) : grammarService.getChapter(level, id)),
    () => (id === undefined ? null : grammarService.peekChapter(level, id)),
  )

  const loaded = Boolean(state.data)
  useEffect(() => {
    if (!loaded || prefetchId === undefined) return
    // Wait until the current chapter has painted, then warm the next one.
    const timer = window.setTimeout(() => grammarService.prefetchChapter(level, prefetchId), 500)
    return () => window.clearTimeout(timer)
  }, [loaded, level, prefetchId])

  return state
}
