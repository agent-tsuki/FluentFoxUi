import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { KanjiEntry, KanjiLevelId } from '@/types/kanji'
import { useAsync } from '@/hooks/useAsync'
import { kanjiService } from '@/api/services/kanjiService'
import {
  REVIEW_SESSION_SIZE,
  buildReviewQueue,
  getKanjiProgress,
  recordKanjiReviews,
  type ReviewCardRef,
} from '@/api/services/kanjiProgressService'
import { availableKanjiLevels, isKanjiLevelId, kanjiLevelPagePath, KANJI_BASE } from '@/lib/content/kanji/levels'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import { useKanjiAnswerMode } from '@/components/kanjiQuiz/answerMode'
import { buildKanjiQuestion } from '@/components/kanjiQuiz/buildKanjiQuestions'
import type { KanjiAnswer, KanjiAnswerMode, KanjiQuestion } from '@/components/kanjiQuiz/types'
import { shuffle } from '@/lib/pdf/shared'

interface ReviewScope {
  levels: KanjiLevelId[]
  entries: KanjiEntry[]
  byChar: ReadonlyMap<string, KanjiEntry>
  /** Kanji in scope, course order. */
  chars: string[]
}

/**
 * /kanji/reviews/session?level=n5 — the spaced-review runner. Takes the due
 * cards (meaning and reading separately) plus today's new kanji, up to a
 * session's worth, and grades each answer into the schedule. Without
 * `?level=` it reviews every available level.
 */
export function KanjiReviewSessionPage() {
  const [params] = useSearchParams()
  const param = params.get('level') ?? undefined
  const levels = useMemo(() => (isKanjiLevelId(param) && availableKanjiLevels().includes(param) ? [param] : availableKanjiLevels()), [param])
  const { data, isLoading, error, refetch } = useAsync(`kanji-review-${levels.join(',')}`, async (): Promise<ReviewScope> => {
    const details = await Promise.all(levels.map((l) => kanjiService.getLevelDetail(l)))
    const entries = details.flatMap((d) => d.entries)
    return { levels, entries, byChar: new Map(entries.map((e) => [e.char, e])), chars: entries.map((e) => e.char) }
  })

  return (
    <main className="min-h-dvh bg-surface pt-nav">
      {isLoading && <LoadingState label="Loading reviews…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load your reviews." onRetry={refetch} />}
      {data && <ReviewRunner scope={data} backTo={isKanjiLevelId(param) ? kanjiLevelPagePath(param, 'reviews') : `${KANJI_BASE}/${levels[0]}/reviews`} />}
    </main>
  )
}

function pickCards(scope: ReviewScope): ReviewCardRef[] {
  const queue = buildReviewQueue(getKanjiProgress().getState(), scope.chars)
  const fresh = queue.fresh.flatMap((char) => [
    { char, face: 'meaning' as const },
    { char, face: 'reading' as const },
  ])
  // Due cards first (oldest first), then new ones; mixed within the session.
  return shuffle([...queue.due, ...fresh].slice(0, REVIEW_SESSION_SIZE))
}

function toQuestions(cards: ReviewCardRef[], scope: ReviewScope, mode: KanjiAnswerMode): KanjiQuestion[] {
  return cards.flatMap((card, i) => {
    const entry = scope.byChar.get(card.char)
    if (!entry) return []
    const pool = scope.entries.filter((e) => e.jlpt === entry.jlpt)
    return [buildKanjiQuestion(entry, card.face, pool, mode, `${card.char}-${card.face}-${i}`)]
  })
}

function ReviewRunner({ scope, backTo }: { scope: ReviewScope; backTo: string }) {
  const navigate = useNavigate()
  const [mode, setMode] = useKanjiAnswerMode()
  const [round, setRound] = useState(0)
  const cards = useMemo(() => pickCards(scope), [scope, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const back = useCallback(() => navigate(backTo), [navigate, backTo])

  if (cards.length === 0) {
    return (
      <PracticeShell title="Reviews" onExit={back}>
        <EmptyState
          icon="task_alt"
          title="No reviews right now"
          description="Everything is scheduled for later. Learn a few new kanji in your next unit, or come back when reviews are due."
          actionLabel="Back to reviews"
          onAction={back}
        />
      </PracticeShell>
    )
  }
  return <Session key={round} cards={cards} scope={scope} mode={mode} setMode={setMode} onExit={back} onAgain={() => setRound((r) => r + 1)} />
}

interface SessionProps {
  cards: ReviewCardRef[]
  scope: ReviewScope
  mode: KanjiAnswerMode
  setMode: (mode: KanjiAnswerMode) => void
  onExit: () => void
  onAgain: () => void
}

function Session({ cards, scope, mode, setMode, onExit, onAgain }: SessionProps) {
  const build = useCallback(() => toQuestions(cards, scope, mode), [cards, scope, mode])
  const onFinish = useCallback((answers: KanjiAnswer[]) => {
    void recordKanjiReviews(answers.map((a) => ({ char: a.question.target.char, face: a.question.face, correct: a.correct })))
  }, [])
  const session = useKanjiQuizSession(build, onFinish)
  const changeMode = useCallback(
    (next: KanjiAnswerMode) => {
      setMode(next)
      session.replaceUpcoming((q) => buildKanjiQuestion(q.target, q.kind, scope.entries.filter((e) => e.jlpt === q.target.jlpt), next, q.key))
    },
    [setMode, session, scope.entries],
  )

  if (!session.done) {
    return <KanjiQuizRunner title="Reviews" session={session} mode={mode} onModeChange={changeMode} onExit={onExit} />
  }
  return (
    <PracticeShell title="Reviews" progress={1} onExit={onExit}>
      <KanjiQuizResults
        answers={session.answers}
        detail="Right answers come back later; missed ones come back soon."
        missedTitle="Coming back soon"
        actions={
          <>
            <Button onClick={onAgain} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="replay" className="text-xl" /> Keep reviewing
            </Button>
            <Button variant="outline" onClick={onExit} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_back" className="text-xl" /> Done
            </Button>
          </>
        }
      />
    </PracticeShell>
  )
}
