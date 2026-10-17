import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useLearningPath } from '@/hooks/useLearningPath'
import { useKanaMastery } from '@/hooks/useKanaProgress'
import { isUnitComplete } from '@/components/learn/unitStatus'

export interface CourseProgress {
  /** Units finished: every step done, or tested out (isUnitComplete). */
  unitsDone: number
  unitsTotal: number
  /** Kana whose mastery is 'mastered'. */
  kanaMastered: number
  kanaTotal: number
}

/**
 * Live course-wide progress for the header progress line (and anything else
 * that needs the same two numbers). Re-renders when the learning path or any
 * kana's mastery changes. Pass the real kana (`allKana` from useKanaCourse).
 */
export function useCourseProgress(allKana: readonly KanaChar[]): CourseProgress {
  const { units } = useKanaScript()
  const path = useLearningPath()
  const mastery = useKanaMastery()
  return {
    unitsDone: units.filter((u) => isUnitComplete(u, path.units[u.id])).length,
    unitsTotal: units.length,
    kanaMastered: allKana.filter((k) => mastery(k.id) === 'mastered').length,
    kanaTotal: allKana.length,
  }
}
