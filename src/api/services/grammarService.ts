import type { GrammarChapter, GrammarChapterSummary } from '@/types/grammar'
import { getMockChapterList, loadMockChapter, peekMockChapter } from '@/api/mock/grammarData'

// ─── Swap mock data for real fetch() calls when the API is ready ──────────────
// listChapters: apiClient.get(`/grammar/${level}/chapters`)
// getChapter:   apiClient.get(`/grammar/${level}/chapters/${id}`)

/**
 * Grammar course content. The chapter list is cheap and always available;
 * chapter bodies are loaded (and cached) one at a time.
 */
export const grammarService = {
  /** Chapters of a level (id + title), sorted by id. [] when the level has no content. */
  listChapters: async (level: string): Promise<GrammarChapterSummary[]> => getMockChapterList(level),

  /** Synchronous read of the chapter list when it is already known (lets navigation render instantly). */
  peekChapters: (level: string): GrammarChapterSummary[] | undefined => getMockChapterList(level),

  /** A full chapter, or `null` when the level has no chapter with that id. */
  getChapter: (level: string, id: number): Promise<GrammarChapter | null> => loadMockChapter(level, id),

  /**
   * Synchronous read of a chapter: the chapter if it's already loaded, `null` if it
   * doesn't exist, `undefined` if it has to be fetched.
   */
  peekChapter: (level: string, id: number): GrammarChapter | null | undefined => {
    const loaded = peekMockChapter(level, id)
    if (loaded) return loaded
    return getMockChapterList(level).some(c => c.id === id) ? undefined : null
  },

  /** Warm the cache for a chapter the learner is likely to open next. Never throws. */
  prefetchChapter: (level: string, id: number): void => {
    loadMockChapter(level, id).catch(() => undefined)
  },
}
