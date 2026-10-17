import { useCallback, useEffect, useRef, useState } from 'react'
import type { KanaChar } from '@/types'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { PracticeResults, PracticeShell } from './PracticeShell'
import { AnswerTile, type TileState } from './listen/AnswerTile'
import { ListenPrompt } from './listen/ListenPrompt'
import { buildListenRounds, type ListenRound } from './listen/buildRounds'
import { useCompleteOnce } from './useCompleteOnce'
import { withAllKana, type WithAllKanaProps } from './withAllKana'

const TITLE = 'Listen & tap'
/** Pause before the next round: short when right, longer to study the answer when wrong. */
const NEXT_DELAY_MS = { correct: 900, wrong: 1800 } as const

type Phase = 'intro' | 'playing' | 'done'

/** Browsers block speech until the page has had a user gesture (e.g. on a direct page load). */
function needsGesture(): boolean {
  return typeof navigator !== 'undefined' && navigator.userActivation?.hasBeenActive === false
}

/** Hear a kana, tap the matching one of four look-alike tiles. */
function ListenTapSession({ kana, all, script, progress, onExit, onComplete }: WithAllKanaProps) {
  const { speak, supported } = useJapaneseSpeech()
  const [rounds, setRounds] = useState<ListenRound[]>(() => buildListenRounds(progress, kana, all, script.lookAlikes))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<KanaChar | null>(null)
  const [missed, setMissed] = useState<KanaChar[]>([])
  const [phase, setPhase] = useState<Phase>(() => (supported && needsGesture() ? 'intro' : 'playing'))
  const [announcement, setAnnouncement] = useState('')
  const roundRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number>()

  const round = rounds[index]
  const result = picked && round ? (picked.id === round.target.id ? 'correct' : 'wrong') : null

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  // Each new round: move focus to the prompt and play the sound.
  useEffect(() => {
    if (phase !== 'playing' || !round) return
    roundRef.current?.querySelector<HTMLElement>('[data-round-focus]')?.focus({ preventScroll: true })
    if (!supported) return
    const t = window.setTimeout(() => speak(round.target.character), 250)
    return () => window.clearTimeout(t)
  }, [phase, round, supported, speak])

  const pick = useCallback(
    (choice: KanaChar) => {
      if (!round || picked) return
      const target = round.target
      const correct = choice.id === target.id
      setPicked(choice)
      void progress.recordReview(target.id, correct ? 'good' : 'again').catch(() => {})
      if (correct) {
        setAnnouncement(`Correct. ${target.character}, ${target.romaji}.`)
      } else {
        setMissed((m) => [...m, target])
        setAnnouncement(`Not quite. It was ${target.character}, ${target.romaji}.`)
        speak(target.character)
      }
      timerRef.current = window.setTimeout(
        () => {
          setPicked(null)
          if (index + 1 >= rounds.length) setPhase('done')
          else setIndex(index + 1)
        },
        correct ? NEXT_DELAY_MS.correct : NEXT_DELAY_MS.wrong,
      )
    },
    [round, picked, index, rounds.length, speak, progress],
  )

  const replay = useCallback(() => round && speak(round.target.character), [round, speak])

  useEffect(() => {
    if (phase !== 'playing') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      const option = round?.options[Number(e.key) - 1]
      if (option) pick(option)
      else if (e.key.toLowerCase() === 'r' && supported) replay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, round, pick, replay, supported])

  const restart = useCallback(() => {
    window.clearTimeout(timerRef.current)
    setRounds(buildListenRounds(progress, kana, all, script.lookAlikes))
    setIndex(0)
    setPicked(null)
    setMissed([])
    setAnnouncement('')
    setPhase('playing')
  }, [progress, kana, all, script.lookAlikes])

  useCompleteOnce(phase === 'done' && rounds.length > 0, onComplete)

  if (rounds.length === 0) {
    return (
      <PracticeShell title={TITLE} onExit={onExit}>
        <EmptyState
          icon="headset"
          title="Nothing to listen to here"
          description="ー and small ッ have no sound of their own: they change the kana around them. Try Word builder to read them in real words."
          actionLabel="Back to unit"
          onAction={onExit}
        />
      </PracticeShell>
    )
  }

  if (phase === 'done' || !round) {
    return (
      <PracticeShell title={TITLE} progress={1} onExit={onExit}>
        <PracticeResults
          headline={`${rounds.length - missed.length} of ${rounds.length} correct`}
          detail={missed.length === 0 ? 'Perfect ears!' : 'Listen to these again on the chart.'}
          missed={missed.map((k) => k.character)}
          onAgain={restart}
          onExit={onExit}
        />
      </PracticeShell>
    )
  }

  if (phase === 'intro') {
    return (
      <PracticeShell title={TITLE} onExit={onExit}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Icon name="volume_up" className="text-5xl text-primary" />
          <p className="font-headline text-xl font-bold text-on-surface">Turn your sound on</p>
          <p className="max-w-xs text-on-surface-variant">You’ll hear {rounds.length} kana. Tap the one you heard.</p>
        </div>
        <Button onClick={() => setPhase('playing')} className="min-h-14 w-full">Start listening</Button>
      </PracticeShell>
    )
  }

  const tileState = (option: KanaChar): TileState => {
    if (!picked) return 'idle'
    if (option.id === round.target.id) return 'correct'
    return option.id === picked.id ? 'wrong' : 'muted'
  }

  return (
    <PracticeShell title={TITLE} progress={index / rounds.length} status={`${index + 1} / ${rounds.length}`} onExit={onExit}>
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div ref={roundRef} className="flex flex-1 flex-col">
        <ListenPrompt target={round.target} speechSupported={supported} result={result} onReplay={replay} />
        <div role="group" aria-label="Answers" className="grid grid-cols-2 gap-3">
          {round.options.map((option, i) => (
            <AnswerTile key={option.id} kana={option} index={i + 1} state={tileState(option)} locked={picked !== null} onPick={pick} />
          ))}
        </div>
      </div>
    </PracticeShell>
  )
}

/** Needs the full chart to top up answer tiles when a unit has fewer than four kana. */
export const ListenTap = withAllKana(ListenTapSession)
