import { useMemo } from 'react'
import type { KanjiLevelIndex, KanjiUnit } from '@/types/kanji'
import type { FinalTestResult } from '@/api/services/learningPathService'
import type { UnitState } from '@/components/learn/unitStatus'
import { unitState } from '@/components/learn/unitStatus'
import { kanjiUnitSteps } from '@/api/services/kanjiProgressService'
import { KANJI_UNIT_STEPS, type KanjiUnitStep } from '@/lib/content/kanji/courseTypes'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiPath, useKanjiStage } from '@/hooks/useKanji'

/** One kanji unit as the Course page, Tests page and unit page show it. */
export interface KanjiUnitView {
  unit: KanjiUnit
  /** 1-based position in the level. */
  number: number
  done: Record<KanjiUnitStep, boolean>
  completed: number
  total: number
  state: UnitState
  /** Every step done, or tested out. */
  complete: boolean
  quizBest?: number
}

export interface KanjiCourseUnits {
  units: KanjiUnitView[]
  byId: ReadonlyMap<string, KanjiUnitView>
  /** The first unfinished unit; undefined once all are. */
  next?: KanjiUnitView
  isFresh: boolean
  unitsDone: number
  kanjiMastered: number
  levelTest?: FinalTestResult
  skipTests: Partial<Record<string, number>>
}

/** Every unit's status for the current level, live from its path. */
export function useKanjiCourseUnits(index: KanjiLevelIndex): KanjiCourseUnits {
  const level = useKanjiLevel()
  const path = useKanjiPath(level.id)
  const stageOf = useKanjiStage()

  return useMemo(() => {
    const units = index.units.map((unit, i): KanjiUnitView => {
      const unitProgress = path.units[unit.id]
      const done = kanjiUnitSteps(unit, unitProgress)
      const completed = KANJI_UNIT_STEPS.filter((s) => done[s]).length
      const skipped = Boolean(unitProgress?.skippedAt)
      const state = unitState(completed, KANJI_UNIT_STEPS.length, skipped)
      return {
        unit,
        number: i + 1,
        done,
        completed,
        total: KANJI_UNIT_STEPS.length,
        state,
        complete: state === 'done' || state === 'skipped',
        quizBest: unitProgress?.quizBest,
      }
    })
    return {
      units,
      byId: new Map(units.map((u) => [u.unit.id, u])),
      next: units.find((u) => !u.complete),
      isFresh: units.every((u) => u.state === 'not-started'),
      unitsDone: units.filter((u) => u.complete).length,
      kanjiMastered: index.rows.filter((r) => stageOf(r.char) === 'mastered').length,
      levelTest: path.finalTest,
      skipTests: path.skipTests ?? {},
    }
  }, [index, path, stageOf])
}

/** "72%" from a 0–1 score. */
export function percent(score: number): string {
  return `${Math.round(score * 100)}%`
}
