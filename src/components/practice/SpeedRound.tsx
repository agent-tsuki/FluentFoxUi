import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import type { KanaChar } from '@/types'
import { useAnswerTimer } from '@/hooks/useAnswerTimer'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { choiceAnswer, typedAnswer } from '@/lib/learn/practiceSession'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { isTypeableKana } from '@/lib/content/kana/kanaMarks'
import { PracticeResults, PracticeShell } from './PracticeShell'
import {
  formatClock,
  judgeTyped,
  makeOptions,
  pickNext,
  poolForScore,
  ROUND_MS,
  rowsUnlocked,
} from './speed/speedLogic'
import { useRoundTimer } from './speed/useRoundTimer'
import { useCompleteOnce } from './useCompleteOnce'
import { withAllKana, type WithAllKanaProps } from './withAllKana'

/** How long a wrong answer stays on screen before the next kana. */
const WRONG_PAUSE_MS = 800
/** After ん is accepted from a single "n", a quick second "n" is the learner typing "nn". */
const SWALLOW_N_MS = 400

type Phase = 'intro' | 'playing' | 'done'

interface Feedback {
  kind: 'correct' | 'wrong'
  answer: string
  chosen?: string
}

function readBest(key: string): number {
  try {
    const value = Number(localStorage.getItem(key))
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function saveBest(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* storage blocked: the best score lasts for this visit only */
  }
}

function SpeedRoundSession({ kana: rawKana, all: rawAll, script, onAnswer, onExit, onComplete }: WithAllKanaProps) {
  const kana = useMemo(() => rawKana.filter(isTypeableKana), [rawKana])
  const all = useMemo(() => rawAll.filter(isTypeableKana), [rawAll])
  const bestKey = script.storageKeys.speedBest
  const hasKeyboard = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = useReducedMotion()

  const [phase, setPhase] = useState<Phase>('intro')
  const [runId, setRunId] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [current, setCurrent] = useState<KanaChar | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [typed, setTyped] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [missed, setMissed] = useState<KanaChar[]>([])
  const [best, setBest] = useState(() => readBest(bestKey))
  const [result, setResult] = useState<{ score: number; previousBest: number; newBest: boolean } | null>(null)
  const [announce, setAnnounce] = useState('')
  const [unlockedRows, setUnlockedRows] = useState(() => rowsUnlocked(kana, 0))

  // One per kana shown, so each gets its own answer timer.
  const [shown, setShown] = useState(0)
  const timer = useAnswerTimer(`${runId}-${shown}`)
  const recent = useRef<string[]>([])
  const missedIds = useRef(new Set<string>())
  const wrongTimer = useRef<number | null>(null)
  const swallowNUntil = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreRef = useRef(0)

  const pool = useMemo(() => poolForScore(kana, score), [kana, score])

  const showNext = useCallback(
    (nextScore: number) => {
      const nextPool = poolForScore(kana, nextScore)
      if (nextPool.length === 0) return
      const k = pickNext(nextPool, recent.current, missedIds.current)
      recent.current = [k.id, ...recent.current].slice(0, 2)
      setCurrent(k)
      setShown((n) => n + 1)
      setOptions(makeOptions(k, nextPool, all))
      setTyped('')
      setFeedback(null)
    },
    [kana, all],
  )

  const start = useCallback(() => {
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current)
    recent.current = []
    missedIds.current = new Set()
    scoreRef.current = 0
    setScore(0)
    setAnswered(0)
    setStreak(0)
    setMissed([])
    setResult(null)
    setAnnounce('')
    setUnlockedRows(rowsUnlocked(kana, 0))
    setRunId((n) => n + 1)
    setPhase('playing')
    showNext(0)
  }, [kana, showNext])

  const finish = useCallback(() => {
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current)
    const final = scoreRef.current
    const previousBest = readBest(bestKey)
    const newBest = final > previousBest
    if (newBest) {
      saveBest(bestKey, final)
      setBest(final)
    }
    setResult({ score: final, previousBest, newBest })
    setFeedback(null)
    setPhase('done')
  }, [bestKey])

  const { remaining, paused } = useRoundTimer(phase === 'playing', ROUND_MS, runId, finish)
  useCompleteOnce(phase === 'done' && result !== null, onComplete)

  useEffect(
    () => () => {
      if (wrongTimer.current) window.clearTimeout(wrongTimer.current)
    },
    [],
  )

  // Keep the keyboard on the input while playing.
  useEffect(() => {
    if (phase === 'playing' && hasKeyboard) inputRef.current?.focus({ preventScroll: true })
  }, [phase, hasKeyboard, current])

  const answer = useCallback(
    (isCorrect: boolean, given: { typed?: string; chosen?: string }) => {
      if (!current || feedback?.kind === 'wrong' || phase !== 'playing') return
      setAnswered((n) => n + 1)
      timer.markInput()
      timer.attempt()
      onAnswer(current, 'kana_speed', given.typed !== undefined ? typedAnswer(given.typed) : choiceAnswer(given.chosen ?? '', options), timer)
      if (isCorrect) {
        const nextScore = scoreRef.current + 1
        scoreRef.current = nextScore
        setScore(nextScore)
        setStreak((s) => s + 1)
        const rows = rowsUnlocked(kana, nextScore)
        if (rows > unlockedRows) {
          setUnlockedRows(rows)
          setAnnounce(`Correct. New row unlocked. Score ${nextScore}.`)
        } else {
          setAnnounce(`Correct. Score ${nextScore}.`)
        }
        if (current.id === 'n') swallowNUntil.current = performance.now() + SWALLOW_N_MS
        showNext(nextScore)
        return
      }
      if (!missedIds.current.has(current.id)) {
        missedIds.current.add(current.id)
        setMissed((m) => [...m, current])
      }
      setStreak(0)
      setFeedback({ kind: 'wrong', answer: current.romaji, chosen: given.chosen })
      setAnnounce(`Not quite: ${current.character} is ${current.romaji}.`)
      wrongTimer.current = window.setTimeout(() => {
        wrongTimer.current = null
        showNext(scoreRef.current)
      }, WRONG_PAUSE_MS)
    },
    [current, feedback, phase, kana, unlockedRows, showNext, timer, onAnswer, options],
  )

  const onType = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!current || feedback) return
      timer.markInput()
      let value = e.target.value.toLowerCase().replace(/[^a-z]/g, '')
      if (value.startsWith('n') && performance.now() < swallowNUntil.current) {
        swallowNUntil.current = 0
        value = value.slice(1)
      }
      setTyped(value)
      const verdict = judgeTyped(current, value)
      if (verdict !== 'pending') answer(verdict === 'correct', { typed: value })
    },
    [current, feedback, answer, timer],
  )

  if (kana.length === 0 || pool.length === 0) {
    return (
      <PracticeShell title="Speed round" onExit={onExit}>
        <EmptyState
          icon="timer"
          title="No kana to practise"
          description={rawKana.length > 0 ? 'ー and small ッ have no romaji of their own, so there is nothing to type here. Try Word builder instead.' : undefined}
          actionLabel="Back"
          onAction={onExit}
        />
      </PracticeShell>
    )
  }

  if (phase === 'intro') {
    return (
      <PracticeShell title="Speed round" status={formatClock(ROUND_MS)} onExit={onExit}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
            <Icon name="timer" className="text-3xl text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">60 seconds. How many?</h1>
            <p className="mx-auto mt-2 max-w-sm text-on-surface-variant">
              {hasKeyboard ? 'Type the romaji for each kana. No need to press Enter.' : 'Tap the romaji for each kana.'}{' '}
              New rows join as your score climbs.
            </p>
          </div>
          {best > 0 && (
            <p className="font-label text-sm font-bold text-on-surface-variant">
              Your best: <span className="tabular-nums text-on-surface">{best}</span>
            </p>
          )}
        </div>
        <Button autoFocus onClick={start} className="mt-6 min-h-12 w-full sm:mx-auto sm:w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
          Start
        </Button>
      </PracticeShell>
    )
  }

  if (phase === 'done' && result) {
    const missedChars = missed.map((k) => k.character)
    return (
      <PracticeShell title="Speed round" progress={0} status={formatClock(0)} onExit={onExit}>
        <PracticeResults
          headline={result.newBest ? `New best! ${result.score}` : `${result.score} correct`}
          detail={
            result.newBest
              ? result.previousBest > 0
                ? `Previous best: ${result.previousBest}`
                : `${answered} answered in 60 seconds`
              : `Best: ${best} · ${answered} answered`
          }
          missed={missedChars}
          onAgain={start}
          onExit={onExit}
        />
      </PracticeShell>
    )
  }

  const wrong = feedback?.kind === 'wrong'

  return (
    <PracticeShell
      title="Speed round"
      progress={remaining / ROUND_MS}
      status={
        <span className="inline-flex items-center gap-1" aria-label={`Time left ${formatClock(remaining)}${paused ? ', paused' : ''}`}>
          <Icon name="timer" className="text-lg" />
          {formatClock(remaining)}
        </span>
      }
      onExit={onExit}
    >
      <p className="sr-only" aria-live="polite" role="status">
        {announce}
      </p>

      {/* Score + combo (fixed height so nothing jumps) */}
      <div className="flex h-10 items-center justify-between">
        <p className="font-label text-sm font-bold text-on-surface-variant">
          Score <span className="ml-1 font-headline text-xl tabular-nums text-on-surface">{score}</span>
        </p>
        <p
          aria-hidden={streak < 2}
          className={cn(
            'inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-label text-sm font-bold text-primary transition-opacity motion-reduce:transition-none',
            streak >= 2 ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Icon name="local_fire_department" filled className="text-lg" />
          <span className="tabular-nums">{streak}</span>
          <span className="sr-only">in a row</span>
        </p>
      </div>

      {/* The kana */}
      <motion.div
        key={reducedMotion ? 'card' : `${current?.id}-${answered}`}
        initial={reducedMotion || wrong ? false : { scale: 0.92, opacity: 0.4 }}
        animate={
          reducedMotion
            ? undefined
            : wrong
              ? { x: [0, -8, 8, -5, 5, 0], scale: 1, opacity: 1, transition: { duration: 0.35 } }
              : { scale: 1, opacity: 1, transition: { duration: 0.12 } }
        }
        className={cn(
          'mt-2 flex h-48 flex-col items-center justify-center rounded-2xl border-2 bg-surface-container-low sm:h-56',
          wrong ? 'border-warning' : 'border-transparent',
        )}
      >
        <span lang="ja" className="text-8xl font-bold leading-none text-on-surface sm:text-9xl">
          {current?.character}
        </span>
        <span
          className={cn('mt-3 h-7 font-headline text-xl font-bold text-warning', wrong ? 'visible' : 'invisible')}
          aria-hidden={!wrong}
        >
          = {feedback?.answer ?? '—'}
        </span>
      </motion.div>

      {/* Answer area: right under the kana when typing; low on the screen (thumb reach) on touch. */}
      <div className={hasKeyboard ? 'pt-6' : 'mt-auto pt-6'}>
        {hasKeyboard ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-on-surface-variant">Type the romaji</span>
            <input
              ref={inputRef}
              value={typed}
              onChange={onType}
              readOnly={wrong}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              aria-invalid={wrong}
              className={cn(
                'h-16 w-full rounded-2xl border-2 bg-surface-container-lowest px-4 text-center font-headline text-3xl font-bold lowercase text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                wrong ? 'border-warning' : 'border-outline-variant',
              )}
              placeholder="romaji"
            />
          </label>
        ) : (
          <div role="group" aria-label="Choose the romaji" className="grid grid-cols-2 gap-3">
            {options.map((option) => {
              const isAnswer = wrong && option === feedback?.answer
              const isChosenWrong = wrong && option === feedback?.chosen
              return (
                <button
                  key={`${current?.id}-${option}`}
                  type="button"
                  disabled={wrong}
                  onClick={() => answer(option === current?.romaji, { chosen: option })}
                  className={cn(
                    'h-20 rounded-2xl border-2 font-headline text-2xl font-bold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isAnswer
                      ? 'border-success bg-success/10 text-on-surface'
                      : isChosenWrong
                        ? 'border-warning bg-warning/10 text-on-surface'
                        : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface shadow-elevation-1 active:bg-surface-container',
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </PracticeShell>
  )
}

/** Needs the full chart to top up the four romaji options in small units. */
export const SpeedRound = withAllKana(SpeedRoundSession)
