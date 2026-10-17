import { useMemo } from 'react'
import type { KanaChar } from '@/types'
import type { FinalTestResult } from '@/api/services/learningPathService'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useLearningPath } from '@/hooks/useLearningPath'
import { kanaPreview, unitKana, unitStatusSummary, type UnitStatusSummary } from '@/components/learn/unitStatus'

/** One unit as the Course page shows it. */
export interface CourseUnitView {
  unit: KanaUnit
  /** 1-based position in the course. */
  number: number
  status: UnitStatusSummary
  /** Finished: every step done, or tested out (same rule as isUnitComplete). */
  complete: boolean
  /** Best unit-quiz score, 0–1, if the quiz was taken. */
  quizBest?: number
  preview: { text: string; truncated: boolean }
}

export interface CourseUnits {
  units: CourseUnitView[]
  byId: ReadonlyMap<string, CourseUnitView>
  /** The first unit that isn't finished; undefined once all are. */
  next?: CourseUnitView
  /** Nothing started yet: no step done, no kana opened, nothing tested out. */
  isFresh: boolean
  finalTest?: FinalTestResult
}

/**
 * Every unit's status for the Course page (rows, Continue card, rail), from
 * the learning path. Re-renders when it changes.
 */
export function useCourseUnits(kanaById: ReadonlyMap<string, KanaChar>): CourseUnits {
  const { units: scriptUnits } = useKanaScript()
  const path = useLearningPath()

  return useMemo(() => {
    const units = scriptUnits.map((unit, i): CourseUnitView => {
      const status = unitStatusSummary(unit, path.units[unit.id])
      return {
        unit,
        number: i + 1,
        status,
        complete: status.state === 'done' || status.state === 'skipped',
        quizBest: path.units[unit.id]?.quizBest,
        preview: kanaPreview(unitKana(unit, kanaById)),
      }
    })
    return {
      units,
      byId: new Map(units.map((u) => [u.unit.id, u])),
      next: units.find((u) => !u.complete),
      isFresh: units.every((u) => u.status.state === 'not-started'),
      finalTest: path.finalTest,
    }
  }, [scriptUnits, path, kanaById])
}

/** "72%" from a 0–1 score. */
export function percent(score: number): string {
  return `${Math.round(score * 100)}%`
}

/**
 * Offsets for the sticky chrome above Course content: site nav (80) +
 * SectionNav (48) + a small gap. Used for the rail's `top` and the
 * scroll margin of hash targets (#unit-<id>, #practice).
 */
export const STICKY_RAIL_TOP = 'lg:top-[calc(theme(spacing.nav)+theme(spacing.12)+theme(spacing.6))]'
export const HASH_SCROLL_MARGIN = 'scroll-mt-[calc(theme(spacing.nav)+theme(spacing.12)+theme(spacing.4))]'
