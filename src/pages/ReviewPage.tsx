import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { learnService } from '@/api/services/learnService'
import { LearnSessionScreen } from '@/components/learnSession/LearnSessionScreen'
import { TRACK_LABEL, isLearningTrack } from '@/lib/learn/paths'
import { clearReviewStart, peekReviewStart } from '@/lib/learn/reviewHandoff'
import { noReviewsNotice, reviewErrorNotice, type ReviewNotice } from '@/lib/learn/reviewGate'
import { showToast } from '@/store/toastStore'
import type { SessionStart } from '@/types/learn'

/** Shown when nothing came back and the summary can't word it either. */
const NO_REVIEWS: ReviewNotice = {
  tone: 'info',
  title: 'No reviews due right now',
  message: "You're all caught up. Cards come back for review as you learn them, so try a new lesson or another course.",
  actions: [
    { label: 'Kana', to: '/kana/hiragana/learn' },
    { label: 'Kanji', to: '/kanji/n5' },
    { label: 'Grammar', to: '/grammar/n5/1' },
  ],
}

/**
 * /review: "Review all", one queue of due cards across hiragana, katakana and
 * kanji (relearning first, then lowest recall chance). `?track=` limits it to
 * one track. Question types are chosen by the server.
 *
 * Opened directly (a link, a bookmark, a reload) the session starts here. If
 * it cannot start (offline, 4xx, 5xx) or nothing is due, the learner gets the
 * same bottom-right toast as the Review buttons and goes back to where they
 * came from, instead of an error or empty screen.
 */
export function ReviewPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [round, setRound] = useState(0)
  const param = params.get('track')
  const track = isLearningTrack(param) ? param : undefined
  // The Review button may have started this session already (useReviewGate); use it for
  // the first round instead of starting another. Later rounds and direct visits start fresh.
  const [handoff] = useState(() => peekReviewStart(track))
  useEffect(() => clearReviewStart(), [])
  // Back to the page the learner came from, or the dashboard when /review was opened first.
  const leave = useCallback(
    (notice: ReviewNotice) => {
      showToast(notice)
      if (location.key === 'default') navigate('/dashboard', { replace: true })
      else navigate(-1)
    },
    [location.key, navigate],
  )
  const start = useCallback((): Promise<SessionStart> => {
    if (round === 0 && handoff) return Promise.resolve(handoff)
    // Leaving unmounts the screen, so the promise stays pending instead of flashing an error state.
    const stay = new Promise<SessionStart>(() => {})
    return learnService.startReview(track ? { track } : {}).then(
      async (started) => {
        if (started.questions.length > 0) return started
        const summary = await learnService.getSummary(track).catch(() => null)
        leave((summary && noReviewsNotice(summary, track)) ?? NO_REVIEWS)
        return stay
      },
      (error: unknown) => {
        leave(reviewErrorNotice(error))
        return stay
      },
    )
  }, [track, round, handoff, leave])
  const exit = useCallback(() => navigate('/dashboard'), [navigate])
  return (
    <main className="min-h-dvh bg-surface pt-nav">
      <LearnSessionScreen
        key={`${track ?? 'all'}-${round}`}
        title={track ? `${TRACK_LABEL[track]} reviews` : 'Review all'}
        start={start}
        emptyTitle="No reviews due"
        emptyDescription="Everything is scheduled for later. Learn something new, or come back when reviews are due."
        onExit={exit}
        againLabel="Review more"
        onAgain={() => setRound((r) => r + 1)}
      />
    </main>
  )
}
