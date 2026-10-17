import { useCallback, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { KanjiEntry } from '@/types/kanji'
import type { LearningTrack } from '@/types/learn'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelData, useKanjiStrokes } from '@/hooks/useKanji'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import type { AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useStudyRecorder, type StudyRecorderControls } from '@/hooks/useStudyRecorder'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import { learnService } from '@/api/services/learnService'
import {
  choiceAnswer,
  focusChars,
  kanjiPracticeRequest,
  kanjiQuestionType,
  kanjiQuizFacet,
  kanjiTrack,
  typedAnswer,
} from '@/lib/learn/practiceSession'
import { kanjiLevelPath, kanjiUnitPath } from '@/lib/content/kanji/levels'
import { shuffle } from '@/lib/pdf/shared'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { TracePad } from '@/components/kana/TracePad'
import { KanjiQuizRunner } from '@/components/kanjiQuiz/KanjiQuizRunner'
import { KanjiQuizResults } from '@/components/kanjiQuiz/KanjiQuizResults'
import { useKanjiQuizSession } from '@/components/kanjiQuiz/useKanjiQuizSession'
import { useKanjiAnswerMode } from '@/components/kanjiQuiz/answerMode'
import { buildKanjiQuestion, keyReadingLabel } from '@/components/kanjiQuiz/buildKanjiQuestions'
import type { KanjiAnswerMode, KanjiQuestion, KanjiQuestionKind } from '@/components/kanjiQuiz/types'
import { KANJI_PRACTICE_MODES, isKanjiPracticeMode, type KanjiPracticeModeId } from '@/components/kanji/practiceModes'
import { kanjiGlyph } from '@/components/kanji/kanjiGlyph'

const ROUND = 10

/**
 * /kanji/<level>/practice/:mode — a short round on the learn API
 * (POST /learn/practice): a unit's kanji with `?unit=`, otherwise the kanji
 * the server picks as weakest (the first unit when there are none yet).
 * Finishing a round with `?unit=` ticks that unit's Practise step.
 */
export function KanjiPracticePage() {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const { mode } = useParams<{ mode: string }>()
  const track = kanjiTrack(level.id)

  if (!isKanjiPracticeMode(mode)) return <Navigate to={kanjiLevelPath(level.id)} replace />
  if (!track) {
    return (
      <main className="min-h-dvh bg-surface pt-nav">
        <EmptyState
          icon="schedule"
          title={`${level.label} practice is coming soon`}
          description="Practice is saved to your account, and for now that works for N5 kanji."
          actionLabel="Back to the course"
          onAction={() => navigate(kanjiLevelPath(level.id))}
        />
      </main>
    )
  }
  return <PracticeLoader key={mode} mode={mode} track={track} />
}

function PracticeLoader({ mode, track }: { mode: KanjiPracticeModeId; track: LearningTrack }) {
  const level = useKanjiLevel()
  const [params] = useSearchParams()
  const unitId = params.get('unit') ?? undefined
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)
  const recorder = useStudyRecorder(() => learnService.startPractice(kanjiPracticeRequest(track, mode, unitId)))
  const { session } = recorder

  const targets = useMemo(() => {
    if (!data || !session) return []
    const unit = unitId ? data.index.units.find((u) => u.id === unitId) : undefined
    if (unit) return unit.kanji.flatMap((c) => data.byChar.get(c) ?? [])
    const focus = focusChars(session.questions).flatMap((c) => data.byChar.get(c) ?? [])
    // Nothing learned yet: practise the first unit.
    return focus.length ? focus : data.index.units[0].kanji.flatMap((c) => data.byChar.get(c) ?? [])
  }, [data, session, unitId])

  const startFailed = recorder.status === 'start-error' && !session
  return (
    <main className="min-h-dvh bg-surface pt-nav">
      {(isLoading || (!session && !startFailed)) && !error && <LoadingState label="Loading practice…" className="mx-auto max-w-xl px-4 pt-6" />}
      {error && <ErrorState message="We couldn't load this practice." onRetry={refetch} />}
      {startFailed && !error && <ErrorState message="We couldn't start this practice." onRetry={recorder.retry} />}
      {data && targets.length > 0 && <Practice mode={mode} targets={targets} pool={data.entries} unitId={unitId} recorder={recorder} />}
    </main>
  )
}

interface PracticeProps {
  mode: KanjiPracticeModeId
  targets: KanjiEntry[]
  pool: KanjiEntry[]
  unitId?: string
  recorder: StudyRecorderControls
}

function Practice({ mode, targets, pool, unitId, recorder }: PracticeProps) {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const title = KANJI_PRACTICE_MODES.find((m) => m.id === mode)?.title ?? 'Practice'
  const backTo = unitId ? kanjiUnitPath(level.id, unitId) : kanjiLevelPath(level.id)
  const exit = useCallback(() => navigate(backTo), [navigate, backTo])
  const { finish, answer } = recorder
  const finished = useCallback(() => {
    // Unsent answers stay in the answer queue; completing is best-effort for practice.
    finish().catch(() => undefined)
    if (unitId) getKanjiPath(level.id).markPractised(unitId)
  }, [unitId, level.id, finish])
  const onAnswer = useCallback(
    (q: KanjiQuestion, given: string, timer: AnswerTimerControls) => {
      const typed = q.answerKind === 'typed'
      answer(q.target.char, kanjiQuizFacet(q.kind), kanjiQuestionType(q.kind, typed), typed ? typedAnswer(given) : choiceAnswer(given, q.options), timer)
    },
    [answer],
  )

  // Flashcards (self-graded) and writing have no graded question type, so their answers are not sent.
  if (mode === 'flashcards') return <Flashcards title={title} targets={targets} onExit={exit} onFinish={finished} />
  if (mode === 'writing') return <Writing title={title} targets={targets} onExit={exit} onFinish={finished} />
  return <QuizPractice title={title} mode={mode} targets={targets} pool={pool} onExit={exit} onFinish={finished} onAnswer={onAnswer} />
}

const KIND: Record<Exclude<KanjiPracticeModeId, 'flashcards' | 'writing'>, KanjiQuestionKind> = {
  meaning: 'meaning',
  reading: 'reading',
  listening: 'listen',
  lookalikes: 'kanji',
}

interface ModeProps {
  title: string
  targets: KanjiEntry[]
  onExit: () => void
  onFinish: () => void
}

function draw(targets: KanjiEntry[], n: number): KanjiEntry[] {
  const out: KanjiEntry[] = []
  while (out.length < n && targets.length) out.push(...shuffle(targets).slice(0, n - out.length))
  return out
}

interface QuizPracticeProps extends ModeProps {
  mode: keyof typeof KIND
  pool: KanjiEntry[]
  onAnswer: (question: KanjiQuestion, given: string, timer: AnswerTimerControls) => void
}

function QuizPractice({ title, mode, targets, pool, onExit, onFinish, onAnswer }: QuizPracticeProps) {
  const [answerMode, setAnswerMode] = useKanjiAnswerMode()
  const kind = KIND[mode]
  // Look-alikes: prefer kanji that have look-alikes in this level.
  const eligible = useMemo(() => {
    if (mode !== 'lookalikes') return targets
    const withPairs = targets.filter((t) => t.lookAlikes?.some((l) => pool.some((e) => e.char === l.char)))
    return withPairs.length >= 3 ? withPairs : targets
  }, [mode, targets, pool])
  const build = useCallback(
    () => draw(eligible, Math.min(ROUND, Math.max(eligible.length, 5))).map((t, i) => buildKanjiQuestion(t, kind, pool, answerMode, `${t.char}-${i}`)),
    [eligible, kind, pool, answerMode],
  )
  const session = useKanjiQuizSession(build, onFinish)
  const changeMode = useCallback(
    (next: KanjiAnswerMode) => {
      setAnswerMode(next)
      session.replaceUpcoming((q) => buildKanjiQuestion(q.target, q.kind, pool, next, q.key))
    },
    [setAnswerMode, session, pool],
  )

  if (!session.done) {
    const toggle = kind === 'meaning' || kind === 'reading'
    return (
      <KanjiQuizRunner
        title={title}
        session={session}
        mode={toggle ? answerMode : undefined}
        onModeChange={toggle ? changeMode : undefined}
        onAnswer={onAnswer}
        onExit={onExit}
      />
    )
  }
  return (
    <PracticeShell title={title} progress={1} onExit={onExit}>
      <KanjiQuizResults
        answers={session.answers}
        actions={
          <>
            <Button onClick={() => session.start(build())} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="refresh" className="text-xl" /> Play again
            </Button>
            <Button variant="outline" onClick={onExit} className="flex min-h-12 items-center justify-center gap-2">
              <Icon name="arrow_back" className="text-xl" /> Back
            </Button>
          </>
        }
      />
    </PracticeShell>
  )
}

/** Flip a card (kanji → meaning, reading, key word) and say whether you knew it. */
function Flashcards({ title, targets, onExit, onFinish }: ModeProps) {
  const { speak, supported } = useJapaneseSpeech()
  const [deck, setDeck] = useState(() => draw(targets, Math.min(ROUND, targets.length)))
  const [at, setAt] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [missed, setMissed] = useState<KanjiEntry[]>([])
  const card = deck[at]

  const answer = (knew: boolean) => {
    if (!knew) setMissed((m) => [...m, card])
    setFlipped(false)
    if (at + 1 >= deck.length) onFinish()
    setAt((i) => i + 1)
  }

  if (!card) {
    return (
      <PracticeShell title={title} progress={1} onExit={onExit}>
        <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Icon name="celebration" className="text-5xl text-primary" />
          <p className="font-headline text-2xl font-extrabold text-on-surface">
            You knew {deck.length - missed.length} of {deck.length}
          </p>
          {missed.length > 0 && (
            <p lang="ja" className="font-jp text-3xl tracking-wider text-on-surface">
              {missed.map((m) => m.char).join(' ')}
            </p>
          )}
          <div className="mt-4 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              onClick={() => {
                setDeck(missed.length ? missed : draw(targets, Math.min(ROUND, targets.length)))
                setMissed([])
                setAt(0)
              }}
              className="min-h-12"
            >
              {missed.length ? 'Go over the missed ones' : 'New round'}
            </Button>
            <Button variant="outline" onClick={onExit} className="min-h-12">
              Back
            </Button>
          </div>
        </div>
      </PracticeShell>
    )
  }

  const key = card.vocab.find((v) => v.isKey) ?? card.vocab[0]
  return (
    <PracticeShell title={title} progress={at / deck.length} status={`${at + 1} / ${deck.length}`} onExit={onExit}>
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? `${card.char}: ${card.meanings[0]}, ${keyReadingLabel(card)}` : `${card.char}. Show the answer`}
        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-surface-container-low"
      >
        <span lang="ja" className="font-jp text-8xl font-bold leading-none text-on-surface sm:text-9xl">
          {card.char}
        </span>
        {flipped ? (
          <span className="space-y-1">
            <span className="block font-headline text-2xl font-bold text-on-surface">{card.meanings[0]}</span>
            <span lang="ja" className="block font-jp text-xl text-primary">
              {keyReadingLabel(card)}
            </span>
            {key && (
              <span className="block text-sm text-on-surface-variant">
                <span lang="ja" className="font-jp">
                  {key.word}（{key.reading}）
                </span>{' '}
                {key.meaning}
              </span>
            )}
          </span>
        ) : (
          <span className="text-sm text-on-surface-variant">Think of its meaning and reading, then tap to check.</span>
        )}
      </button>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {flipped ? (
          <>
            <Button variant="outline" onClick={() => answer(false)} className="min-h-14">
              Not yet
            </Button>
            <Button onClick={() => answer(true)} className="min-h-14">
              Knew it
            </Button>
          </>
        ) : (
          <>
            {supported && key ? (
              <Button variant="outline" onClick={() => speak(key.reading)} className="flex min-h-14 items-center justify-center gap-2">
                <Icon name="volume_up" className="text-xl" /> Hear the word
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={() => setFlipped(true)} className="min-h-14">
              Show answer
            </Button>
          </>
        )}
      </div>
    </PracticeShell>
  )
}

/** Write each kanji from its meaning and reading on a blank grid. */
function Writing({ title, targets, onExit, onFinish }: ModeProps) {
  const [deck] = useState(() => draw(targets, Math.min(6, targets.length)))
  const [at, setAt] = useState(0)
  const [done, setDone] = useState(false)
  const card = deck[at]

  if (!card) {
    return (
      <PracticeShell title={title} progress={1} onExit={onExit}>
        <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Icon name="celebration" className="text-5xl text-primary" />
          <p className="font-headline text-2xl font-extrabold text-on-surface">You wrote {deck.length} kanji from memory</p>
          <Button variant="outline" onClick={onExit} className="min-h-12">
            Back
          </Button>
        </div>
      </PracticeShell>
    )
  }

  const next = () => {
    setDone(false)
    if (at + 1 >= deck.length) onFinish()
    setAt((i) => i + 1)
  }

  return (
    <PracticeShell title={title} progress={at / deck.length} status={`${at + 1} / ${deck.length}`} onExit={onExit}>
      <p className="mb-4 text-center text-on-surface">
        Write the kanji for <span className="font-bold">“{card.meanings[0]}”</span>{' '}
        <span lang="ja" className="font-jp text-on-surface-variant">
          {keyReadingLabel(card)}
        </span>
      </p>
      <WritingPad key={card.char + at} char={card.char} onDone={() => setDone(true)} />
      <Button onClick={next} variant={done ? 'primary' : 'outline'} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2">
        {done ? 'Next' : 'Skip'} <Icon name="arrow_forward" className="text-xl" />
      </Button>
    </PracticeShell>
  )
}

function WritingPad({ char, onDone }: { char: string; onDone: () => void }) {
  const strokes = useKanjiStrokes(char)
  if (strokes.status === 'ready') return <TracePad glyph={kanjiGlyph(strokes.data)} guide="none" verb="written from memory" onComplete={onDone} />
  if (strokes.status === 'loading') return <LoadingState label="Loading…" />
  return <p className="text-center text-sm text-on-surface-variant">Stroke data isn’t available for this kanji, so skip it.</p>
}
