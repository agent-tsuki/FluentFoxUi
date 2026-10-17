import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { useLearnTest } from '@/hooks/useLearnTest'
import { kanaTrack, unitQuizRequest } from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { quizOptionsFor, QuizResults, QuizRunner, useQuizSession, type QuizQuestion } from '@/components/kanaQuiz'
import { TestGate } from '@/components/learnSession/TestGate'
import { kanaTestQuestions, saveKanaTestAnswer } from '@/components/kanaQuiz/testQuestions'

/** /kana/<script>/quiz/:unitId — a check on one unit's kana. */
export function KanaUnitQuizPage() {
  const script = useKanaScript()
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const unit = script.units.find((u) => u.id === unitId)
  const { kana, isLoading, error, refetch } = useKanaSections()

  if (!unit) return <Navigate to={script.basePath} replace />
  const unitKana = kana ? unit.kanaIds.flatMap((id) => kana.filter((k) => k.id === id)) : []

  return (
    <main className="pt-nav min-h-dvh bg-surface">
      {isLoading && <LoadingState label="Loading quiz…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load the kana for this quiz." onRetry={refetch} />}
      {kana && unitKana.length === 0 && (
        <EmptyState
          icon="quiz"
          title="No kana in this unit yet"
          actionLabel={`Back to ${script.label.toLowerCase()}`}
          onAction={() => navigate(script.basePath)}
        />
      )}
      {kana && unitKana.length > 0 && <RowQuiz key={unit.id} unit={unit} all={kana} />}
    </main>
  )
}

interface RowQuizProps {
  unit: KanaUnit
  all: KanaChar[]
}

/** A unit quiz on the learn API: the server asks each of the unit's kana once and scores the attempt. */
function RowQuiz({ unit, all }: RowQuizProps) {
  const navigate = useNavigate()
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  const passMark = script.unitQuizPassMark
  const unitPath = `${script.basePath}/unit/${unit.id}`
  const title = `${unit.title} quiz`

  const quiz = useQuizSession(() => [], () => undefined)
  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => unitQuizRequest(kanaTrack(script.id), unit.id), [script.id, unit.id])
  const { start } = quiz
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanaTestQuestions(session, all, quizOptionsFor(script, supported))
      setCards(built.cards)
      start(built.questions)
    },
    [all, script, supported, start],
  )
  const test = useLearnTest(request, passMark, onSession)
  const { submit, check, recorder } = test

  useEffect(() => {
    if (quiz.done) submit(quiz.questions.length)
  }, [quiz.done, quiz.questions.length, submit])

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) path.recordQuiz(unit.id, outcome.score, outcome.passed)
  }, [outcome, path, unit.id])

  const onAnswer = useCallback(
    (question: QuizQuestion, picked: KanaChar, timer: AnswerTimerControls) => saveKanaTestAnswer(recorder.answerCard, cards, question, picked, timer),
    [recorder.answerCard, cards],
  )
  const backToUnit = useCallback(() => navigate(unitPath), [navigate, unitPath])
  const missed = useMemo(() => quiz.answers.filter((a) => !a.correct).map((a) => a.question.target), [quiz.answers])

  const gate = <TestGate test={test} questionCount={quiz.questions.length} title={title} onExit={backToUnit} />
  if (!test.session || test.starting || test.startFailed || quiz.questions.length === 0) return gate
  if (!quiz.done) return <QuizRunner title={title} session={quiz} onAnswer={onAnswer} onExit={backToUnit} />
  if (!outcome) return gate

  return (
    <PracticeShell title={title} progress={1} onExit={backToUnit}>
      <QuizResults
        correct={outcome.correct}
        total={outcome.total}
        passed={outcome.passed}
        passMark={passMark}
        detail={outcome.passed ? `You know the ${unit.title}. On to the next unit!` : 'Go over the unit once more, then try again.'}
        missed={missed}
        missedAction={
          <Link
            to={unitPath}
            className="inline-flex min-h-11 items-center gap-1 font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Review them in the {unit.title} unit
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
        }
        actions={
          <>
            <Button onClick={test.retake} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="refresh" className="text-xl" /> Retry
            </Button>
            <Button variant="outline" onClick={backToUnit} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_back" className="text-xl" /> Back to unit
            </Button>
          </>
        }
      />
    </PracticeShell>
  )
}
