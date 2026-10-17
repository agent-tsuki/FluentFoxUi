import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { skipTestFor, unitsForScope, type KanaSkipTestDef } from '@/lib/content/kana/scripts'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearningPath, useLearningPathStore } from '@/hooks/useLearningPath'
import { useLearnTest } from '@/hooks/useLearnTest'
import { kanaTrack, skipTestRequest } from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import {
  quizOptionsFor,
  CertificatePanel,
  QuizResults,
  QuizRunner,
  scoreByUnit,
  SkipResultsList,
  SkipTestIntro,
  useQuizSession,
  type QuizQuestion,
} from '@/components/kanaQuiz'
import { kanaTestQuestions, saveKanaTestAnswer } from '@/components/kanaQuiz/testQuestions'
import { TestGate } from '@/components/learnSession/TestGate'

/** /kana/<script>/skip/:scope — test out of a group of units (or the whole script) on the learn API. */
export function KanaSkipTestPage() {
  const script = useKanaScript()
  const { scope } = useParams<{ scope: string }>()
  const { kana, isLoading, error, refetch } = useKanaSections()
  const test = skipTestFor(script, scope)
  if (!test) return <Navigate to={script.basePath} replace />
  return (
    <main className="pt-nav min-h-dvh bg-surface">
      {isLoading && <LoadingState label="Loading the test…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load the kana for the test." onRetry={refetch} />}
      {kana && <SkipTest key={test.scope} test={test} all={kana} />}
    </main>
  )
}

/**
 * A skip test on the learn API: the server asks every kana in scope once.
 * Passing it overall schedules them all as known, so every unit in scope is
 * marked tested out; the per-unit breakdown shows where to start otherwise.
 */
function SkipTest({ test, all }: { test: KanaSkipTestDef; all: KanaChar[] }) {
  const navigate = useNavigate()
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  const { scope, title } = test
  const passMark = script.finalTest.passMark
  const skipPassMark = script.skipPassMark
  const best = useLearningPath().skipTests?.[scope]
  const units = useMemo(() => unitsForScope(script, scope), [script, scope])
  const [started, setStarted] = useState(false)

  const quiz = useQuizSession(() => [], () => undefined)
  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => skipTestRequest(kanaTrack(script.id), scope), [script.id, scope])
  const { start: startQuiz } = quiz
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanaTestQuestions(session, all, quizOptionsFor(script, supported))
      setCards(built.cards)
      startQuiz(built.questions)
    },
    [all, script, supported, startQuiz],
  )
  const learnTest = useLearnTest(request, skipPassMark, onSession)
  const { submit, check, recorder } = learnTest

  useEffect(() => {
    if (started && quiz.done) submit(quiz.questions.length)
  }, [started, quiz.done, quiz.questions.length, submit])

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    // A whole-script test scoring the final pass mark also counts towards the
    // certificate; the path derives that from the test history (setScopes).
    if (outcome) path.recordSkipTest(scope, outcome.score, outcome.passed)
  }, [outcome, path, scope])

  const onAnswer = useCallback(
    (question: QuizQuestion, picked: KanaChar, timer: AnswerTimerControls) => saveKanaTestAnswer(recorder.answerCard, cards, question, picked, timer),
    [recorder.answerCard, cards],
  )
  const exit = useCallback(() => navigate(`${script.basePath}/tests`), [navigate, script.basePath])
  const backToLearn = useCallback(() => navigate(script.basePath), [navigate, script.basePath])

  const scores = useMemo(
    () => (quiz.done ? scoreByUnit(quiz.answers, units, skipPassMark) : []),
    [quiz.done, quiz.answers, units, skipPassMark],
  )

  const gate = <TestGate test={learnTest} questionCount={quiz.questions.length} title={title} onExit={exit} />
  if (!learnTest.session || learnTest.starting || learnTest.startFailed || quiz.questions.length === 0) return gate

  if (!started) {
    return (
      <PracticeShell title={title} onExit={exit}>
        <SkipTestIntro
          test={test}
          questionCount={quiz.questions.length}
          unitCount={units.length}
          best={best}
          speech={supported}
          onStart={() => setStarted(true)}
        />
      </PracticeShell>
    )
  }

  if (!quiz.done) return <QuizRunner title={title} session={quiz} onAnswer={onAnswer} onExit={exit} />
  if (!outcome) return gate

  const allPassed = outcome.passed
  const toLearn = allPassed ? [] : scores.filter((s) => !s.passed).map((s) => s.unit)
  const firstMissed = toLearn[0] ?? (allPassed ? undefined : units[0])
  const missed = quiz.answers.filter((a) => !a.correct).map((a) => a.question.target)

  const headline = allPassed
    ? scope === 'all' || units.length > 1
      ? 'You tested out of everything!'
      : `You tested out of ${units[0]?.title ?? 'this unit'}!`
    : `Not tested out this time, and that's fine. It takes ${Math.round(skipPassMark * 100)}% overall, and the lessons will get you there.`

  return (
    <PracticeShell title={title} progress={1} onExit={exit}>
      <QuizResults
        correct={outcome.correct}
        total={outcome.total}
        passed={allPassed}
        passMark={skipPassMark}
        detail={
          <>
            <p className="font-semibold text-on-surface">{headline}</p>
            {scope === 'all' && (
              <p>
                {outcome.score >= passMark
                  ? `That's ${Math.round(outcome.score * 100)}% overall, a pass on the final test. Your certificate is below.`
                  : `The certificate needs ${Math.round(passMark * 100)}% overall; you scored ${Math.round(outcome.score * 100)}%.`}
              </p>
            )}
          </>
        }
        breakdown={<SkipResultsList scores={scores} />}
        missed={missed}
        missedTitle="Kana you missed"
        actions={
          <>
            {firstMissed && (
              <Button
                onClick={() => navigate(`${script.basePath}/unit/${firstMissed.id}`)}
                className="flex min-h-12 items-center justify-center gap-2"
              >
                {`Start with ${firstMissed.title}`}
                <Icon name="arrow_forward" className="text-xl" />
              </Button>
            )}
            <Button variant="outline" onClick={learnTest.retake} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="refresh" className="text-xl" /> Retry
            </Button>
            <Button
              variant={firstMissed ? 'outline' : 'primary'}
              onClick={backToLearn}
              className="flex min-h-12 items-center justify-center gap-2"
            >
              <Icon name="arrow_back" className="text-xl" /> Back to {script.label.toLowerCase()}
            </Button>
          </>
        }
      >
        {scope === 'all' && <CertificatePanel />}
      </QuizResults>
    </PracticeShell>
  )
}
