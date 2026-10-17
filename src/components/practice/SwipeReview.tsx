import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { KanaGrade } from '@/types/kanaProgress'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { kanaReadingLabel, kanaSpeechText } from '@/lib/content/kana/kanaMarks'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PracticeResults, PracticeShell } from './PracticeShell'
import { ReviewCard, type CardMotionCustom, type SwipeDirection } from './review/ReviewCard'
import { GradeControls } from './review/GradeControls'
import { useReviewQueue } from './review/useReviewQueue'
import { buildDueSession, buildFallbackSession, type ReviewSessionKind } from './review/buildReviewSession'
import { useReviewKeys } from './review/useReviewKeys'
import { useCompleteOnce } from './useCompleteOnce'
import { withAllKana, type WithAllKanaProps } from './withAllKana'

const TITLE = 'Swipe review'
const EXIT_DIRECTION: Record<KanaGrade, SwipeDirection> = { again: -1, hard: 0, good: 1, easy: 1 }

/** Flashcard review: reveal a kana, then swipe or tap to grade it (FSRS-scheduled). */
function SwipeReviewSession({ kana, all, script, progress, onExit, onComplete }: WithAllKanaProps) {
  const reducedMotion = useReducedMotion()
  const { speak, supported } = useJapaneseSpeech()
  const queue = useReviewQueue(progress)
  const { restart, current, position } = queue
  const [kind, setKind] = useState<ReviewSessionKind>('review')
  const [phase, setPhase] = useState<'idle' | 'empty' | 'playing'>('idle')
  // Revealed state is tied to a queue position so the next card never renders revealed.
  const [revealedAt, setRevealedAt] = useState(-1)
  const [exitDirection, setExitDirection] = useState<SwipeDirection>(1)
  const [announcement, setAnnouncement] = useState('')
  const cardRef = useRef<HTMLDivElement | null>(null)
  // The leaving card unmounts after the new one mounts; ignore its null so the ref stays on the new card.
  const setCardRef = useCallback((el: HTMLDivElement | null) => {
    if (el) cardRef.current = el
  }, [])
  const controlsRef = useRef<HTMLDivElement>(null)
  const revealed = revealedAt === position

  const startDue = useCallback(() => {
    const cards = buildDueSession(progress, kana, all)
    setKind('review')
    setRevealedAt(-1)
    if (cards.length === 0) return setPhase('empty')
    restart(cards)
    setPhase('playing')
  }, [progress, kana, all, restart])

  const startFallback = useCallback(() => {
    const session = buildFallbackSession(progress, kana)
    setKind(session.kind)
    setRevealedAt(-1)
    restart(session.cards)
    setPhase('playing')
  }, [progress, kana, restart])

  useEffect(() => {
    startDue()
    void import('ts-fsrs') // warm the scheduler chunk so the first grade is instant
  }, [startDue])

  // New card: put focus back on "Show answer" for keyboard and screen-reader users.
  useEffect(() => {
    if (phase === 'playing') controlsRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [phase, position])

  const reveal = useCallback(() => {
    if (!current || revealed) return
    setRevealedAt(position)
    speak(kanaSpeechText(current.kana, script.sampleWords))
    setAnnouncement(`${current.kana.character} is ${kanaReadingLabel(current.kana)}`)
    cardRef.current?.focus({ preventScroll: true })
  }, [current, revealed, position, speak, script.sampleWords])

  const grade = useCallback(
    (value: KanaGrade) => {
      if (!current || !revealed || queue.busy) return
      setExitDirection(EXIT_DIRECTION[value])
      setAnnouncement(
        value === 'again'
          ? `Not yet. ${current.repeat ? '' : `${current.kana.romaji} will come back.`}`
          : `${value === 'hard' ? 'Hard' : value === 'easy' ? 'Easy' : 'Knew it'}. Next card.`,
      )
      void queue.grade(value)
    },
    [current, revealed, queue],
  )

  useReviewKeys({ enabled: phase === 'playing' && !queue.done, revealed, onReveal: reveal, onGrade: grade })
  useCompleteOnce(phase === 'playing' && queue.done, onComplete)

  if (phase === 'idle') return null

  if (phase === 'empty') {
    const hasFresh = kana.some((k) => !progress.get(k.id)?.card)
    return (
      <PracticeShell title={TITLE} onExit={onExit}>
        <div className="flex flex-1 flex-col">
          <EmptyState icon="check_circle" title="You're all caught up" description={hasFresh ? 'Nothing is due right now. Start a few kana you haven’t reviewed yet?' : 'Nothing is due right now. You can review the soonest ones early.'} className="flex-1" />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={startFallback} className="min-h-12">{hasFresh ? 'Learn new kana' : 'Review early'}</Button>
            <Button variant="outline" onClick={onExit} className="min-h-12">Back to chart</Button>
          </div>
        </div>
      </PracticeShell>
    )
  }

  if (queue.done) {
    const goal = progress.getState().goal
    return (
      <PracticeShell title={TITLE} progress={1} onExit={onExit}>
        <PracticeResults
          headline={`${queue.known} of ${queue.total} known`}
          detail={goal && goal.ids.length > 0 ? `Today's goal: ${goal.doneIds.length} of ${goal.ids.length} done` : undefined}
          missed={queue.missed.map((k) => k.character)}
          onAgain={kind === 'review' ? startDue : startFallback}
          onExit={onExit}
        />
      </PracticeShell>
    )
  }

  return (
    <PracticeShell title={TITLE} progress={position / Math.max(1, queue.length)} status={`${Math.min(position + 1, queue.length)} / ${queue.length}`} onExit={onExit}>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div className="relative min-h-72 flex-1 sm:max-h-[30rem]">
        <AnimatePresence initial={false} custom={{ dir: exitDirection, reduced: reducedMotion } satisfies CardMotionCustom}>
          {current && (
            <ReviewCard
              key={`${current.kana.id}-${position}`}
              cardRef={setCardRef}
              kana={current.kana}
              revealed={revealed}
              draggable={revealed && !queue.busy && !reducedMotion}
              reducedMotion={reducedMotion}
              exitDirection={exitDirection}
              speechSupported={supported}
              onReveal={reveal}
              onSwipe={(dir) => grade(dir === 1 ? 'good' : 'again')}
              onSpeak={() => speak(kanaSpeechText(current.kana, script.sampleWords))}
            />
          )}
        </AnimatePresence>
      </div>
      <GradeControls ref={controlsRef} revealed={revealed} disabled={queue.busy} onReveal={reveal} onGrade={grade} />
    </PracticeShell>
  )
}

/** Needs the full chart only to create today's goal the way the chart page does. */
export const SwipeReview = withAllKana(SwipeReviewSession)
