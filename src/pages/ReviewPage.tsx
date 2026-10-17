import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { learnService } from '@/api/services/learnService'
import { LearnSessionScreen } from '@/components/learnSession/LearnSessionScreen'
import { TRACK_LABEL, isLearningTrack } from '@/lib/learn/paths'

/**
 * /review: "Review all", one queue of due cards across hiragana, katakana and
 * kanji (relearning first, then lowest recall chance). `?track=` limits it to
 * one track. Question types are chosen by the server.
 */
export function ReviewPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const param = params.get('track')
  const track = isLearningTrack(param) ? param : undefined
  const start = useCallback(() => learnService.startReview(track ? { track } : {}), [track])
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
