import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanjiEntry, KanjiUnit } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelData } from '@/hooks/useKanji'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearnTest } from '@/hooks/useLearnTest'
import { kanjiTrack, unitQuizRequest } from '@/lib/learn/practiceSession'
import type { LearnQuestion, LearningTrack, SessionStart } from '@/types/learn'
import { TestGate } from '@/components/learnSession/TestGate'
import { KanjiTestsComingSoon } from '@/components/kanji/KanjiTestsComingSoon'
import { kanjiTestQuestions, saveKanjiTestAnswer } from '@/components/kanjiQuiz/testQuestions'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import { useKanjiAnswerMode } from '@/components/kanjiQuiz/answerMode'
import { buildKanjiQuestion } from '@/components/kanjiQuiz/buildKanjiQuestions'
import type { KanjiQuestion } from '@/components/kanjiQuiz/types'
import { kanjiLevelPath, kanjiUnitPath } from '@/lib/content/kanji/levels'

/** /kanji/<level>/quiz/:unitId — meaning + reading for each of a unit's kanji. */
export function KanjiUnitQuizPage() {
  const level = useKanjiLevel()
  const { unitId } = useParams<{ unitId: string }>()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const unit = data?.index.units.find((u) => u.id === unitId)
  const navigate = useNavigate()
  const track = kanjiTrack(level.id)

  if (data && !unit) return <Navigate to={kanjiLevelPath(level.id)} replace />
  if (!track) return <KanjiTestsComingSoon levelLabel={level.label} onBack={() => navigate(kanjiLevelPath(level.id))} />

  return (
    <main className="min-h-dvh bg-surface pt-nav">
      {isLoading && <LoadingState label="Loading quiz…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load this quiz." onRetry={refetch} />}
      {data && unit && <UnitQuiz key={unit.id} unit={unit} track={track} byChar={data.byChar} pool={data.entries} />}
    </main>
  )
}

/** A unit quiz on the learn API: the server asks the meaning and reading of each of the unit's kanji. */
function UnitQuiz({ unit, track, byChar, pool }: { unit: KanjiUnit; track: LearningTrack; byChar: ReadonlyMap<string, KanjiEntry>; pool: KanjiEntry[] }) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const [mode, setMode] = useKanjiAnswerMode()
  const unitPath = kanjiUnitPath(level.id, unit.id)
  const title = `${unit.title} quiz`
  const passMark = level.unitQuizPassMark

  const quiz = useKanjiQuizSession(() => [], () => undefined)
  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => unitQuizRequest(track, unit.id), [track, unit.id])
  const { start } = quiz
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanjiTestQuestions(session, byChar, pool, mode)
      setCards(built.cards)
      start(built.questions)
    },
    [byChar, pool, mode, start],
  )
  const test = useLearnTest(request, passMark, onSession)
  const { submit, check, recorder } = test

  useEffect(() => {
    if (quiz.done) submit(quiz.questions.length)
  }, [quiz.done, quiz.questions.length, submit])

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) getKanjiPath(level.id).recordQuiz(unit.id, outcome.score, outcome.passed)
  }, [outcome, level.id, unit.id])

  const onAnswer = useCallback(
    (question: KanjiQuestion, given: string, timer: AnswerTimerControls) => saveKanjiTestAnswer(recorder.answerCard, cards, question, given, timer),
    [recorder.answerCard, cards],
  )
  const back = useCallback(() => navigate(unitPath), [navigate, unitPath])
  const changeMode = useCallback(
    (next: typeof mode) => {
      setMode(next)
      quiz.replaceUpcoming((q) => buildKanjiQuestion(q.target, q.kind, pool, next, q.key))
    },
    [setMode, quiz, pool],
  )

  const gate = <TestGate test={test} questionCount={quiz.questions.length} title={title} onExit={back} />
  if (!test.session || test.starting || test.startFailed || quiz.questions.length === 0) return gate
  if (!quiz.done) return <KanjiQuizRunner title={title} session={quiz} mode={mode} onModeChange={changeMode} onAnswer={onAnswer} onExit={back} />
  if (!outcome) return gate

  return (
    <PracticeShell title={title} progress={1} onExit={back}>
      <KanjiQuizResults
        answers={quiz.answers}
        passMark={passMark}
        score={outcome}
        detail={outcome.passed ? 'These kanji now come back in your reviews.' : 'Look over the unit once more, then try again.'}
        actions={
          <>
            <Button onClick={test.retake} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="refresh" className="text-xl" /> Retry
            </Button>
            <Button variant="outline" onClick={back} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_back" className="text-xl" /> Back to unit
            </Button>
          </>
        }
      />
    </PracticeShell>
  )
}

