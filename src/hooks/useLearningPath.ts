import { useMemo, useSyncExternalStore } from 'react'
import {
  getFinalTests,
  getLearningPath,
  type FinalTestResult,
  type LearningPathState,
  type LearningPathStore,
  type UnitStep,
} from '@/api/services/learningPathService'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'

/** The current script's path store, for writes (markTraced, markPrinted, …). */
export function useLearningPathStore(): LearningPathStore {
  return getLearningPath(useKanaScript().id)
}

/** Live guided-path progress for the current script. */
export function useLearningPath(): LearningPathState {
  const store = useLearningPathStore()
  return useSyncExternalStore(store.subscribe, store.getState)
}

/**
 * Which of a unit's steps are done. 'learn' counts as done once every kana in
 * the unit has been opened in the character sheet (the API's 'traced' step).
 * 'watch' is only offered (and counted) when the unit has a video.
 */
export function useUnitSteps(unit: KanaUnit): {
  steps: UnitStep[]
  done: Record<UnitStep, boolean>
  completed: number
  /** Tested out with a skip test: counts as finished even with steps left. */
  skipped: boolean
} {
  const path = useLearningPath()
  const progress = path.units[unit.id] ?? {}
  const steps: UnitStep[] = unit.youtubeId
    ? ['watch', 'learn', 'practise', 'print', 'quiz']
    : ['learn', 'practise', 'print', 'quiz']
  const done: Record<UnitStep, boolean> = {
    watch: Boolean(progress.watchedAt),
    learn: Boolean(progress.tracedAt),
    practise: Boolean(progress.practisedAt),
    print: Boolean(progress.printedAt),
    quiz: Boolean(progress.quizPassedAt),
  }
  return { steps, done, completed: steps.filter((s) => done[s]).length, skipped: Boolean(progress.skippedAt) }
}

export interface KanaFinalTests {
  hiragana?: FinalTestResult
  katakana?: FinalTestResult
  /** Saves the certificate name to both scripts' stores. */
  saveName: (name: string) => void
}

const saveNameEverywhere = (name: string) => {
  getLearningPath('hiragana').setCertificateName(name)
  getLearningPath('katakana').setCertificateName(name)
}

/**
 * Live final-test results of both kana scripts (for the Kana master
 * certificate), read through getFinalTests. Works on either course, whether
 * or not the other script's course is open in this session.
 */
export function useKanaFinalTests(): KanaFinalTests {
  const hiraPath = getLearningPath('hiragana')
  const kataPath = getLearningPath('katakana')
  const hira = useSyncExternalStore(hiraPath.subscribe, hiraPath.getState)
  const kata = useSyncExternalStore(kataPath.subscribe, kataPath.getState)
  // Both snapshots are dependencies so the result refreshes when either store changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ ...getFinalTests(['hiragana', 'katakana']), saveName: saveNameEverywhere }), [hira, kata])
}
