import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { UnitAccordion } from '@/components/kanaCourse/unitAccordion'
import { PRACTICE_PARAM, QUIZ_PARAM, UNIT_PARAM } from '@/components/kanaCourse/unitLinks'

export interface UnitAccordionParams<M extends string> extends UnitAccordion {
  /** The unit whose quiz popup is open. */
  quizId: string | null
  /** The open practice popup: which unit, which mode. */
  practice: { unitId: string; mode: M } | null
  /** Closes the quiz or practice popup, keeping the row open. */
  closeOverlay: () => void
}

/**
 * The open unit row of a course page and its popup (quiz or a practice
 * mode), kept in the URL (`?unit=ha&quiz=1`, `?unit=ha&practice=listen`) so
 * links, refresh and bookmarks reopen them. Changes replace the history
 * entry: Back leaves the page rather than stepping through rows. Opening a
 * row brings it to the top of the screen. Old `#unit-<id>` links open that
 * row instead. Shared by the kana Learn page and the kanji course page.
 */
export function useUnitAccordionParams<M extends string>(
  unitIds: readonly string[],
  isPracticeMode: (mode: string | null) => mode is M,
): UnitAccordionParams<M> {
  const [params, setParams] = useSearchParams()
  const reducedMotion = useReducedMotion()
  const requested = params.get(UNIT_PARAM)
  const openId = requested && unitIds.includes(requested) ? requested : null
  const quizId = openId && params.get(QUIZ_PARAM) ? openId : null
  const practiceMode = params.get(PRACTICE_PARAM)
  const practiceFor = openId && isPracticeMode(practiceMode) ? practiceMode : null
  // The row last brought into view; null at first, so a link that opens a row (?unit=) scrolls to it too.
  const shown = useRef<string | null>(null)
  useLegacyUnitHash()

  const setOpen = useCallback(
    (unitId: string | null, overlay?: { quiz?: boolean; practice?: string }) => {
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev)
          if (unitId) nextParams.set(UNIT_PARAM, unitId)
          else nextParams.delete(UNIT_PARAM)
          if (overlay?.quiz) nextParams.set(QUIZ_PARAM, '1')
          else nextParams.delete(QUIZ_PARAM)
          if (overlay?.practice) nextParams.set(PRACTICE_PARAM, overlay.practice)
          else nextParams.delete(PRACTICE_PARAM)
          return nextParams
        },
        { replace: true },
      )
    },
    [setParams],
  )

  // After a row opens (a click, or a link such as "Start unit"; the one above it may have closed), bring it into view.
  useEffect(() => {
    if (!openId || openId === shown.current) {
      shown.current = openId
      return
    }
    shown.current = openId
    requestAnimationFrame(() =>
      document.getElementById(`unit-${openId}`)?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' }),
    )
    // Only when another row opens, not when the motion preference flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId])

  return useMemo(
    () => ({
      openId,
      quizId,
      practice: openId && practiceFor ? { unitId: openId, mode: practiceFor } : null,
      toggle: (unitId: string) => setOpen(unitId === openId ? null : unitId),
      startQuiz: (unitId: string) => setOpen(unitId, { quiz: true }),
      startPractice: (unitId: string, mode: string) => setOpen(unitId, { practice: mode }),
      closeOverlay: () => setOpen(openId),
    }),
    [openId, quizId, practiceFor, setOpen],
  )
}

/** Old `#unit-<id>` links (bookmarks, earlier versions) open that row instead. */
function useLegacyUnitHash() {
  const { hash, search, pathname } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (!hash.startsWith('#unit-')) return
    const params = new URLSearchParams(search)
    params.set(UNIT_PARAM, decodeURIComponent(hash.slice('#unit-'.length)))
    navigate({ pathname, search: `?${params}` }, { replace: true })
  }, [hash, search, pathname, navigate])
}
