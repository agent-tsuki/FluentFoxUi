import type { KanaChar } from '@/types'
import type { KanaMastery } from '@/types/kanaProgress'
import type { UnitProgress } from '@/api/services/learningPathService'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'

export type UnitState = 'not-started' | 'in-progress' | 'done' | 'skipped'

export const UNIT_STATE_LABEL: Record<UnitState, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
  skipped: 'Tested out',
}

/** State shown on a unit card, from the counts useUnitSteps returns. */
export function unitState(completed: number, total: number, anyKanaOpened: boolean, skipped = false): UnitState {
  if (completed >= total) return 'done'
  if (skipped) return 'skipped'
  return completed > 0 || anyKanaOpened ? 'in-progress' : 'not-started'
}

/**
 * Whether a unit is finished: tested out with a skip test, or every step done. Mirrors the rules in useUnitSteps
 * (which is a per-unit hook and can't be called in a loop); the path section
 * needs it for all 13 units to find the next suggested one.
 */
export function isUnitComplete(
  unit: KanaUnit,
  progress: UnitProgress | undefined,
  mastery: (id: string) => KanaMastery,
): boolean {
  const p = progress ?? {}
  if (p.skippedAt) return true
  return (
    (!unit.youtubeId || Boolean(p.watchedAt)) &&
    unit.kanaIds.every((id) => mastery(id) !== 'new') &&
    Boolean(p.practisedAt) &&
    Boolean(p.printedAt) &&
    Boolean(p.quizPassedAt)
  )
}

/** The unit's kana objects in unit order (unknown ids are skipped). */
export function unitKana(unit: KanaUnit, byId: ReadonlyMap<string, KanaChar>): KanaChar[] {
  return unit.kanaIds.flatMap((id) => {
    const char = byId.get(id)
    return char ? [char] : []
  })
}

const PREVIEW_GLYPHS = 6

/** A short kana preview for a card: as many whole kana as fit in ~6 glyphs. */
export function kanaPreview(kana: KanaChar[]): { text: string; truncated: boolean } {
  let text = ''
  for (const char of kana) {
    if (text.length + char.character.length > PREVIEW_GLYPHS) return { text, truncated: true }
    text += char.character
  }
  return { text, truncated: false }
}

export interface UnitStatusSummary {
  state: UnitState
  /** Steps done / steps offered (the same counts useUnitSteps returns). */
  completed: number
  total: number
}

/**
 * A unit's status without the per-unit hook, for lists of every unit (the
 * course menu). Mirrors useUnitSteps: 'watch' only counts when the unit has a
 * video; 'learn' is done once every kana has been opened.
 */
export function unitStatusSummary(
  unit: KanaUnit,
  progress: UnitProgress | undefined,
  mastery: (id: string) => KanaMastery,
): UnitStatusSummary {
  const p = progress ?? {}
  const done = [
    ...(unit.youtubeId ? [Boolean(p.watchedAt)] : []),
    unit.kanaIds.every((id) => mastery(id) !== 'new'),
    Boolean(p.practisedAt),
    Boolean(p.printedAt),
    Boolean(p.quizPassedAt),
  ]
  const completed = done.filter(Boolean).length
  const anyOpened = unit.kanaIds.some((id) => mastery(id) !== 'new')
  return { state: unitState(completed, done.length, anyOpened, Boolean(p.skippedAt)), completed, total: done.length }
}
