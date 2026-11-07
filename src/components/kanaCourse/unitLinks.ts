/**
 * Where a kana unit lives: its row on the course's Learn page, opened in place
 * (`?unit=`), with its quiz as a popup on top (`&quiz=1`). The old unit and
 * quiz pages redirect here, so every link to a unit goes through these.
 */
export const UNIT_PARAM = 'unit'
export const QUIZ_PARAM = 'quiz'
/** A practice mode open as a popup over the unit (`&practice=listen`). */
export const PRACTICE_PARAM = 'practice'

export function unitLearnPath(basePath: string, unitId: string): string {
  return `${basePath}/learn?${UNIT_PARAM}=${encodeURIComponent(unitId)}`
}

export function unitQuizPath(basePath: string, unitId: string): string {
  return `${unitLearnPath(basePath, unitId)}&${QUIZ_PARAM}=1`
}
