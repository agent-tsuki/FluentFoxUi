import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import { useKanaProgressStore } from '@/hooks/useKanaProgress'
import { useLearningPath, useLearningPathStore } from '@/hooks/useLearningPath'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { shuffle } from '@/components/practice/listen/pickOptions'
import { cn } from '@/lib/cn'
import {
  buildQuestions,
  quizOptionsFor,
  CertificatePanel,
  FinalTestIntro,
  formatClock,
  formatDuration,
  QuizResults,
  QuizRunner,
  recordQuizReviews,
  useQuizSession,
  useQuizTimer,
  type QuizAnswer,
} from '@/components/kanaQuiz'

/** /kana/<script>/test — every kana of the script once, against the clock; unlocks the certificate. */
export function KanaFinalTestPage() {
  const { kana, isLoading, error, refetch } = useKanaSections()
  return (
    <main className="pt-nav min-h-dvh bg-surface">
      {isLoading && <LoadingState label="Loading the test…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load the kana for the test." onRetry={refetch} />}
      {kana && <FinalTest all={kana} />}
    </main>
  )
}

function FinalTest({ all }: { all: KanaChar[] }) {
  const navigate = useNavigate()
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  const progress = useKanaProgressStore()
  // Hiragana: fourteen minutes for all 104 kana, ~8 s each.
  const limitSeconds = script.finalTest.minutes * 60
  const passMark = script.finalTest.passMark
  const title = `${script.label} final test`
  const best = useLearningPath().finalTest?.best
  const [started, setStarted] = useState(false)
  const [timeTaken, setTimeTaken] = useState(0)
  const elapsedMs = useRef<() => number>(() => 0)

  const onFinish = useCallback((answers: QuizAnswer[]) => {
    const score = answers.filter((a) => a.correct).length / Math.max(1, answers.length)
    setTimeTaken(Math.min(limitSeconds, Math.round(elapsedMs.current() / 1000)))
    path.recordFinalTest(score, score >= passMark)
    void recordQuizReviews(progress, answers)
  }, [limitSeconds, passMark, path, progress])
  const session = useQuizSession(() => [], onFinish)
  const timer = useQuizTimer(limitSeconds, started && !session.done, session.expire)
  useLayoutEffect(() => {
    elapsedMs.current = timer.getElapsedMs
  })

  const start = useCallback(() => {
    session.start(buildQuestions(shuffle(all), all, quizOptionsFor(script, supported)))
    timer.reset()
    setStarted(true)
  }, [session, timer, all, supported, script])
  const exit = useCallback(() => navigate(`${script.basePath}/tests`), [navigate, script.basePath])
  const backToCourse = useCallback(() => navigate(script.basePath), [navigate, script.basePath])

  if (!started) {
    return (
      <PracticeShell title={title} onExit={exit}>
        <FinalTestIntro questionCount={all.length} limitSeconds={limitSeconds} best={best} speech={supported} onStart={start} />
        <CertificatePanel className="mt-6" />
      </PracticeShell>
    )
  }

  if (!session.done) {
    const low = timer.remaining <= 60
    return (
      <QuizRunner
        title={title}
        session={session}
        onExit={exit}
        status={
          <span className={cn('flex items-center gap-1', low && 'text-error')}>
            <Icon name="timer" className="text-lg" />
            <span className="sr-only">Time left </span>
            {formatClock(timer.remaining)}
          </span>
        }
        notice={
          <p className="sr-only" aria-live="assertive">
            {low ? 'One minute left.' : ''}
          </p>
        }
      />
    )
  }

  const answers = session.answers
  const total = answers.length
  const passed = session.correctCount / Math.max(1, total) >= passMark
  const notReached = answers.filter((a) => a.chosenId === null).length
  const weakest = answers.filter((a) => !a.correct && a.chosenId !== null).map((a) => a.question.target)

  return (
    <PracticeShell title={title} progress={1} onExit={exit}>
      <QuizResults
        correct={session.correctCount}
        total={total}
        passed={passed}
        detail={
          <>
            <p>Time taken: {formatDuration(timeTaken)}</p>
            {notReached > 0 && <p>Time ran out: {notReached} question{notReached === 1 ? '' : 's'} not reached (counted as wrong).</p>}
          </>
        }
        missed={weakest}
        missedTitle="Your weakest kana"
        missedAction={
          <Button variant="outline" onClick={() => navigate(`${script.basePath}/practice/review`)} className="min-h-11 w-full sm:w-auto">
            Practise these
          </Button>
        }
        actions={
          <>
            <Button onClick={start} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="refresh" className="text-xl" /> Retry
            </Button>
            <Button variant="outline" onClick={backToCourse} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_back" className="text-xl" /> Back to {script.label.toLowerCase()}
            </Button>
          </>
        }
      >
        <CertificatePanel />
      </QuizResults>
    </PracticeShell>
  )
}
