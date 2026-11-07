import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Popups a kanji level's pages open over themselves, kept in the URL so links,
 * refresh and Back work: a test-out (`?skip=all` or a group id), the level
 * test (`?test=level`) and a lesson (`?lesson=1`). KanjiTestOverlays in the
 * course layout shows them on every tab (Course, Reviews, Tests…).
 */
export const KANJI_OVERLAY_PARAMS = { skip: 'skip', test: 'test', lesson: 'lesson' } as const

export type KanjiOverlay = { skip: string } | { test: 'level' } | { lesson: true }

function overlayParams(overlay: KanjiOverlay): [string, string] {
  if ('skip' in overlay) return [KANJI_OVERLAY_PARAMS.skip, overlay.skip]
  if ('test' in overlay) return [KANJI_OVERLAY_PARAMS.test, overlay.test]
  return [KANJI_OVERLAY_PARAMS.lesson, '1']
}

/** A link (path + query) that opens `overlay` on the current page (other popups closed, the open unit row kept). */
export function useKanjiOverlayLink(): (overlay: KanjiOverlay) => string {
  const { pathname, search } = useLocation()
  return useCallback(
    (overlay: KanjiOverlay) => {
      const params = new URLSearchParams(search)
      for (const name of Object.values(KANJI_OVERLAY_PARAMS)) params.delete(name)
      params.delete('quiz')
      params.delete('practice')
      const [name, value] = overlayParams(overlay)
      params.set(name, value)
      return `${pathname}?${params}`
    },
    [pathname, search],
  )
}
