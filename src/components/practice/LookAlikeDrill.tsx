import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { KanaChar } from '@/types'
import { useAnswerTimer } from '@/hooks/useAnswerTimer'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { choiceAnswer } from '@/lib/learn/practiceSession'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { lookAlikeSetsFor } from '@/lib/content/kana/lookAlikeSets'
import { durations, easings } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { PracticeResults, PracticeShell } from './PracticeShell'
import { ChoiceTile, type ChoiceState } from './lookalike/ChoiceTile'
import { buildLookAlikeRounds, type LookAlikeRound } from './lookalike/buildLookAlikeRounds'
import { useCompleteOnce } from './useCompleteOnce'
import { withAllKana, type WithAllKanaProps } from './withAllKana'

const TITLE = 'Look-alikes'

/**
 * Look-alike drill: one kana from a confusable set (シ ツ ソ ン), answered among
 * only its siblings — read it (pick the romaji) or find it (pick the kana).
 * After every answer the set's distinguishing tip is shown before moving on.
 */
function LookAlikeSession({ kana, all, isSubset, script, focusIds: priorityIds, onAnswer, onExit, onComplete }: WithAllKanaProps) {
  const sets = lookAlikeSetsFor(script.id)
  const { speak, supported } = useJapaneseSpeech()
  const reducedMotion = useReducedMotion()

  // A unit session asks about the unit's kana; if none of them has a look-alike, drill every set.
  const focusIds = useMemo(() => {
    if (!isSubset) return undefined
    const ids = kana.map((k) => k.id)
    const members = new Set(sets.flatMap((s) => s.ids))
    return ids.some((id) => members.has(id)) ? ids : undefined
  }, [isSubset, kana, sets])
  const unitFallback = isSubset && !focusIds

  const build = useCallback(() => buildLookAlikeRounds(priorityIds, sets, all, focusIds), [priorityIds, sets, all, focusIds])
  const [rounds, setRounds] = useState<LookAlikeRound[]>(build)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<KanaChar | null>(null)
  const [missed, setMissed] = useState<KanaChar[]>([])
  const [done, setDone] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  // Bumped by "Play again" so the first round of a new run gets a fresh answer timer.
  const [run, setRun] = useState(0)
  const timer = useAnswerTimer(`${run}-${index}`)
  const promptRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)

  const round = rounds[index]
  const correct = picked && round ? picked.id === round.target.id : null

  // New round: focus the prompt so screen readers hear the question.
  useEffect(() => {
    if (!done && round && !picked) promptRef.current?.focus({ preventScroll: true })
  }, [done, round, picked])

  // Answered: move focus to Next so Enter / Space continues.
  useEffect(() => {
    if (picked) nextRef.current?.querySelector('button')?.focus()
  }, [picked])

  const pick = useCallback(
    (choice: KanaChar) => {
      if (!round || picked) return
      const { target, tip } = round
      const right = choice.id === target.id
      setPicked(choice)
      timer.markInput()
      timer.attempt()
      onAnswer(target, 'kana_lookalike', choiceAnswer(choice.character, round.options.map((o) => o.character)), timer)
      if (!right) setMissed((m) => (m.some((k) => k.id === target.id) ? m : [...m, target]))
      setAnnouncement(
        right
          ? `Correct. ${target.character} is ${target.romaji}. ${tip}`
          : `Not quite. ${target.character} is ${target.romaji}; you chose ${choice.character}, ${choice.romaji}. ${tip}`,
      )
    },
    [round, picked, timer, onAnswer],
  )

  const next = useCallback(() => {
    setPicked(null)
    setAnnouncement('')
    if (index + 1 >= rounds.length) setDone(true)
    else setIndex(index + 1)
  }, [index, rounds.length])

  const restart = useCallback(() => {
    setRounds(build())
    setRun((r) => r + 1)
    setIndex(0)
    setPicked(null)
    setMissed([])
    setAnnouncement('')
    setDone(false)
  }, [build])

  // 1–4 picks an option (Enter / Space on the focused Next button continues).
  useEffect(() => {
    if (done || !round || picked) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      const option = round.options[Number(e.key) - 1]
      if (option) pick(option)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [done, round, picked, pick])

  useCompleteOnce(done && rounds.length > 0, onComplete)

  if (rounds.length === 0) {
    return (
      <PracticeShell title={TITLE} onExit={onExit}>
        <EmptyState
          icon="difference"
          title="No look-alikes here"
          description={`There are no look-alike sets for ${script.label.toLowerCase()} yet.`}
          actionLabel="Back"
          onAction={onExit}
        />
      </PracticeShell>
    )
  }

  if (done || !round) {
    return (
      <PracticeShell title={TITLE} progress={1} onExit={onExit}>
        <PracticeResults
          headline={`${rounds.length - missed.length} of ${rounds.length} told apart`}
          detail={missed.length === 0 ? 'Sharp eyes — not fooled once.' : 'These still trip you up. Compare them on the chart.'}
          missed={missed.map((k) => k.character)}
          onAgain={restart}
          onExit={onExit}
        />
      </PracticeShell>
    )
  }

  const { target, direction } = round
  const optionState = (option: KanaChar): ChoiceState => {
    if (!picked) return 'idle'
    if (option.id === target.id) return 'correct'
    return option.id === picked.id ? 'wrong' : 'muted'
  }
  const cols = round.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <PracticeShell title={TITLE} progress={index / rounds.length} status={`${index + 1} / ${rounds.length}`} onExit={onExit}>
      <p className="sr-only" aria-live="polite">{announcement}</p>

      {unitFallback && index === 0 && !picked && (
        <p className="mb-2 rounded-xl bg-surface-container-low px-3 py-2 text-center text-sm text-on-surface-variant">
          This unit has no look-alikes, so you’re drilling every set.
        </p>
      )}

      {/* Prompt */}
      <div
        ref={promptRef}
        tabIndex={-1}
        className="flex flex-1 flex-col items-center justify-center gap-2 py-3 text-center focus:outline-none"
      >
        <p className="text-sm font-semibold text-on-surface-variant">
          {direction === 'read' ? 'Which reading is this?' : 'Which kana is this?'}
        </p>
        {direction === 'read' ? (
          <p lang="ja" className="font-jp text-8xl font-bold leading-none text-on-surface sm:text-9xl">
            <span className="sr-only">Kana: </span>
            {target.character}
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="font-headline text-6xl font-extrabold text-primary sm:text-7xl">
              <span className="sr-only">Reading: </span>
              {target.romaji}
            </p>
            {supported && (
              <button
                type="button"
                onClick={() => speak(target.character, { onStart: timer.audioStart, onEnd: timer.audioStop })}
                aria-label={`Hear ${target.romaji}`}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Icon name="volume_up" className="text-2xl" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Options: only the set's siblings */}
      <div role="group" aria-label="Answers" className={cn('grid gap-3', cols)}>
        {round.options.map((option, i) => (
          <ChoiceTile
            key={option.id}
            label={direction === 'read' ? option.romaji : option.character}
            lang={direction === 'find' ? 'ja' : undefined}
            index={i + 1}
            state={optionState(option)}
            locked={picked !== null}
            onPick={() => pick(option)}
          />
        ))}
      </div>

      {/* Tip + next; reserved space keeps the options from jumping */}
      <div className="mt-4 min-h-72">
        {picked && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.enter, ease: easings.out }}
            className="flex flex-col gap-3"
          >
            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-4 dark:border-outline/40">
              <p className={cn('flex items-center gap-1.5 text-sm font-bold', correct ? 'text-success' : 'text-on-surface')}>
                <Icon name={correct ? 'check_circle' : 'lightbulb'} filled={Boolean(correct)} className={cn('text-lg', !correct && 'text-primary')} />
                {correct ? 'Correct!' : (
                  <span>
                    It was <span lang="ja" className="font-jp">{target.character}</span> ({target.romaji})
                  </span>
                )}
              </p>
              <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="The set">
                {round.members.map((k) => (
                  <li
                    key={k.id}
                    className={cn(
                      'flex min-w-14 flex-col items-center rounded-xl px-2 py-1.5',
                      k.id === target.id ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-surface-container',
                    )}
                  >
                    <span lang="ja" className="font-jp text-3xl font-bold leading-tight text-on-surface">{k.character}</span>
                    <span className="text-xs font-semibold text-on-surface-variant">{k.romaji}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-on-surface">
                <span className="sr-only">Tip: </span>
                {round.tip}
              </p>
            </div>
            <div ref={nextRef}>
              <Button onClick={next} className="min-h-12 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
                {index + 1 >= rounds.length ? 'See results' : 'Next'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </PracticeShell>
  )
}

/** Needs the full chart so a unit's kana can be shown beside siblings from other rows. */
export const LookAlikeDrill = withAllKana(LookAlikeSession)
