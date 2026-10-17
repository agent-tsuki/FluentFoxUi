import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearningPath, useLearningPathStore } from '@/hooks/useLearningPath'
import { useLearnTest } from '@/hooks/useLearnTest'
import { finalTestRequest, kanaTrack } from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { cn } from '@/lib/cn'
import {
  quizOptionsFor,
  CertificatePanel,
  FinalTestIntro,
  formatClock,
  formatDuration,
  QuizResults,
  QuizRunner,
  useQuizSession,
  useQuizTimer,
  type QuizQuestion,
} from '@/components/kanaQuiz'
import { kanaTestQuestions, saveKanaTestAnswer } from '@/components/kanaQuiz/testQuestions'
import { TestGate } from '@/components/learnSession/TestGate'

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

/** The final test on the learn API: every kana of the script once, against the clock. */
function FinalTest({ all }: { all: KanaChar[] }) {
  const navigate = useNavigate()
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  // Hiragana: fourteen minutes for all 104 kana, ~8 s each.
  const limitSeconds = script.finalTest.minutes * 60
  const passMark = script.finalTest.passMark
  const title = `${script.label} final test`
  const best = useLearningPath().finalTest?.best
  const [started, setStarted] = useState(false)
  const [timeTaken, setTimeTaken] = useState(0)
  const elapsedMs = useRef<() => number>(() => 0)

  const quiz = useQuizSession(() => [], () => setTimeTaken(Math.min(limitSeconds, Math.round(elapsedMs.current() / 1000))))
  const timer = useQuizTimer(limitSeconds, started && !quiz.done, quiz.expire)
  useLayoutEffect(() => {
    elapsedMs.current = timer.getElapsedMs
  })

  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => finalTestRequest(kanaTrack(script.id)), [script.id])
  const { start: startQuiz } = quiz
  const { reset: resetTimer } = timer
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanaTestQuestions(session, all, quizOptionsFor(script, supported))
      setCards(built.cards)
      startQuiz(built.questions)
      resetTimer()
    },
    [all, script, supported, startQuiz, resetTimer],
  )
  const learnTest = useLearnTest(request, passMark, onSession)
  const { submit, check, recorder } = learnTest

  useEffect(() => {
    if (started && quiz.done) submit(quiz.questions.length)
  }, [started, quiz.done, quiz.questions.length, submit])

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) path.recordFinalTest(outcome.score, outcome.passed)
  }, [outcome, path])

  const onAnswer = useCallback(
    (question: QuizQuestion, picked: KanaChar, answerTimer: AnswerTimerControls) =>
      saveKanaTestAnswer(recorder.answerCard, cards, question, picked, answerTimer),
    [recorder.answerCard, cards],
  )
  const start = useCallback(() => {
    resetTimer()
    setStarted(true)
  }, [resetTimer])
  const exit = useCallback(() => navigate(`${script.basePath}/tests`), [navigate, script.basePath])
  const backToCourse = useCallback(() => navigate(script.basePath), [navigate, script.basePath])

  const gate = <TestGate test={learnTest} questionCount={quiz.questions.length} title={title} onExit={exit} />
  if (!learnTest.session || learnTest.starting || learnTest.startFailed || quiz.questions.length === 0) return gate

  if (!started) {
    return (
      <PracticeShell title={title} onExit={exit}>
        <FinalTestIntro questionCount={quiz.questions.length} limitSeconds={limitSeconds} best={best} speech={supported} onStart={start} />
        <CertificatePanel className="mt-6" />
      </PracticeShell>
    )
  }

  if (!quiz.done) {
    const low = timer.remaining <= 60
    return (
      <QuizRunner
        title={title}
        session={quiz}
        onAnswer={onAnswer}
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
  if (!outcome) return gate

  const answers = quiz.answers
  const notReached = answers.filter((a) => a.chosenId === null).length
  const weakest = answers.filter((a) => !a.correct && a.chosenId !== null).map((a) => a.question.target)

  return (
    <PracticeShell title={title} progress={1} onExit={exit}>
      <QuizResults
        correct={outcome.correct}
        total={outcome.total}
        passed={outcome.passed}
        passMark={passMark}
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
            <Button onClick={learnTest.retake} className="flex min-h-12 items-center justify-center gap-2">
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
