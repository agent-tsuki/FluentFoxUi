import { useOutletContext } from 'react-router-dom'
import type { KanaChar, KanaSection } from '@/types'

/**
 * Data that KanaCourseLayout shares with its four child pages (Course,
 * Chart, Tests, Downloads) through `<Outlet context>`.
 *
 * The layout fetches the kana sections once and owns the loading and error
 * states, so a child page only ever renders with ready data: no child needs
 * its own fetch, spinner or error screen. Switching pages does not refetch or
 * remount the header and nav.
 */
export interface KanaCourseContext {
  /** The script's chart sections in order (basic, dakuten, combinations, …), spacer slots included. */
  sections: KanaSection[]
  /** Every real kana across all sections in chart order (spacers removed). */
  allKana: KanaChar[]
  /** `allKana` by id, for unit previews (`unitKana(unit, kanaById)`) and lookups. */
  kanaById: ReadonlyMap<string, KanaChar>
  /** Re-run the sections fetch. */
  refetch: () => void
}

/**
 * The current script's course data for a page rendered inside KanaCourseLayout.
 * Only call this from a route that is a child of the layout
 * (`/kana/<script>`, `/chart`, `/tests`, `/downloads`); elsewhere the outlet
 * context is undefined.
 */
export function useKanaCourse(): KanaCourseContext {
  return useOutletContext<KanaCourseContext>()
}
