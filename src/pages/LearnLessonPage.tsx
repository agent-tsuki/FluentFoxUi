import { useCallback, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { learnService } from '@/api/services/learnService'
import { LearnSessionScreen } from '@/components/learnSession/LearnSessionScreen'
import { kanaBasePath } from '@/lib/content/kana/scriptIds'
import { kanjiLevelPath } from '@/lib/content/kanji/levels'
import { TRACK_LABEL, isLearningTrack } from '@/lib/learn/paths'
import type { LearningTrack } from '@/types/learn'

function courseHome(track: LearningTrack): string {
  return track === 'kanji_n5' ? kanjiLevelPath('n5') : kanaBasePath(track)
}

/**
 * /learn/lesson/:track: a lesson on the learn API. The server picks the next
 * new items in path order; the learner sees each, then a check quiz whose
 * answers create the cards.
 */
export function LearnLessonPage() {
  const { track } = useParams()
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const valid = isLearningTrack(track) ? track : null
  const start = useCallback(() => learnService.startLesson({ track: valid ?? 'hiragana' }), [valid])
  const exit = useCallback(() => navigate(valid ? courseHome(valid) : '/'), [navigate, valid])
  if (!valid) return <Navigate to="/" replace />
  return (
    <main className="min-h-dvh bg-surface pt-nav">
      <LearnSessionScreen
        key={round}
        title={`New ${TRACK_LABEL[valid]}`}
        start={start}
        emptyTitle="Nothing new right now"
        emptyDescription="You have used today's new items for this track, or finished it. Reviews keep what you learned fresh."
        onExit={exit}
        againLabel="Learn more"
        onAgain={() => setRound((r) => r + 1)}
      />
    </main>
  )
}
