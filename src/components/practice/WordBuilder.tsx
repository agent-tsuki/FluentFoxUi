import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { KanaChar } from '@/types'
import { useAnswerTimer, type AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { newClientEventId } from '@/lib/learn/answerTimer'
import { choiceAnswer } from '@/lib/learn/practiceSession'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { PracticeResults, PracticeShell } from './PracticeShell'
import { createRounds, maxBuildLevel, type BuildLevel, type BuildRound } from './build/buildRounds'
import { useTileDrag } from './build/useTileDrag'
import { useCompleteOnce } from './useCompleteOnce'
import type { PracticeAnswerFn } from './types'
import { withAllKana, type WithAllKanaProps } from './withAllKana'

/** How long wrong tiles stay in their slots before returning to the tray. */
const RETURN_WRONG_MS = 900

type Phase = 'building' | 'retry' | 'correct' | 'revealed'

/** The saved word level ('0' / '1' / '2'); without one, katakana starts on all loanwords. */
function readLevelPref(key: string, max: BuildLevel): BuildLevel {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(key)
  } catch {
    /* storage blocked: use the default */
  }
  const saved = raw === null ? (max === 2 ? 2 : 0) : Number(raw)
  return (saved >= 0 && saved <= max ? saved : 0) as BuildLevel
}

function saveLevelPref(key: string, value: BuildLevel) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

/** Word-level choices for scripts with loanwords (katakana). */
const LEVEL_LABELS: Record<BuildLevel, string> = { 0: 'Basic', 1: '+ Dakuten', 2: 'All loanwords' }

/** "Tip" line for words that use katakana's marks. */
function markTip(kana: string[]): string | null {
  const long = kana.includes('ー')
  const pause = kana.includes('ッ')
  if (long && pause) return 'ー stretches a vowel; small ッ doubles the next consonant.'
  if (long) return 'ー stretches the vowel before it (oo, ii, aa…).'
  if (pause) return 'Small ッ doubles the next consonant (kk, tt, dd…).'
  return null
}

/**
 * One answer per character of a finished word, each with its own event id.
 * A character placed wrong on the first try counts as a second attempt, and
 * its first placement is sent as the chosen tile.
 */
function saveWord(
  onAnswer: PracticeAnswerFn,
  timer: AnswerTimerControls,
  round: BuildRound,
  kanaById: ReadonlyMap<string, KanaChar>,
  firstFill: readonly string[],
  misplaced: ReadonlySet<string>,
) {
  const tiles = round.tiles.map((t) => t.char)
  round.ids.forEach((id, i) => {
    const target = kanaById.get(id)
    if (!target) return
    const attempts = misplaced.has(id) ? 2 : 1
    const builder = {
      buildAnswer: (details: Parameters<AnswerTimerControls['buildAnswer']>[0]) => ({
        ...timer.buildAnswer(details),
        client_event_id: newClientEventId(),
        attempts,
      }),
    }
    onAnswer(target, 'kana_build', choiceAnswer(firstFill[i] ?? target.character, tiles), builder)
  })
}

function WordBuilderSession({ kana, all, isSubset, script, onAnswer, onExit, onComplete }: WithAllKanaProps) {
  // Unit sessions build words from the whole chart but only words that use
  // at least one of the unit's kana (a 3-kana unit can't spell much alone).
  const focus = isSubset ? kana : undefined
  const unitHasDakuten = isSubset && kana.some((k) => k.type === 'dakuten')
  // A compound / foreign / marks unit plays loanwords whatever the level, so no level choice there.
  const unitFixesLevel = isSubset && kana.some((k) => k.type !== 'basic')
  const maxLevel = maxBuildLevel(script)
  const reducedMotion = useReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const { supported: canSpeak, speak } = useJapaneseSpeech()

  const tierKey = script.storageKeys.buildDakuten
  const [level, setLevel] = useState<BuildLevel>(() => readLevelPref(tierKey, maxLevel))
  const [rounds, setRounds] = useState<BuildRound[]>(() => createRounds(script, all, level, focus))
  const [roundIndex, setRoundIndex] = useState(0)
  /** Tile key placed in each slot, or null when empty. */
  const [slots, setSlots] = useState<(string | null)[]>(() => rounds[0]?.word.kana.map(() => null) ?? [])
  const [phase, setPhase] = useState<Phase>('building')
  const [wrongSlots, setWrongSlots] = useState<Set<number>>(new Set())
  const [feedback, setFeedback] = useState('')
  const [pulse, setPulse] = useState(0)
  const [shake, setShake] = useState(0)
  const [score, setScore] = useState({ correct: 0, firstTry: 0 })
  const [missed, setMissed] = useState<string[]>([])
  const [finished, setFinished] = useState(false)

  const kanaById = useMemo(() => new Map(all.map((k) => [k.id, k])), [all])
  // Bumped by a new game so its first word gets a fresh answer timer.
  const [run, setRun] = useState(0)
  const timer = useAnswerTimer(`${run}-${roundIndex}`)
  /** The characters placed on the first check of the current word. */
  const firstFillRef = useRef<string[]>([])
  const misplacedRef = useRef<Set<string>>(new Set())
  const returnTimer = useRef<number | null>(null)
  /** Wrong tiles waiting to go back to the tray (see RETURN_WRONG_MS). */
  const pendingReturn = useRef<Set<number> | null>(null)

  const round = rounds[roundIndex]
  const tileByKey = useMemo(() => new Map(round?.tiles.map((t) => [t.key, t]) ?? []), [round])
  const placedKeys = useMemo(() => new Set(slots.filter((s): s is string => s !== null)), [slots])
  const done = phase === 'correct' || phase === 'revealed'

  useEffect(() => () => {
    if (returnTimer.current) window.clearTimeout(returnTimer.current)
  }, [])

  const resetRound = useCallback((next: BuildRound | undefined) => {
    if (returnTimer.current) window.clearTimeout(returnTimer.current)
    returnTimer.current = null
    pendingReturn.current = null
    misplacedRef.current = new Set()
    firstFillRef.current = []
    setSlots(next?.word.kana.map(() => null) ?? [])
    setPhase('building')
    setWrongSlots(new Set())
    setFeedback('')
  }, [])

  const startGame = useCallback(
    (nextLevel: BuildLevel) => {
      const next = createRounds(script, all, nextLevel, focus)
      setRounds(next)
      setRun((r) => r + 1)
      setRoundIndex(0)
      setScore({ correct: 0, firstTry: 0 })
      setMissed([])
      setFinished(false)
      resetRound(next[0])
    },
    [script, all, focus, resetRound],
  )

  const evaluate = useCallback(
    (filled: string[]) => {
      if (!round) return
      timer.attempt()
      if (phase === 'building') firstFillRef.current = filled.map((key) => tileByKey.get(key)?.char ?? '')
      const wrong = new Set<number>()
      filled.forEach((key, i) => {
        if (tileByKey.get(key)?.char !== round.word.kana[i]) wrong.add(i)
      })
      wrong.forEach((i) => misplacedRef.current.add(round.ids[i]!))

      if (wrong.size === 0) {
        setPhase('correct')
        setWrongSlots(new Set())
        setPulse((n) => n + 1)
        setScore((s) => ({ correct: s.correct + 1, firstTry: s.firstTry + (phase === 'building' ? 1 : 0) }))
        setFeedback(`Correct! ${round.word.word} (${round.word.romaji}): ${round.word.meaning}.`)
        speak(round.word.word)
        saveWord(onAnswer, timer, round, kanaById, firstFillRef.current, misplacedRef.current)
        return
      }

      setWrongSlots(wrong)
      setShake((n) => n + 1)
      const missedChars = round.word.kana.filter((_, i) => wrong.has(i))
      if (phase === 'building') {
        setPhase('retry')
        setFeedback(
          wrong.size === 1 ? 'Not quite. One letter is in the wrong place. Try again.' : `Not quite. ${wrong.size} letters are in the wrong place. Try again.`,
        )
        // Give the learner a moment to see which ones, then send them back.
        pendingReturn.current = wrong
        returnTimer.current = window.setTimeout(() => {
          returnTimer.current = null
          pendingReturn.current = null
          setSlots((current) => current.map((key, i) => (wrong.has(i) ? null : key)))
        }, RETURN_WRONG_MS)
      } else {
        setPhase('revealed')
        setFeedback(`The word is ${round.word.word}, ${round.word.romaji}.`)
        speak(round.word.word)
        saveWord(onAnswer, timer, round, kanaById, firstFillRef.current, misplacedRef.current)
      }
      setMissed((m) => [...new Set([...m, ...missedChars])])
    },
    [phase, round, tileByKey, speak, timer, onAnswer, kanaById],
  )

  /** Applies any pending "send wrong tiles back" right away. */
  const flushReturn = useCallback((current: (string | null)[]) => {
    const pending = pendingReturn.current
    if (!pending) return current
    if (returnTimer.current) window.clearTimeout(returnTimer.current)
    returnTimer.current = null
    pendingReturn.current = null
    return current.map((key, i) => (pending.has(i) ? null : key))
  }, [])

  const placeTile = useCallback(
    (tileKey: string, slotIndex?: number) => {
      if (done || placedKeys.has(tileKey)) return
      timer.markInput()
      const base = flushReturn(slots)
      const target = slotIndex ?? base.findIndex((s) => s === null)
      if (target < 0 || target >= base.length) return
      const next = [...base]
      next[target] = tileKey
      setSlots(next)
      if (wrongSlots.has(target)) {
        setWrongSlots((w) => {
          const copy = new Set(w)
          copy.delete(target)
          return copy
        })
      }
      if (next.every((s) => s !== null)) evaluate(next as string[])
    },
    [done, placedKeys, slots, wrongSlots, evaluate, flushReturn, timer],
  )

  const removeFromSlot = useCallback(
    (slotIndex: number) => {
      if (done) return
      setSlots(flushReturn(slots).map((key, i) => (i === slotIndex ? null : key)))
    },
    [done, slots, flushReturn],
  )

  const clearAll = useCallback(() => {
    if (done) return
    flushReturn(slots)
    setSlots(slots.map(() => null))
  }, [done, slots, flushReturn])

  const next = useCallback(() => {
    if (roundIndex + 1 >= rounds.length) {
      setFinished(true)
      return
    }
    setRoundIndex(roundIndex + 1)
    resetRound(rounds[roundIndex + 1])
  }, [roundIndex, rounds, resetRound])

  const drag = useTileDrag(finePointer && !done, (key, slot) => placeTile(key, slot))
  const chooseLevel = useCallback(
    (value: BuildLevel) => {
      setLevel(value)
      saveLevelPref(tierKey, value)
      startGame(value)
    },
    [tierKey, startGame],
  )
  useCompleteOnce(finished && rounds.length > 0, onComplete)

  if (rounds.length === 0) {
    return (
      <PracticeShell title="Word builder" onExit={onExit}>
        {isSubset ? (
          <EmptyState icon="menu_book" title="No words for this unit yet" description="Our practice words don't use these kana yet. Try Listen & tap or Swipe review instead." actionLabel="Back to unit" onAction={onExit} />
        ) : (
          <EmptyState icon="menu_book" title="No words to build yet" description="The kana list didn't include the characters these words need." actionLabel="Back to chart" onAction={onExit} />
        )}
      </PracticeShell>
    )
  }

  if (finished || !round) {
    return (
      <PracticeShell title="Word builder" progress={1} status={`${rounds.length} / ${rounds.length}`} onExit={onExit}>
        <PracticeResults
          headline={`${score.correct} of ${rounds.length} words built`}
          detail={`${score.firstTry} on the first try${
            maxLevel === 2 ? (unitFixesLevel ? '' : ` · ${LEVEL_LABELS[level].toLowerCase()}`) : level > 0 || unitHasDakuten ? ' · with dakuten words' : ''
          }`}
          missed={missed}
          onAgain={() => startGame(level)}
          onExit={onExit}
        />
        {maxLevel === 2 && !unitFixesLevel && (
          <div role="group" aria-label="Words to play" className="mt-3 flex flex-wrap justify-center gap-2">
            {([0, 1, 2] as const).map((value) => (
              <Button
                key={value}
                variant={value === level ? 'primary' : 'outline'}
                aria-pressed={value === level}
                onClick={() => chooseLevel(value)}
                className="min-h-11 px-4 py-2 text-sm"
              >
                {LEVEL_LABELS[value]}
              </Button>
            ))}
          </div>
        )}
        {/* A dakuten unit always plays dakuten words, so the toggle would do nothing. */}
        {maxLevel < 2 && !unitHasDakuten && (
        <Button
          variant="ghost"
          className="mt-2 min-h-12 w-full sm:mx-auto sm:w-auto"
          onClick={() => chooseLevel(level > 0 ? 0 : 1)}
        >
          {level > 0 ? 'Play basic words only' : 'Try words with dakuten'}
        </Button>
        )}
      </PracticeShell>
    )
  }

  const { word } = round
  const nextEmpty = slots.findIndex((s) => s === null)
  const tip = markTip(word.kana)
  // Long loanwords (ハンバーガー: 6 slots, up to 8) shrink their slots to fit one line on a phone.
  const compact = word.kana.length > 5

  return (
    <PracticeShell
      title="Word builder"
      progress={(roundIndex + (done ? 1 : 0)) / rounds.length}
      status={`${roundIndex + 1} / ${rounds.length}`}
      onExit={onExit}
    >
      <div className="flex flex-1 flex-col justify-center">
      {/* Prompt */}
      <section aria-label="Word to build" className="relative flex flex-col items-center rounded-2xl bg-surface-container-low px-4 pb-4 pt-5 text-center">
        <span role="img" aria-label={word.meaning} className="select-none text-6xl leading-none sm:text-7xl">
          {word.picture}
        </span>
        <p className="mt-3 font-headline text-xl font-bold text-on-surface">{word.meaning}</p>
        <p className="text-on-surface-variant">
          Build <span className="font-bold text-on-surface">“{word.romaji}”</span>
        </p>
        {tip && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
            <Icon name="lightbulb" className="text-base text-primary" />
            {tip}
          </p>
        )}
        {canSpeak && (
          <button
            type="button"
            onClick={() => speak(word.word)}
            aria-label={`Hear ${word.romaji}`}
            className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-primary transition-colors hover:bg-surface-container-highest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name="volume_up" className="text-2xl" />
          </button>
        )}
      </section>

      {/* Slots */}
      <motion.div
        key={`slots-${roundIndex}-${pulse}-${shake}`}
        className={cn('mt-6', compact ? 'grid justify-center gap-1.5 sm:gap-2' : 'flex justify-center gap-2')}
        style={compact ? { gridTemplateColumns: `repeat(${word.kana.length}, minmax(0, 4.5rem))` } : undefined}
        role="group"
        aria-label={`Word slots, ${slots.length} letters`}
        animate={
          reducedMotion
            ? undefined
            : phase === 'correct'
              ? { scale: [1, 1.06, 1], transition: { duration: 0.4 } }
              : shake > 0 && wrongSlots.size > 0
                ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } }
                : undefined
        }
      >
        {word.kana.map((expected, i) => {
          const tile = slots[i] ? tileByKey.get(slots[i]!) : undefined
          const shown = phase === 'revealed' ? expected : tile?.char
          const isWrong = wrongSlots.has(i)
          const isNext = !done && i === nextEmpty
          return (
            <button
              key={i}
              type="button"
              data-slot={i}
              lang="ja"
              disabled={done || !tile}
              onClick={() => removeFromSlot(i)}
              aria-label={
                shown
                  ? `Letter ${i + 1}: ${shown}${done ? '' : ', tap to remove'}`
                  : `Letter ${i + 1}, empty${isWrong ? ', was wrong' : ''}`
              }
              className={cn(
                'flex items-center justify-center whitespace-nowrap rounded-2xl border-2 font-bold text-on-surface transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                compact ? 'aspect-square w-full' : 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]',
                // Two-character slots (シャ, フォ) and compact slots get smaller type.
                Array.from(expected).length > 1
                  ? compact ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-3xl'
                  : compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl',
                phase === 'correct'
                  ? 'border-success bg-success/10'
                  : isWrong
                    ? 'border-warning bg-warning/10'
                    : shown
                      ? 'border-outline-variant bg-surface-container-lowest shadow-elevation-1'
                      : 'border-dashed bg-surface-container-low',
                !shown && !isWrong && (isNext ? 'border-primary' : 'border-outline-variant'),
                drag.ghost?.overSlot === i && 'ring-2 ring-primary',
              )}
            >
              {shown ?? ''}
            </button>
          )
        })}
      </motion.div>

      {/* Feedback (fixed height: no layout shift) */}
      <div className="mt-4 flex min-h-12 items-center justify-center gap-2 text-center" aria-live="polite" role="status">
        {phase === 'correct' && <Icon name="check_circle" filled className="text-2xl text-success" />}
        <p
          className={cn(
            'text-sm font-semibold',
            phase === 'correct' ? 'text-success' : phase === 'building' ? 'text-on-surface-variant' : 'text-on-surface',
          )}
        >
          {feedback || (finePointer ? 'Click the kana in order, or drag them into place.' : 'Tap the kana in order.')}
        </p>
      </div>

      </div>

      {/* Tray + actions sit low on the screen for thumb reach. */}
      <div className="pt-4">
        <div role="group" aria-label="Kana tiles" className="flex min-h-32 flex-wrap content-start justify-center gap-2">
          {round.tiles.map((tile) => {
            const used = placedKeys.has(tile.key)
            return (
              <button
                key={tile.key}
                type="button"
                lang="ja"
                disabled={used || done}
                aria-label={used ? `${tile.char}, placed` : `Place ${tile.char}`}
                onPointerDown={(e) => drag.onPointerDown(e, tile.key, tile.char)}
                onClick={() => {
                  if (!drag.consumeClick()) placeTile(tile.key)
                }}
                className={cn(
                  'flex h-14 select-none items-center justify-center whitespace-nowrap rounded-2xl font-bold transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  Array.from(tile.char).length > 1 ? 'min-w-14 px-1.5 text-2xl' : 'w-14 text-3xl',
                  used
                    ? 'border-2 border-dashed border-outline-variant/60 text-transparent'
                    : 'border border-outline-variant/60 bg-surface-container-lowest text-on-surface shadow-elevation-1 hover:bg-surface-container-low active:bg-surface-container disabled:opacity-60',
                  finePointer && !used && !done && 'cursor-grab',
                )}
              >
                {tile.char}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex h-12 gap-2">
          {done ? (
            <Button autoFocus onClick={next} className="min-h-12 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
              {roundIndex + 1 >= rounds.length ? 'See results' : 'Next word'}
            </Button>
          ) : (
            <Button variant="outline" onClick={clearAll} disabled={placedKeys.size === 0} className="min-h-12 flex-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
              <span className="inline-flex items-center justify-center gap-2">
                <Icon name="refresh" className="text-xl" />
                Clear
              </span>
            </Button>
          )}
        </div>
      </div>

      {drag.ghost && (
        <div
          aria-hidden="true"
          lang="ja"
          className={cn(
            'pointer-events-none fixed z-50 flex h-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap rounded-2xl border border-primary bg-surface-container-lowest font-bold text-on-surface shadow-elevation-3',
            Array.from(drag.ghost.char).length > 1 ? 'min-w-14 px-1.5 text-2xl' : 'w-14 text-3xl',
          )}
          style={{ left: drag.ghost.x, top: drag.ghost.y }}
        >
          {drag.ghost.char}
        </div>
      )}
    </PracticeShell>
  )
}

/** Needs the full chart: unit sessions spell words that also use kana outside the unit. */
export const WordBuilder = withAllKana(WordBuilderSession)
