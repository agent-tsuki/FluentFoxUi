import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanjiEntry, KanjiLevelIndex } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelData } from '@/hooks/useKanji'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useLearnTest } from '@/hooks/useLearnTest'
import { finalTestRequest, kanjiTrack, skipTestRequest } from '@/lib/learn/practiceSession'
import type { LearnQuestion, LearningTrack, SessionStart } from '@/types/learn'
import { TestGate } from '@/components/learnSession/TestGate'
import { kanjiTestQuestions, saveKanjiTestAnswer } from '@/components/kanjiQuiz/testQuestions'
import { KanjiTestsComingSoon } from '@/components/kanji/KanjiTestsComingSoon'
import { kanjiLevelPagePath, kanjiLevelPath } from '@/lib/content/kanji/levels'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { formatClock, formatDuration, useQuizTimer } from '@/components/kanaQuiz/useQuizTimer'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import type { KanjiAnswer, KanjiQuestion } from '@/components/kanjiQuiz/types'
import { formatPercent } from '@/components/kanaCourse/testsPercent'

function Frame({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-surface pt-nav">{children}</main>
}

function Intro({ title, lines, onStart, onExit }: { title: string; lines: string[]; onStart: () => void; onExit: () => void }) {
  return (
    <PracticeShell title={title} onExit={onExit}>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div>
          <Icon name="quiz" className="text-5xl text-primary" />
          <h1 className="mt-3 font-headline text-3xl font-extrabold text-on-surface">{title}</h1>
          <ul className="mt-4 space-y-2 text-on-surface-variant">
            {lines.map((l) => (
              <li key={l} className="flex gap-2">
                <Icon name="check" className="shrink-0 text-lg text-primary" />
                {l}
              </li>
            ))}
          </ul>
        </div>
        <Button onClick={onStart} className="flex min-h-14 w-full items-center justify-center gap-2">
          Start <Icon name="arrow_forward" className="text-xl" />
        </Button>
      </div>
    </PracticeShell>
  )
}

// ─── Test out ────────────────────────────────────────────────────────────────

/**
 * /kanji/<level>/skip/:scope — test out of the whole level (`all`) or one
 * group on the learn API (see SkipTest).
 */
export function KanjiSkipTestPage() {
  const level = useKanjiLevel()
  const { scope = 'all' } = useParams<{ scope: string }>()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const group = data?.index.groups.find((g) => g.id === scope)
  const navigate = useNavigate()
  const track = kanjiTrack(level.id)
  if (data && scope !== 'all' && !group) return <Navigate to={kanjiLevelPagePath(level.id, 'tests')} replace />
  if (!track) return <KanjiTestsComingSoon levelLabel={level.label} onBack={() => navigate(kanjiLevelPath(level.id))} />

  return (
    <Frame>
      {isLoading && <LoadingState label="Loading test…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load this test." onRetry={refetch} />}
      {data && (
        <SkipTest
          key={scope}
          scope={scope}
          track={track}
          title={group ? `Test out: ${group.title}` : `Test out of ${level.label}`}
          index={data.index}
          unitIds={group ? group.unitIds : data.index.units.map((u) => u.id)}
          byChar={data.byChar}
          pool={data.entries}
        />
      )}
    </Frame>
  )
}

interface SkipTestProps {
  scope: string
  title: string
  track: LearningTrack
  index: KanjiLevelIndex
  unitIds: string[]
  byChar: ReadonlyMap<string, KanjiEntry>
  pool: KanjiEntry[]
}

/**
 * The test-out on the learn API: the server asks the meaning and reading of
 * every kanji in scope and scores the whole scope. Passing schedules them all
 * as known, so every unit in scope is marked tested out; the per-unit
 * breakdown shows where to start otherwise.
 */
function SkipTest({ scope, title, track, index, unitIds, byChar, pool }: SkipTestProps) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)
  const back = useCallback(() => navigate(kanjiLevelPagePath(level.id, 'tests')), [navigate, level.id])
  const units = useMemo(() => index.units.filter((u) => unitIds.includes(u.id)), [index, unitIds])

  const quiz = useKanjiQuizSession(() => [], () => undefined)
  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => skipTestRequest(track, scope), [track, scope])
  const { start } = quiz
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanjiTestQuestions(session, byChar, pool, 'choice')
      setCards(built.cards)
      start(built.questions)
    },
    [byChar, pool, start],
  )
  const test = useLearnTest(request, level.skipPassMark, onSession)
  const { submit, check, recorder } = test

  useEffect(() => {
    if (started && quiz.done) submit(quiz.questions.length)
  }, [started, quiz.done, quiz.questions.length, submit])

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) getKanjiPath(level.id).recordSkipTest(scope, outcome.score, outcome.passed ? units.map((u) => u.id) : [])
  }, [outcome, level.id, scope, units])

  const onAnswer = useCallback(
    (question: KanjiQuestion, given: string, timer: AnswerTimerControls) => saveKanjiTestAnswer(recorder.answerCard, cards, question, given, timer),
    [recorder.answerCard, cards],
  )

  const scoreByUnit = useCallback(
    (answers: KanjiAnswer[]) =>
      units.map((u) => {
        const mine = answers.filter((a) => a.question.target.unitId === u.id)
        const right = mine.filter((a) => a.correct).length
        return { unit: u, score: mine.length ? right / mine.length : 0 }
      }),
    [units],
  )

  const gate = <TestGate test={test} questionCount={quiz.questions.length} title={title} onExit={back} />
  if (!test.session || test.starting || test.startFailed || quiz.questions.length === 0) return gate

  if (!started) {
    return (
      <Intro
        title={title}
        lines={[
          `${quiz.questions.length} questions: the meaning and reading of every kanji here (choose the answer).`,
          `Score ${formatPercent(level.skipPassMark)} or more and every unit here is marked done.`,
          'Nothing is locked: you can still open any unit afterwards.',
        ]}
        onStart={() => setStarted(true)}
        onExit={back}
      />
    )
  }
  if (!quiz.done) return <KanjiQuizRunner title={title} session={quiz} onAnswer={onAnswer} onExit={back} />
  if (!outcome) return gate

  const perUnit = scoreByUnit(quiz.answers)
  return (
    <PracticeShell title={title} progress={1} onExit={back}>
      <KanjiQuizResults
        answers={quiz.answers}
        passMark={level.skipPassMark}
        score={outcome}
        detail={outcome.passed ? `You tested out of ${units.length === 1 ? 'this unit' : `all ${units.length} units`}.` : 'Not tested out this time. Your score per unit shows where to start.'}
        breakdown={
          <ul className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/40 bg-surface-container-low">
            {perUnit.map(({ unit, score }) => {
              const ok = score >= level.skipPassMark
              return (
                <li key={unit.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <Icon name={ok ? 'check_circle' : 'radio_button_unchecked'} filled={ok} className={ok ? 'text-lg text-success' : 'text-lg text-on-surface-variant'} />
                  <span className="min-w-0 flex-1 font-semibold text-on-surface">{unit.title}</span>
                  <span className="tabular-nums text-on-surface-variant">
                    {formatPercent(score)} · {ok ? 'Known' : 'Keep learning'}
                  </span>
                </li>
              )
            })}
          </ul>
        }
        actions={
          <>
            <Button onClick={() => navigate(kanjiLevelPath(level.id))} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_forward" className="text-xl" /> Back to the course
            </Button>
            <Button variant="outline" onClick={test.retake} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="refresh" className="text-xl" /> Try again
            </Button>
          </>
        }
      />
    </PracticeShell>
  )
}

// ─── Level test ──────────────────────────────────────────────────────────────

/**
 * /kanji/<level>/test — the timed level test on the learn API: the meaning
 * and reading of every kanji of the level, some typed. Passing unlocks the
 * level certificate on the Tests page.
 */
export function KanjiLevelTestPage() {
  const level = useKanjiLevel()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const navigate = useNavigate()
  const track = kanjiTrack(level.id)
  if (!track) return <KanjiTestsComingSoon levelLabel={level.label} onBack={() => navigate(kanjiLevelPath(level.id))} />
  return (
    <Frame>
      {isLoading && <LoadingState label="Loading test…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load the level test." onRetry={refetch} />}
      {data && <LevelTest track={track} byChar={data.byChar} entries={data.entries} />}
    </Frame>
  )
}

function LevelTest({ track, byChar, entries }: { track: LearningTrack; byChar: ReadonlyMap<string, KanjiEntry>; entries: KanjiEntry[] }) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const { minutes, passMark } = level.levelTest
  const [started, setStarted] = useState(false)
  const title = `${level.title} level test`
  const back = useCallback(() => navigate(kanjiLevelPagePath(level.id, 'tests')), [navigate, level.id])

  const [elapsedAtEnd, setElapsedAtEnd] = useState(0)
  const elapsedMs = useRef<() => number>(() => 0)
  const quiz = useKanjiQuizSession(() => [], () => setElapsedAtEnd(Math.round(elapsedMs.current() / 1000)))
  const timer = useQuizTimer(minutes * 60, started && !quiz.done, quiz.expire)
  elapsedMs.current = timer.getElapsedMs

  const [cards, setCards] = useState<ReadonlyMap<string, LearnQuestion>>(() => new Map())
  const request = useMemo(() => finalTestRequest(track), [track])
  const { start } = quiz
  const { reset: resetTimer } = timer
  const onSession = useCallback(
    (session: SessionStart) => {
      const built = kanjiTestQuestions(session, byChar, entries)
      setCards(built.cards)
      start(built.questions)
      resetTimer()
    },
    [byChar, entries, start, resetTimer],
  )
  const test = useLearnTest(request, passMark, onSession)
  const { submit, check, recorder } = test

  useEffect(() => {
    if (started && quiz.done) submit(quiz.questions.length)
  }, [started, quiz.done, quiz.questions.length, submit])

  const outcome = check.state === 'done' ? check.outcome : undefined
  useEffect(() => {
    if (outcome) getKanjiPath(level.id).recordFinalTest(outcome.score, outcome.passed)
  }, [outcome, level.id])

  const onAnswer = useCallback(
    (question: KanjiQuestion, given: string, answerTimer: AnswerTimerControls) =>
      saveKanjiTestAnswer(recorder.answerCard, cards, question, given, answerTimer),
    [recorder.answerCard, cards],
  )

  const gate = <TestGate test={test} questionCount={quiz.questions.length} title={title} onExit={back} />
  if (!test.session || test.starting || test.startFailed || quiz.questions.length === 0) return gate

  if (!started) {
    return (
      <Intro
        title={title}
        lines={[
          `${quiz.questions.length} questions: the meaning and reading of all ${entries.length} kanji, some typed.`,
          'Readings can be typed in romaji.',
          `${minutes} minutes (the clock pauses when you leave the tab). ${formatPercent(passMark)} to pass; questions not reached count as wrong.`,
          'Pass to earn your certificate. It is a FoxSensei certificate, not an official JLPT result.',
        ]}
        onStart={() => {
          resetTimer()
          setStarted(true)
        }}
        onExit={back}
      />
    )
  }

  if (!quiz.done) {
    return (
      <KanjiQuizRunner
        title={title}
        session={quiz}
        onAnswer={onAnswer}
        status={
          <span>
            {quiz.index + 1}/{quiz.questions.length} · <span aria-hidden>{formatClock(timer.remaining)}</span>
            <span className="sr-only">{formatDuration(timer.remaining)} left</span>
          </span>
        }
        onExit={back}
      />
    )
  }
  if (!outcome) return gate

  return (
    <PracticeShell title={title} progress={1} onExit={back}>
      <KanjiQuizResults
        answers={quiz.answers}
        passMark={passMark}
        score={outcome}
        detail={`Time: ${formatDuration(elapsedAtEnd)}${outcome.passed ? ' · Your certificate is ready on the Tests page.' : ''}`}
        actions={
          <>
            {outcome.passed ? (
              <Button onClick={() => navigate(`${kanjiLevelPagePath(level.id, 'tests')}#certificate`)} className="flex min-h-12 items-center justify-center gap-2">
                <Icon name="workspace_premium" className="text-xl" /> Get your certificate
              </Button>
            ) : (
              <Button onClick={test.retake} className="flex min-h-12 items-center justify-center gap-2">
                <Icon name="refresh" className="text-xl" /> Try again
              </Button>
            )}
            <Button variant="outline" onClick={back} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_back" className="text-xl" /> Back to tests
            </Button>
          </>
        }
      />
    </PracticeShell>
  )
}
