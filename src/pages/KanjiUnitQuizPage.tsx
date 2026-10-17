import { useCallback } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanjiEntry, KanjiUnit } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelData } from '@/hooks/useKanji'
import { getKanjiPath, recordKanjiReviews } from '@/api/services/kanjiProgressService'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import { useKanjiAnswerMode } from '@/components/kanjiQuiz/answerMode'
import { buildKanjiQuestion, buildMeaningReadingQuiz } from '@/components/kanjiQuiz/buildKanjiQuestions'
import type { KanjiAnswer } from '@/components/kanjiQuiz/types'
import { kanjiLevelPath, kanjiUnitPath } from '@/lib/content/kanji/levels'

/** /kanji/<level>/quiz/:unitId — meaning + reading for each of a unit's kanji. */
export function KanjiUnitQuizPage() {
  const level = useKanjiLevel()
  const { unitId } = useParams<{ unitId: string }>()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const unit = data?.index.units.find((u) => u.id === unitId)

  if (data && !unit) return <Navigate to={kanjiLevelPath(level.id)} replace />

  return (
    <main className="min-h-dvh bg-surface pt-nav">
      {isLoading && <LoadingState label="Loading quiz…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load this quiz." onRetry={refetch} />}
      {data && unit && <UnitQuiz key={unit.id} unit={unit} targets={unit.kanji.flatMap((c) => data.byChar.get(c) ?? [])} pool={data.entries} />}
    </main>
  )
}

function UnitQuiz({ unit, targets, pool }: { unit: KanjiUnit; targets: KanjiEntry[]; pool: KanjiEntry[] }) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const [mode, setMode] = useKanjiAnswerMode()
  const unitPath = kanjiUnitPath(level.id, unit.id)
  const title = `${unit.title} quiz`

  const build = useCallback(() => buildMeaningReadingQuiz(targets, pool, mode), [targets, pool, mode])
  const onFinish = useCallback(
    (answers: KanjiAnswer[]) => {
      const score = answers.filter((a) => a.correct).length / Math.max(1, answers.length)
      getKanjiPath(level.id).recordQuiz(unit.id, score, score >= level.unitQuizPassMark)
      void recordKanjiReviews(answers.map((a) => ({ char: a.question.target.char, face: a.question.face, correct: a.correct })))
    },
    [level, unit.id],
  )
  const session = useKanjiQuizSession(build, onFinish)
  const back = useCallback(() => navigate(unitPath), [navigate, unitPath])
  const changeMode = useCallback(
    (next: typeof mode) => {
      setMode(next)
      session.replaceUpcoming((q) => buildKanjiQuestion(q.target, q.kind, pool, next, q.key))
    },
    [setMode, session, pool],
  )

  if (!session.done) return <KanjiQuizRunner title={title} session={session} mode={mode} onModeChange={changeMode} onExit={back} />

  const passed = session.correctCount / Math.max(1, session.questions.length) >= level.unitQuizPassMark
  return (
    <PracticeShell title={title} progress={1} onExit={back}>
      <KanjiQuizResults
        answers={session.answers}
        passMark={level.unitQuizPassMark}
        detail={passed ? 'These kanji now come back in your reviews.' : 'Look over the unit once more, then try again.'}
        actions={
          <>
            <Button onClick={() => session.start(build())} className="flex min-h-12 items-center justify-center gap-2">
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
