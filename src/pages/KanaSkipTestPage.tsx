import { useCallback, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { skipTestFor, unitsForScope, type KanaSkipTestDef } from '@/lib/content/kana/scripts'
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
import {
  buildQuestions,
  quizOptionsFor,
  CertificatePanel,
  QuizResults,
  QuizRunner,
  recordQuizReviews,
  scoreByUnit,
  SkipResultsList,
  SkipTestIntro,
  skipTargets,
  useQuizSession,
  type QuizAnswer,
} from '@/components/kanaQuiz'

/** /kana/<script>/skip/:scope — test out of a group of units; units scored ≥ the skip pass mark (90%) are marked skipped. */
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

function SkipTest({ test, all }: { test: KanaSkipTestDef; all: KanaChar[] }) {
  const navigate = useNavigate()
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  const progress = useKanaProgressStore()
  const { scope, title } = test
  const passMark = script.finalTest.passMark
  const skipPassMark = script.skipPassMark
  const best = useLearningPath().skipTests?.[scope]
  const units = useMemo(() => unitsForScope(script, scope), [script, scope])
  const [started, setStarted] = useState(false)
  // Stable for the intro's question count; a fresh draw is made on every start.
  const questionCount = useMemo(() => skipTargets(script, units, all).length, [script, units, all])

  const onFinish = useCallback(
    (answers: QuizAnswer[]) => {
      const scores = scoreByUnit(answers, units, skipPassMark)
      const overall = answers.filter((a) => a.correct).length / Math.max(1, answers.length)
      path.recordSkipTest(scope, overall, scores.filter((s) => s.passed).map((s) => s.unit.id))
      // Only the whole-script test counts towards the certificate (scored over all of its questions).
      if (scope === 'all') path.recordFinalTest(overall, overall >= passMark)
      void recordQuizReviews(progress, answers)
    },
    [scope, units, path, progress, passMark, skipPassMark],
  )
  const session = useQuizSession(() => [], onFinish)

  const start = useCallback(() => {
    session.start(buildQuestions(skipTargets(script, units, all), all, quizOptionsFor(script, supported)))
    setStarted(true)
  }, [session, script, units, all, supported])
  const exit = useCallback(() => navigate(`${script.basePath}/tests`), [navigate, script.basePath])
  const backToLearn = useCallback(() => navigate(script.basePath), [navigate, script.basePath])

  const scores = useMemo(
    () => (session.done ? scoreByUnit(session.answers, units, skipPassMark) : []),
    [session.done, session.answers, units, skipPassMark],
  )

  if (!started) {
    return (
      <PracticeShell title={title} onExit={exit}>
        <SkipTestIntro test={test} questionCount={questionCount} unitCount={units.length} best={best} speech={supported} onStart={start} />
      </PracticeShell>
    )
  }

  if (!session.done) return <QuizRunner title={title} session={session} onExit={exit} />

  const passedCount = scores.filter((s) => s.passed).length
  const toLearn = scores.filter((s) => !s.passed).map((s) => s.unit)
  const firstMissed = toLearn[0]
  const allPassed = toLearn.length === 0
  const overall = session.correctCount / Math.max(1, session.answers.length)
  const missed = session.answers.filter((a) => !a.correct).map((a) => a.question.target)

  const headline = allPassed
    ? scope === 'all' || units.length > 1
      ? 'You tested out of everything!'
      : `You tested out of ${units[0]?.title ?? 'this unit'}!`
    : passedCount > 0
      ? `You tested out of ${passedCount} unit${passedCount === 1 ? '' : 's'}. Learn ${toLearn.length === 1 ? 'this one' : `these ${toLearn.length}`}: ${toLearn.map((u) => u.title).join(', ')}.`
      : `No units tested out this time, and that's fine. Each unit needs ${Math.round(skipPassMark * 100)}%, and the lessons will get you there.`

  return (
    <PracticeShell title={title} progress={1} onExit={exit}>
      <QuizResults
        correct={session.correctCount}
        total={session.answers.length}
        passed={allPassed}
        passMark={skipPassMark}
        detail={
          <>
            <p className="font-semibold text-on-surface">{headline}</p>
            {scope === 'all' && (
              <p>
                {overall >= passMark
                  ? `That's ${Math.round(overall * 100)}% overall, a pass on the final test. Your certificate is below.`
                  : `The certificate needs ${Math.round(passMark * 100)}% overall; you scored ${Math.round(overall * 100)}%.`}
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
                {passedCount === 0 ? 'Start learning' : `Start with ${firstMissed.title}`}
                <Icon name="arrow_forward" className="text-xl" />
              </Button>
            )}
            <Button variant="outline" onClick={start} className="flex min-h-12 items-center justify-center gap-2">
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
