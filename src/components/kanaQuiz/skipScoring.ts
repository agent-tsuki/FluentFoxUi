import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import { shuffle } from '@/components/practice/listen/pickOptions'
import { drawTargets } from './buildQuestions'
import type { QuizAnswer } from './types'

/**
 * Target kana for each unit (sampled for the big ones, per the script's
 * `skipSample`), shuffled together. Distinct, except for a tiny unit sampled
 * above its size (katakana's ー/ッ unit asks a few loanwords per mark).
 */
export function skipTargets(script: KanaScriptConfig, units: KanaUnit[], all: KanaChar[]): KanaChar[] {
  const targets = units.flatMap((unit) => {
    const unitKana = unit.kanaIds.flatMap((id) => all.filter((k) => k.id === id))
    const n = script.skipSample[unit.id]
    if (n === undefined) return unitKana
    return n > unitKana.length ? drawTargets(unitKana, n) : shuffle(unitKana).slice(0, n)
  })
  return shuffle(targets)
}

export interface UnitScore {
  unit: KanaUnit
  correct: number
  total: number
  /** correct / total ≥ the script's skip pass mark (and at least one question asked). */
  passed: boolean
}

/** Per-unit results of a skip test, in the order of `units`. Kana ids are unique across units. */
export function scoreByUnit(answers: QuizAnswer[], units: KanaUnit[], passMark: number): UnitScore[] {
  return units.map((unit) => {
    const mine = answers.filter((a) => unit.kanaIds.includes(a.question.target.id))
    const correct = mine.filter((a) => a.correct).length
    const total = mine.length
    return { unit, correct, total, passed: total > 0 && correct / total >= passMark }
  })
}
