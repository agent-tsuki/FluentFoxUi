import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { KanjiEntry, KanjiLevelIndex } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelData } from '@/hooks/useKanji'
import { getKanjiPath, recordKanjiReviews } from '@/api/services/kanjiProgressService'
import { kanjiLevelPagePath, kanjiLevelPath } from '@/lib/content/kanji/levels'
import { shuffle } from '@/lib/pdf/shared'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { formatClock, formatDuration, useQuizTimer } from '@/components/kanaQuiz/useQuizTimer'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import { buildKanjiQuestion } from '@/components/kanjiQuiz/buildKanjiQuestions'
import type { KanjiAnswer, KanjiQuestion, KanjiQuestionKind } from '@/components/kanjiQuiz/types'
import { formatPercent } from '@/components/kanaCourse/testsPercent'

function toReviews(answers: KanjiAnswer[]) {
  return answers.map((a) => ({ char: a.question.target.char, face: a.question.face, correct: a.correct }))
}

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
 * group: a few kanji from every unit, meaning + reading each. Units scored
 * at the pass mark are marked tested out; every answer also feeds reviews,
 * so tested-out kanji still come back now and then.
 */
export function KanjiSkipTestPage() {
  const level = useKanjiLevel()
  const { scope = 'all' } = useParams<{ scope: string }>()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const group = data?.index.groups.find((g) => g.id === scope)
  if (data && scope !== 'all' && !group) return <Navigate to={kanjiLevelPagePath(level.id, 'tests')} replace />

  return (
    <Frame>
      {isLoading && <LoadingState label="Loading test…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load this test." onRetry={refetch} />}
      {data && (
        <SkipTest
          key={scope}
          scope={scope}
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
  index: KanjiLevelIndex
  unitIds: string[]
  byChar: ReadonlyMap<string, KanjiEntry>
  pool: KanjiEntry[]
}

function SkipTest({ scope, title, index, unitIds, byChar, pool }: SkipTestProps) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)
  const back = useCallback(() => navigate(kanjiLevelPagePath(level.id, 'tests')), [navigate, level.id])
  const units = useMemo(() => index.units.filter((u) => unitIds.includes(u.id)), [index, unitIds])

  const build = useCallback((): KanjiQuestion[] => {
    const qs = units.flatMap((u) =>
      shuffle(u.kanji)
        .slice(0, level.skipSamplePerUnit)
        .flatMap((c, i) => {
          const e = byChar.get(c)
          return e
            ? [buildKanjiQuestion(e, 'meaning', pool, 'choice', `${c}-m-${i}`), buildKanjiQuestion(e, 'reading', pool, 'choice', `${c}-r-${i}`)]
            : []
        }),
    )
    return shuffle(qs)
  }, [units, byChar, pool, level.skipSamplePerUnit])

  const scoreByUnit = useCallback(
    (answers: KanjiAnswer[]) =>
      units.map((u) => {
        const mine = answers.filter((a) => a.question.target.unitId === u.id)
        const right = mine.filter((a) => a.correct).length
        return { unit: u, score: mine.length ? right / mine.length : 0 }
      }),
    [units],
  )

  const onFinish = useCallback(
    (answers: KanjiAnswer[]) => {
      const score = answers.filter((a) => a.correct).length / Math.max(1, answers.length)
      const passed = scoreByUnit(answers).filter((u) => u.score >= level.skipPassMark).map((u) => u.unit.id)
      getKanjiPath(level.id).recordSkipTest(scope, score, passed)
      void recordKanjiReviews(toReviews(answers))
    },
    [scope, level, scoreByUnit],
  )
  const session = useKanjiQuizSession(build, onFinish)

  if (!started) {
    return (
      <Intro
        title={title}
        lines={[
          `${units.length * level.skipSamplePerUnit} kanji, meaning and reading for each (choose the answer).`,
          `Units where you score ${formatPercent(level.skipPassMark)} or more are marked done.`,
          'Nothing is locked: you can still open any unit afterwards.',
        ]}
        onStart={() => setStarted(true)}
        onExit={back}
      />
    )
  }
  if (!session.done) return <KanjiQuizRunner title={title} session={session} onExit={back} />

  const perUnit = scoreByUnit(session.answers)
  const passedCount = perUnit.filter((u) => u.score >= level.skipPassMark).length
  return (
    <PracticeShell title={title} progress={1} onExit={back}>
      <KanjiQuizResults
        answers={session.answers}
        detail={`${passedCount} of ${units.length} units tested out.`}
        breakdown={
          <ul className="divide-y divide-outline-variant/40 rounded-2xl border border-outline-variant/40 bg-surface-container-low">
            {perUnit.map(({ unit, score }) => {
              const ok = score >= level.skipPassMark
              return (
                <li key={unit.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <Icon name={ok ? 'check_circle' : 'radio_button_unchecked'} filled={ok} className={ok ? 'text-lg text-success' : 'text-lg text-on-surface-variant'} />
                  <span className="min-w-0 flex-1 font-semibold text-on-surface">{unit.title}</span>
                  <span className="tabular-nums text-on-surface-variant">
                    {formatPercent(score)} · {ok ? 'Tested out' : 'Keep learning'}
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
            <Button variant="outline" onClick={() => session.start(build())} className="flex min-h-12 items-center justify-center gap-2">
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
 * /kanji/<level>/test — the timed level test: questions from every kanji of
 * the level (meaning, reading and "which kanji"), some typed. Passing unlocks
 * the level certificate on the Tests page.
 */
export function KanjiLevelTestPage() {
  const level = useKanjiLevel()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  return (
    <Frame>
      {isLoading && <LoadingState label="Loading test…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load the level test." onRetry={refetch} />}
      {data && <LevelTest entries={data.entries} />}
    </Frame>
  )
}

const KINDS: KanjiQuestionKind[] = ['meaning', 'reading', 'kanji']

function LevelTest({ entries }: { entries: KanjiEntry[] }) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const { questions, minutes, passMark, typedShare } = level.levelTest
  const [started, setStarted] = useState(false)
  const title = `${level.title} level test`
  const back = useCallback(() => navigate(kanjiLevelPagePath(level.id, 'tests')), [navigate, level.id])

  const build = useCallback((): KanjiQuestion[] => {
    const targets = shuffle(entries).slice(0, Math.min(questions, entries.length))
    while (targets.length < questions && entries.length) targets.push(...shuffle(entries).slice(0, questions - targets.length))
    return targets.map((t, i) => {
      const kind = KINDS[i % KINDS.length]
      const typed = kind !== 'kanji' && Math.random() < typedShare / (2 / 3)
      return buildKanjiQuestion(t, kind, entries, typed ? 'typed' : 'choice', `${t.char}-${kind}-${i}`)
    })
  }, [entries, questions, typedShare])

  const [elapsedAtEnd, setElapsedAtEnd] = useState(0)
  const elapsedMs = useRef<() => number>(() => 0)
  const onFinish = useCallback(
    (answers: KanjiAnswer[]) => {
      const score = answers.filter((a) => a.correct).length / Math.max(1, answers.length)
      getKanjiPath(level.id).recordFinalTest(score, score >= passMark)
      void recordKanjiReviews(toReviews(answers.filter((a) => a.given !== null)))
      setElapsedAtEnd(Math.round(elapsedMs.current() / 1000))
    },
    [level.id, passMark],
  )
  const session = useKanjiQuizSession(build, onFinish)
  const timer = useQuizTimer(minutes * 60, started && !session.done, session.expire)
  elapsedMs.current = timer.getElapsedMs

  if (!started) {
    return (
      <Intro
        title={title}
        lines={[
          `${questions} questions from all ${entries.length} kanji: meanings, readings and “which kanji”.`,
          `About ${Math.round(typedShare * 100)}% are typed; readings can be typed in romaji.`,
          `${minutes} minutes (the clock pauses when you leave the tab). ${formatPercent(passMark)} to pass.`,
          'Pass to earn your certificate. It is a FoxSensei certificate, not an official JLPT result.',
        ]}
        onStart={() => {
          timer.reset()
          setStarted(true)
        }}
        onExit={back}
      />
    )
  }

  if (!session.done) {
    return (
      <KanjiQuizRunner
        title={title}
        session={session}
        status={
          <span>
            {session.index + 1}/{session.questions.length} · <span aria-hidden>{formatClock(timer.remaining)}</span>
            <span className="sr-only">{formatDuration(timer.remaining)} left</span>
          </span>
        }
        onExit={back}
      />
    )
  }

  const passed = session.correctCount / Math.max(1, session.questions.length) >= passMark
  return (
    <PracticeShell title={title} progress={1} onExit={back}>
      <KanjiQuizResults
        answers={session.answers}
        passMark={passMark}
        detail={`Time: ${formatDuration(elapsedAtEnd)}${passed ? ' · Your certificate is ready on the Tests page.' : ''}`}
        actions={
          <>
            {passed ? (
              <Button onClick={() => navigate(`${kanjiLevelPagePath(level.id, 'tests')}#certificate`)} className="flex min-h-12 items-center justify-center gap-2">
                <Icon name="workspace_premium" className="text-xl" /> Get your certificate
              </Button>
            ) : (
              <Button
                onClick={() => {
                  timer.reset()
                  session.start(build())
                }}
                className="flex min-h-12 items-center justify-center gap-2"
              >
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
