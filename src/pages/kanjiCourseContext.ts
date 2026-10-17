import { useOutletContext } from 'react-router-dom'
import type { KanjiIndexRow, KanjiLevelIndex, KanjiUnit } from '@/types/kanji'

/**
 * Data KanjiCourseLayout shares with its pages (Course, Reviews, Browse,
 * Tests, Downloads) through `<Outlet context>`. The layout owns the index
 * fetch and its loading / error states, so pages render with ready data.
 */
export interface KanjiCourseContext {
  index: KanjiLevelIndex
  /** Index rows by kanji. */
  rowsByChar: ReadonlyMap<string, KanjiIndexRow>
  unitsById: ReadonlyMap<string, KanjiUnit>
  /** Every kanji of the level, course order. */
  chars: readonly string[]
}

/** The level's course data, for a page rendered inside KanjiCourseLayout. */
export function useKanjiCourse(): KanjiCourseContext {
  return useOutletContext<KanjiCourseContext>()
}

export function buildKanjiCourseContext(index: KanjiLevelIndex): KanjiCourseContext {
  return {
    index,
    rowsByChar: new Map(index.rows.map((r) => [r.char, r])),
    unitsById: new Map(index.units.map((u) => [u.id, u])),
    chars: index.rows.map((r) => r.char),
  }
}
