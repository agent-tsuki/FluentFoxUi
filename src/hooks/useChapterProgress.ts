import { useCallback, useMemo, useState } from 'react'
import { learnService } from '@/api/services/learnService'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import { CHAPTER_GRAMMAR_TRACK, CHAPTER_VOCAB_TRACK } from '@/lib/learn/paths'
import type { UnitProgressData } from '@/types/learn'

export interface ChapterProgress {
  /** The grammar chapter is complete (its exercise passed, or marked by the learner). */
  completed: boolean
  /** Best exercise score, 0–100, once taken. */
  exerciseBest?: number
  /** Best vocab quiz score, 0–100, once taken. */
  vocabBest?: number
  vocabPassed: boolean
}

export interface ChapterProgressState {
  /** By chapter number. Empty for guests and while loading. */
  byChapter: ReadonlyMap<number, ChapterProgress>
  /** Signed in and verified: progress is kept on the server. */
  enabled: boolean
  isLoading: boolean
  error: Error | null
  refetch: () => void
  /** Marks a chapter complete (its words and sentences join reviews) or takes the mark away. */
  setCompleted: (chapter: number, completed: boolean) => Promise<void>
}

const chapterNumber = (slug: string) => Number(slug.replace(/^ch/, ''))

function merge(grammar: UnitProgressData[], vocab: UnitProgressData[]): Map<number, ChapterProgress> {
  const out = new Map<number, ChapterProgress>()
  const entry = (n: number) => out.get(n) ?? { completed: false, vocabPassed: false }
  for (const u of grammar) {
    const n = chapterNumber(u.unit_slug)
    out.set(n, { ...entry(n), completed: u.completed_at !== null, exerciseBest: u.quiz_best_pct ?? undefined })
  }
  for (const u of vocab) {
    const n = chapterNumber(u.unit_slug)
    out.set(n, { ...entry(n), vocabBest: u.quiz_best_pct ?? undefined, vocabPassed: u.completed_at !== null })
  }
  return out
}

/**
 * A grammar level's chapter progress from the learn API (the grammar_n5 and
 * vocab_n5 tracks): completion, best exercise and vocab quiz scores.
 */
export function useChapterProgress(level: string): ChapterProgressState {
  const { user } = useAuth()
  const enabled = Boolean(user?.emailVerified) && level.toLowerCase() === 'n5'
  const key = enabled ? `chapter-progress-${user?.userId}-${level}` : 'chapter-progress-off'
  const { data, isLoading, error, refetch } = useAsync(key, async () => {
    if (!enabled) return new Map<number, ChapterProgress>()
    const [grammar, vocab] = await Promise.all([learnService.getUnits(CHAPTER_GRAMMAR_TRACK), learnService.getUnits(CHAPTER_VOCAB_TRACK)])
    return merge(grammar, vocab)
  })
  // Marks saved this visit show at once, before the list is fetched again.
  const [overrides, setOverrides] = useState<ReadonlyMap<number, boolean>>(new Map())

  const byChapter = useMemo(() => {
    const out = new Map(data ?? [])
    for (const [n, completed] of overrides) out.set(n, { ...(out.get(n) ?? { vocabPassed: false }), completed })
    return out
  }, [data, overrides])

  const setCompleted = useCallback(
    async (chapter: number, completed: boolean) => {
      setOverrides((o) => new Map(o).set(chapter, completed))
      try {
        await learnService.setChapterCompletion(level.toLowerCase(), `ch${chapter}`, completed)
      } catch (e) {
        setOverrides((o) => {
          const next = new Map(o)
          next.delete(chapter)
          return next
        })
        throw e
      }
    },
    [level],
  )

  return { byChapter, enabled, isLoading: enabled && isLoading, error: enabled ? error : null, refetch, setCompleted }
}
