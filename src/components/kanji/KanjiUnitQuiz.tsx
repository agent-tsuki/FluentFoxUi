import { useCallback, useEffect, useMemo, useState } from 'react'
import type { KanjiEntry, KanjiUnit } from '@/types/kanji'
import type { LearnQuestion, LearningTrack, SessionStart } from '@/types/learn'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearnTest } from '@/hooks/useLearnTest'
import { unitQuizRequest } from '@/lib/learn/practiceSession'
import { TestGate } from '@/components/learnSession/TestGate'
import { useQuizExitGuard } from '@/components/learnSession/useQuizExitGuard'
import { kanjiTestQuestions, saveKanjiTestAnswer } from '@/components/kanjiQuiz/testQuestions'
import { TextButton, TextLink } from '@/components/ui/TextLink'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import { useKanjiAnswerMode } from '@/components/kanjiQuiz/answerMode'
import { buildKanjiQuestion } from '@/components/kanjiQuiz/buildKanjiQuestions'
import type { KanjiQuestion } from '@/components/kanjiQuiz/types'
import { useUnitAccordion } from '@/components/kanaCourse/unitAccordion'
import { useKanjiOverlayLink } from './kanjiOverlays'

interface KanjiUnitQuizProps {
  unit: KanjiUnit
  /** The unit after this one, if any (offered after a pass). */
  next?: KanjiUnit
  track: LearningTrack
  byChar: ReadonlyMap<string, KanjiEntry>
  /** Every kanji of the level (answer options). */
  pool: KanjiEntry[]
  /** Leave the quiz: back to the unit's open row. */
  onExit: () => void
  /** True while questions are being answered: the popup around it then can't be dismissed. */
  onRunningChange?: (running: boolean) => void
}

/**
 * A kanji unit quiz on the learn API, in a popup over the course page: the
 * server asks the meaning and reading of each of the unit's kanji and scores
 * the attempt; passing it finishes the unit. Leaving part way asks first and
 * scores the attempt (useQuizExitGuard). After a pass the result offers the
 * next unit (opened in place) or, after the last one, the level test.
 */
export function KanjiUnitQuiz({ unit, next, track, byChar, pool, onExit, onRunningChange }: KanjiUnitQuizProps) {
  const level = useKanjiLevel()
  const accordion = useUnitAccordion()
  const overlayLink = useKanjiOverlayLink()
  const [mode, setMode] = useKanjiAnswerMode()
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

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) getKanjiPath(level.id).recordQuiz(unit.id, outcome.score, outcome.passed)
  }, [outcome, level.id, unit.id])

  const onAnswer = useCallback(
    (question: KanjiQuestion, given: string, timer: AnswerTimerControls) => saveKanjiTestAnswer(recorder.answerCard, cards, question, given, timer),
    [recorder.answerCard, cards],
  )
  const changeMode = useCallback(
    (nextMode: typeof mode) => {
      setMode(nextMode)
      quiz.replaceUpcoming((q) => buildKanjiQuestion(q.target, q.kind, pool, nextMode, q.key))
    },
    [setMode, quiz, pool],
  )

  const gate = <TestGate test={test} questionCount={quiz.questions.length} title={title} onExit={onExit} />
  if (!test.session || test.starting || test.startFailed || quiz.questions.length === 0) return gate
  if (!guard.finished) {
    return (
      <>
        <KanjiQuizRunner
          title={title}
          session={quiz}
          mode={mode}
          onModeChange={changeMode}
          onAnswer={onAnswer}
          onExit={guard.requestExit}
          paused={guard.leaving}
        />
        {guard.prompt}
      </>
    )
  }
  if (!outcome) return gate

  return (
    <PracticeShell title={title} progress={1} onExit={onExit}>
      <KanjiQuizResults
        answers={quiz.answers}
        passMark={passMark}
        score={outcome}
        detail={
          outcome.passed
            ? 'Unit complete. These kanji now come back in your reviews.'
            : guard.quit
              ? `You left after ${answered} of ${quiz.questions.length}, so the rest counted as wrong. Your best score is kept.`
              : 'Look over the unit once more, then try again.'
        }
        actions={
          // The header's ✕ goes back to the unit, so quiet links are enough here.
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 self-center">
            <TextButton onClick={test.retake} tone={outcome.passed ? 'neutral' : 'primary'} leadingIcon="refresh" className="min-h-11">
              Try again
            </TextButton>
            {outcome.passed && next && accordion && (
              <TextButton onClick={() => accordion.toggle(next.id)} trailingIcon="arrow_forward" className="min-h-11">
                Next: {next.title}
              </TextButton>
            )}
            {outcome.passed && !next && (
              <TextLink to={overlayLink({ test: 'level' })} className="min-h-11">
                {level.title} level test
              </TextLink>
            )}
          </div>
        }
      />
    </PracticeShell>
  )
}
