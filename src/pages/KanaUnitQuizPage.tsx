import { useCallback, useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import { useKanaProgressStore } from '@/hooks/useKanaProgress'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import {
  buildQuestions,
  quizOptionsFor,
  drawTargets,
  QuizResults,
  QuizRunner,
  recordQuizReviews,
  useQuizSession,
  type QuizAnswer,
} from '@/components/kanaQuiz'

const QUESTION_COUNT = 10

/** /kana/<script>/quiz/:unitId — a 10-question check on one unit's kana. */
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
      {kana && unitKana.length > 0 && <RowQuiz key={unit.id} unit={unit} unitKana={unitKana} all={kana} />}
    </main>
  )
}

interface RowQuizProps {
  unit: KanaUnit
  unitKana: KanaChar[]
  all: KanaChar[]
}

function RowQuiz({ unit, unitKana, all }: RowQuizProps) {
  const navigate = useNavigate()
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  const progress = useKanaProgressStore()
  const passMark = script.unitQuizPassMark
  const unitPath = `${script.basePath}/unit/${unit.id}`
  const title = `${unit.title} quiz`

  const build = useCallback(
    () => buildQuestions(drawTargets(unitKana, QUESTION_COUNT), all, quizOptionsFor(script, supported)),
    [unitKana, all, supported, script],
  )
  const onFinish = useCallback(
    (answers: QuizAnswer[]) => {
      const score = answers.filter((a) => a.correct).length / Math.max(1, answers.length)
      path.recordQuiz(unit.id, score, score >= passMark)
      void recordQuizReviews(progress, answers)
    },
    [unit.id, path, progress, passMark],
  )
  const session = useQuizSession(build, onFinish)
  const backToUnit = useCallback(() => navigate(unitPath), [navigate, unitPath])
  const missed = useMemo(() => session.answers.filter((a) => !a.correct).map((a) => a.question.target), [session.answers])

  if (!session.done) return <QuizRunner title={title} session={session} onExit={backToUnit} />

  const total = session.questions.length
  const passed = session.correctCount / Math.max(1, total) >= passMark
  return (
    <PracticeShell title={title} progress={1} onExit={backToUnit}>
      <QuizResults
        correct={session.correctCount}
        total={total}
        passed={passed}
        detail={passed ? `You know the ${unit.title}. On to the next unit!` : 'Go over the unit once more, then try again.'}
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
            <Button onClick={() => session.start(build())} className="flex min-h-12 items-center justify-center gap-2">
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
