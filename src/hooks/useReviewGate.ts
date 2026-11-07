import { useCallback, useRef, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnService } from '@/api/services/learnService'
import { useAuth } from '@/context/AuthContext'
import { noReviewsNotice, reviewErrorNotice } from '@/lib/learn/reviewGate'
import { reviewPath } from '@/lib/learn/paths'
import { stashReviewStart } from '@/lib/learn/reviewHandoff'
import { showToast } from '@/store/toastStore'
import type { LearnSummary, LearningTrack } from '@/types/learn'

/** Fallback wording when the summary can't be read either. */
const NOTHING_DUE: LearnSummary = { due_now: 0, due_today: 0, new_left_today: 0, learned: 0, next_unit: null, goal: {} as LearnSummary['goal'] }

/**
 * Click handler for every "Review" link. It starts the review session right
 * here (POST /learn/reviews): with cards it hands the session to /review and
 * goes there; with nothing due, or when the start fails (offline, 4xx, 5xx),
 * it stays on the page and shows a bottom-right toast saying why, with links
 * to other courses.
 *
 * Modified clicks (new tab / window) and guests keep the plain link, so the
 * browser and the sign-in prompt behave as usual.
 */
export function useReviewGate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const checking = useRef(false)

  return useCallback(
    (track?: LearningTrack) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (!user?.emailVerified || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      if (checking.current) return
      checking.current = true
      // Start the real session here, so any failure (4xx, 5xx, offline) shows as a toast on
      // this page instead of an error screen after navigating. A started session is handed
      // to /review, which opens straight into it.
      learnService
        .startReview(track ? { track } : {})
        .then(async (started) => {
          if (started.questions.length > 0) {
            stashReviewStart(track, started)
            navigate(reviewPath(track))
            return
          }
          // Nothing due: the summary words the toast ("3 more later today").
          const summary = await learnService.getSummary(track).catch(() => null)
          showToast((summary && noReviewsNotice(summary, track)) ?? noReviewsNotice(NOTHING_DUE, track) ?? reviewErrorNotice(null))
        })
        .catch((error: unknown) => showToast(reviewErrorNotice(error)))
        .finally(() => {
          checking.current = false
        })
    },
    [navigate, user?.emailVerified],
  )
}
