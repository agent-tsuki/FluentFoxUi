import { createContext, useContext } from 'react'

/** Which unit row is open on a course page (kana Learn, kanji course), and how to change it. */
export interface UnitAccordion {
  openId: string | null
  /** Opens the row, or closes it if it is the open one. */
  toggle: (unitId: string) => void
  startQuiz: (unitId: string) => void
  /** Opens one practice mode for the unit as a popup (a kana or kanji practice mode id). */
  startPractice: (unitId: string, mode: string) => void
}

export const UnitAccordionContext = createContext<UnitAccordion | null>(null)

export function useUnitAccordion(): UnitAccordion | null {
  return useContext(UnitAccordionContext)
}
