import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KanaChar } from '@/types'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { useLearnTest } from '@/hooks/useLearnTest'
import { kanaTrack, unitQuizRequest } from '@/lib/learn/practiceSession'
import type { LearnQuestion, SessionStart } from '@/types/learn'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { TextButton } from '@/components/ui/TextLink'
import { JaText } from '@/components/learn/JaText'
import { useUnitAccordion } from './unitAccordion'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { quizOptionsFor, QuizResults, QuizRunner, useQuizSession, type QuizQuestion } from '@/components/kanaQuiz'
import { TestGate } from '@/components/learnSession/TestGate'
import { useQuizExitGuard } from '@/components/learnSession/useQuizExitGuard'
import { kanaUnitQuizQuestions, saveKanaTestAnswer } from '@/components/kanaQuiz/testQuestions'

interface UnitQuizProps {
  unit: KanaUnit
  /** Every kana of the script (for answer options). */
  all: KanaChar[]
  /** Leave the quiz: back to the unit's open row. */
  onExit: () => void
  /** True while questions are being answered: the popup around it then can't be dismissed. */
  onRunningChange?: (running: boolean) => void
}

/**
 * A unit quiz on the learn API: the server picks the questions (each of the
 * unit's kana up to four times, half kana → romaji and half romaji → kana, at
 * most 20) and scores every answer; the result is recorded on the learning
 * path. Leaving part way asks first and scores the attempt (useQuizExitGuard).
 */
export function UnitQuiz({ unit, all, onExit, onRunningChange }: UnitQuizProps) {
  const { supported } = useJapaneseSpeech()
  const script = useKanaScript()
  const path = useLearningPathStore()
  const passMark = script.unitQuizPassMark
  const accordion = useUnitAccordion()
  const nextUnit = script.units[script.units.findIndex((u) => u.id === unit.id) + 1]
  const title = `${unit.title} quiz`

  const quiz = useQuizSession(() => [], () => undefined)
  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => unitQuizRequest(kanaTrack(script.id), unit.id), [script.id, unit.id])
  const { start } = quiz
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanaUnitQuizQuestions(session, all, quizOptionsFor(script, supported))
      setCards(built.cards)
      start(built.questions)
    },
    [all, script, supported, start],
  )
  const test = useLearnTest(request, passMark, onSession)
  const { submit, check, recorder } = test

  const answered = quiz.answers.length
  const guard = useQuizExitGuard({
    sessionId: test.session?.session.id,
    questionCount: quiz.questions.length,
    answered,
    done: quiz.done,
    submit,
    onExit,
    onRunningChange,
  })
  const { finished, quit } = guard

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) path.recordQuiz(unit.id, outcome.score, outcome.passed)
  }, [outcome, path, unit.id])

  const onAnswer = useCallback(
    (question: QuizQuestion, picked: KanaChar, timer: AnswerTimerControls) => saveKanaTestAnswer(recorder.answerCard, cards, question, picked, timer),
    [recorder.answerCard, cards],
  )
  const missed = useMemo(() => quiz.answers.filter((a) => !a.correct).map((a) => a.question.target), [quiz.answers])

  const gate = <TestGate test={test} questionCount={quiz.questions.length} title={title} onExit={onExit} />
  if (!test.session || test.starting || test.startFailed || quiz.questions.length === 0) return gate
  if (!finished) {
    return (
      <>
        <QuizRunner title={title} session={quiz} onAnswer={onAnswer} onExit={guard.requestExit} paused={guard.leaving} />
        {guard.prompt}
      </>
    )
  }
  if (!outcome) return gate

  return (
    <PracticeShell title={title} progress={1} onExit={onExit}>
      <QuizResults
        correct={outcome.correct}
        total={outcome.total}
        passed={outcome.passed}
        passMark={passMark}
        detail={
          outcome.passed
            ? `You know the ${unit.title}. On to the next unit!`
            : quit
              ? `You left after ${answered} of ${quiz.questions.length}, so the rest counted as wrong. Your best score is kept.`
              : 'Go over the unit once more, then try again.'
        }
        missed={missed}
        actions={
          // The header's ✕ goes back to the unit, so quiet links are enough here.
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 self-center">
            <TextButton onClick={test.retake} tone={nextUnit && outcome.passed ? 'neutral' : 'primary'} leadingIcon="refresh" className="min-h-11">
              Try again
            </TextButton>
            {nextUnit && outcome.passed && accordion && (
              <TextButton onClick={() => accordion.toggle(nextUnit.id)} trailingIcon="arrow_forward" className="min-h-11">
                Next: <JaText text={nextUnit.title} />
              </TextButton>
            )}
          </div>
        }
      />
    </PracticeShell>
  )
}

