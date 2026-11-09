import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PracticeShellFill } from '@/components/practice/PracticeShell'
import { TestGate } from '@/components/learnSession/TestGate'
import { TestRunner } from '@/components/testCenter/TestRunner'
import { TestResults } from '@/components/testCenter/TestResults'
import { TextButton } from '@/components/ui/TextLink'
import { Icon } from '@/components/ui/Icon'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearnTest } from '@/hooks/useLearnTest'
import { useLearningSettings } from '@/hooks/useLearningSettings'
import { chapterAnswer, chapterTestQuestions, type ChapterQuestions } from '@/lib/learn/chapterQuestions'
import { unitQuizRequest } from '@/lib/learn/practiceSession'
import { DEFAULT_LEARNING_SETTINGS, PERCENT } from '@/lib/learn/learningSettings'
import type { TestAnswer, TestQuestion } from '@/lib/testCenter/types'
import type { LearningTrack, SessionStart } from '@/types/learn'

interface ChapterQuizProps {
  /** vocab_n5 for the vocab quiz, grammar_n5 for the exercise. */
  track: LearningTrack
  chapterSlug: string
  title: string
  onExit: () => void
  /** Once the server has recorded an attempt (refresh the chapter's progress). */
  onRecorded?: (passed: boolean) => void
}

/**
 * A chapter's vocab quiz or exercise on the learn API: the server picks the
 * questions, marks every answer and keeps the score. Answers also schedule
 * the chapter's cards, so taking it puts its words and sentences into
 * reviews. Leaving part way still records the attempt.
 */
export function ChapterQuiz({ track, chapterSlug, title, onExit, onRecorded }: ChapterQuizProps) {
  const { settings } = useLearningSettings()
  const passMark = (settings?.chapter_pass_pct ?? DEFAULT_LEARNING_SETTINGS.chapter_pass_pct) / PERCENT
  const [built, setBuilt] = useState<ChapterQuestions | null>(null)
  const [answers, setAnswers] = useState<TestAnswer[] | null>(null)
  const answered = useRef(0)
  const request = useMemo(() => unitQuizRequest(track, chapterSlug), [track, chapterSlug])
  const onSession = useCallback((session: SessionStart) => {
    setBuilt(chapterTestQuestions(session))
    setAnswers(null)
    answered.current = 0
  }, [])
  const test = useLearnTest(request, passMark, onSession)
  const { recorder, submit, check } = test
  const total = built?.questions.length ?? 0

  const save = useCallback(
    (question: TestQuestion, given: string, timer: AnswerTimerControls) => {
      const card = built?.cards.get(question.id)
      if (!card) return
      answered.current += 1
      recorder.answerCard(card, card.question_type, chapterAnswer(question, given), timer)
    },
    [built, recorder],
  )

  const finish = (all: TestAnswer[]) => {
    setAnswers(all)
    submit(total)
  }
  // Leaving part way counts: unanswered questions score as wrong.
  const leave = () => {
    if (answered.current > 0) submit(total)
    onExit()
  }

  const outcome = check.state === 'done' ? check.outcome : undefined
  const reported = useRef<typeof outcome>(undefined)
  useEffect(() => {
    if (!outcome || reported.current === outcome) return
    reported.current = outcome
    onRecorded?.(outcome.passed)
  }, [outcome, onRecorded])

  if (!test.session || test.starting || test.startFailed || !built || total === 0) {
    return <TestGate test={test} questionCount={total} title={title} onExit={onExit} />
  }

  return (
    <PracticeShellFill.Provider value={false}>
      <div className="py-4">
        {!answers ? (
          <TestRunner
            key={test.session.session.id}
            title={title}
            questions={built.questions}
            onAnswer={save}
            onFinish={finish}
            onExit={leave}
            leaveNote="Leaving still counts this attempt; questions not answered score as wrong."
          />
        ) : (
          <TestResults
            title={title}
            answers={answers}
            onAgain={test.retake}
            againLabel="Try again"
            onDone={onExit}
            doneLabel="Back to the chapter"
            status={<ServerVerdict check={check} passMark={passMark} things={track === 'vocab_n5' ? 'words' : 'sentences'} onRetry={test.retryCheck} />}
          />
        )}
      </div>
    </PracticeShellFill.Provider>
  )
}

interface ServerVerdictProps {
  check: ReturnType<typeof useLearnTest>['check']
  passMark: number
  /** "words" or "sentences": what now comes back in reviews. */
  things: string
  onRetry: () => void
}

function ServerVerdict({ check, passMark, things, onRetry }: ServerVerdictProps) {
  if (check.state === 'error') {
    return (
      <p className="mx-auto mt-2 flex max-w-sm flex-wrap items-center justify-center gap-2 text-sm text-error">
        We couldn’t save your result.
        <TextButton onClick={onRetry} leadingIcon="refresh">
          Try saving again
        </TextButton>
      </p>
    )
  }
  if (check.state !== 'done') return <p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">Saving your result…</p>
  const { passed } = check.outcome
  return (
    <p
      className={
        passed
          ? 'mx-auto mt-2 flex max-w-sm items-center justify-center gap-1.5 text-sm font-semibold text-success'
          : 'mx-auto mt-2 max-w-sm text-sm text-on-surface-variant'
      }
    >
      {passed && <Icon name="check_circle" filled className="text-lg" />}
      {passed
        ? `Passed. These ${things} now come back in your reviews.`
        : `Pass mark is ${Math.round(passMark * PERCENT)}%. These ${things} now come back in your reviews; try again when ready.`}
    </p>
  )
}
