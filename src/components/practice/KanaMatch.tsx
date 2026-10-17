import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PracticeAnswerFn, PracticeModeProps } from '@/components/practice/types'
import type { KanaScriptConfig } from '@/lib/content/kana/scripts'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useAnswerTimer } from '@/hooks/useAnswerTimer'
import { useKanaPairs, type KanaPair } from '@/hooks/useKanaPairs'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { choiceAnswer } from '@/lib/learn/practiceSession'
import { KATAKANA_HIRAGANA_TWINS, type KanaTwin } from '@/lib/content/kana/katakanaLookAlikes'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { PracticeResults, PracticeShell } from './PracticeShell'
import { MatchTile, type MatchTileState } from './match/MatchTile'
import { buildMatchRounds, type MatchRound } from './match/buildMatchRounds'
import { useCompleteOnce } from './useCompleteOnce'

const TITLE = 'Hiragana ↔ katakana'
/** How long a wrong pair stays red before the tiles reset. */
const WRONG_MS = 650

type Side = 'hiragana' | 'katakana'
const SIDES: readonly Side[] = ['hiragana', 'katakana']
const SIDE_LABEL: Record<Side, { label: string; native: string }> = {
  hiragana: { label: 'Hiragana', native: 'ひらがな' },
  katakana: { label: 'Katakana', native: 'カタカナ' },
}

const TWINS = new Map<string, KanaTwin>(KATAKANA_HIRAGANA_TWINS.map((t) => [t.id, t]))

interface Selection {
  side: Side
  id: string
}

interface SessionProps {
  pairs: KanaPair[]
  focusIds: string[]
  script: KanaScriptConfig
  /** Kana ids the learn API picked, asked first. */
  priorityIds: readonly string[]
  onAnswer: PracticeAnswerFn
  onExit: () => void
  onComplete?: () => void
}

/**
 * Tap a hiragana, then its katakana twin (or the other way round). Six pairs
 * per round, three rounds. Look-alike twins (か/カ, り/リ) show a tip when
 * matched. Reviews go to the current course's store only.
 */
function MatchSession({ pairs, focusIds, script, priorityIds, onAnswer, onExit, onComplete }: SessionProps) {
  const reducedMotion = useReducedMotion()
  const build = useCallback(() => buildMatchRounds(priorityIds, pairs, focusIds), [priorityIds, pairs, focusIds])
  const [rounds, setRounds] = useState<MatchRound[]>(build)
  const [roundIndex, setRoundIndex] = useState(0)
  const [matched, setMatched] = useState<ReadonlySet<string>>(() => new Set())
  const [selected, setSelected] = useState<Selection | null>(null)
  const [wrong, setWrong] = useState<{ hiragana: string; katakana: string } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [missed, setMissed] = useState<KanaPair[]>([])
  const [twin, setTwin] = useState<KanaTwin | null>(null)
  const [done, setDone] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const missedInRound = useRef(new Set<string>())
  // Bumped by "Play again"; with the round and the pairs matched so far it times each pair from the previous match.
  const [run, setRun] = useState(0)
  const timer = useAnswerTimer(`${run}-${roundIndex}-${matched.size}`)
  const wrongTimer = useRef<number>()
  const nextRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => window.clearTimeout(wrongTimer.current), [])

  const round = rounds[roundIndex]
  const byId = useMemo(() => new Map(round?.pairs.map((p) => [p.id, p])), [round])
  const roundDone = round !== undefined && matched.size === round.pairs.length
  const totalPairs = rounds.reduce((n, r) => n + r.pairs.length, 0)

  useEffect(() => {
    if (roundDone) nextRef.current?.querySelector('button')?.focus()
  }, [roundDone])

  const press = useCallback(
    (side: Side, id: string) => {
      if (!round || matched.has(id) || roundDone) return
      timer.markInput()
      if (!selected || selected.side === side) {
        // First pick, or changing the pick within a column (tap again to clear).
        setSelected(selected?.side === side && selected.id === id ? null : { side, id })
        setWrong(null)
        return
      }
      const hiraId = side === 'hiragana' ? id : selected.id
      const kataId = side === 'katakana' ? id : selected.id
      setSelected(null)
      const hira = byId.get(hiraId)
      const kata = byId.get(kataId)
      if (!hira || !kata) return

      if (hiraId === kataId) {
        // A pair tapped wrong earlier in the round counts as a second attempt.
        const attempts = missedInRound.current.has(hiraId) ? 2 : 1
        const target = script.id === 'hiragana' ? hira.hiragana : hira.katakana
        const builder = { buildAnswer: (d: Parameters<typeof timer.buildAnswer>[0]) => ({ ...timer.buildAnswer(d), attempts }) }
        onAnswer(target, 'kana_match', choiceAnswer(target.character, []), builder)
        const next = new Set(matched).add(hiraId)
        setMatched(next)
        setWrong(null)
        const tip = TWINS.get(hiraId) ?? null
        // The latest twin's tip stays up for the rest of the round.
        if (tip) setTwin(tip)
        const last = next.size === round.pairs.length
        setAnnouncement(
          `Matched ${hira.hiragana.character} and ${hira.katakana.character}, ${hira.hiragana.romaji}.` +
            (tip ? ` Look-alike: ${tip.tip}` : '') +
            (last ? ' Round complete.' : ''),
        )
        return
      }

      setMistakes((m) => m + 1)
      for (const pair of [hira, kata]) {
        missedInRound.current.add(pair.id)
        setMissed((list) => (list.some((p) => p.id === pair.id) ? list : [...list, pair]))
      }
      setWrong({ hiragana: hiraId, katakana: kataId })
      setAnnouncement(
        `Not a pair: ${hira.hiragana.character} is ${hira.hiragana.romaji}, ${kata.katakana.character} is ${kata.katakana.romaji}.`,
      )
      window.clearTimeout(wrongTimer.current)
      wrongTimer.current = window.setTimeout(() => setWrong(null), WRONG_MS)
    },
    [round, matched, roundDone, selected, byId, timer, onAnswer, script.id],
  )

  const nextRound = useCallback(() => {
    setMatched(new Set())
    setSelected(null)
    setWrong(null)
    setTwin(null)
    setAnnouncement('')
    missedInRound.current = new Set()
    if (roundIndex + 1 >= rounds.length) {
      setDone(true)
      return
    }
    setRoundIndex(roundIndex + 1)
    // Keyboard users continue from the first tile of the new grid.
    window.requestAnimationFrame(() => gridRef.current?.querySelector<HTMLElement>('button')?.focus())
  }, [roundIndex, rounds.length])

  const restart = useCallback(() => {
    window.clearTimeout(wrongTimer.current)
    setRounds(build())
    setRun((r) => r + 1)
    setRoundIndex(0)
    setMatched(new Set())
    setSelected(null)
    setWrong(null)
    setMistakes(0)
    setMissed([])
    setTwin(null)
    setAnnouncement('')
    missedInRound.current = new Set()
    setDone(false)
  }, [build])

  useCompleteOnce(done && rounds.length > 0, onComplete)

  if (rounds.length === 0 || !round) {
    return (
      <PracticeShell title={TITLE} onExit={onExit}>
        <EmptyState
          icon="compare_arrows"
          title="Nothing to match here"
          description="These kana are katakana-only, so they have no hiragana twin. Try the whole course instead."
          actionLabel="Back"
          onAction={onExit}
        />
      </PracticeShell>
    )
  }

  if (done) {
    return (
      <PracticeShell title={TITLE} progress={1} onExit={onExit}>
        <PracticeResults
          headline={`${totalPairs} pairs matched`}
          detail={
            mistakes === 0
              ? 'No mistakes — you know both scripts.'
              : `${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'} along the way.`
          }
          missed={missed.map((p) => p[script.id].character)}
          onAgain={restart}
          onExit={onExit}
        />
      </PracticeShell>
    )
  }

  const tileState = (side: Side, id: string): MatchTileState => {
    if (matched.has(id)) return 'matched'
    if (wrong?.[side] === id) return 'wrong'
    if (selected?.side === side && selected.id === id) return 'selected'
    return 'idle'
  }

  const progressValue = (roundIndex + matched.size / round.pairs.length) / rounds.length

  return (
    <PracticeShell
      title={TITLE}
      progress={progressValue}
      status={`Round ${roundIndex + 1} / ${rounds.length}`}
      onExit={onExit}
    >
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <p className="mb-3 text-center text-sm text-on-surface-variant">
        Tap a kana, then its twin in the other script.
      </p>

      <div ref={gridRef} className="grid grid-cols-2 gap-3 sm:gap-4">
        {SIDES.map((side) => (
          <div key={side} role="group" aria-label={SIDE_LABEL[side].label} className="flex flex-col gap-2">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              <span lang="ja" className="font-jp normal-case tracking-normal">{SIDE_LABEL[side].native}</span>
              <span className="sr-only"> ({SIDE_LABEL[side].label})</span>
            </p>
            {(side === 'hiragana' ? round.left : round.right).map((pair) => (
              <MatchTile
                key={pair.id}
                id={pair.id}
                character={pair[side].character}
                state={tileState(side, pair.id)}
                reducedMotion={reducedMotion}
                side={side}
                onPress={press}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Twin tip (fixed height so the grid doesn't move) */}
      <div className="mt-4 min-h-20" aria-hidden="true">
        {twin && (
          <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-3">
            <span lang="ja" className="shrink-0 font-jp text-2xl font-bold text-on-surface">
              {twin.hiragana}
              <span className="mx-1 text-base text-on-surface-variant">↔</span>
              {twin.katakana}
            </span>
            <p className="text-sm leading-snug text-on-surface">
              <span className="font-semibold text-primary">Look-alike twins. </span>
              {twin.tip}
            </p>
          </div>
        )}
      </div>

      <div ref={nextRef} className="mt-auto pt-3">
        {roundDone ? (
          <Button onClick={nextRound} className="flex min-h-12 w-full items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            {roundIndex + 1 >= rounds.length ? 'See results' : 'Next round'}
            <Icon name="arrow_forward" className="text-xl" />
          </Button>
        ) : (
          <p className="text-center text-sm tabular-nums text-on-surface-variant">
            {matched.size} of {round.pairs.length} pairs
          </p>
        )}
      </div>
    </PracticeShell>
  )
}

/** Hiragana ↔ katakana match: loads both charts, then plays the current course's kana (or ?unit= kana). */
export function KanaMatch({ kana, focusIds: priorityIds, onAnswer, onExit, onComplete }: PracticeModeProps) {
  const script = useKanaScript()
  const { pairs, isLoading, error, refetch } = useKanaPairs()
  const focusIds = useMemo(() => kana.map((k) => k.id), [kana])

  if (error) {
    return (
      <PracticeShell title={TITLE} onExit={onExit}>
        <ErrorState message="We couldn't load both kana charts." onRetry={refetch} />
      </PracticeShell>
    )
  }
  if (isLoading || !pairs) return <LoadingState label="Loading practice…" />
  return (
    <MatchSession
      pairs={pairs}
      focusIds={focusIds}
      script={script}
      priorityIds={priorityIds}
      onAnswer={onAnswer}
      onExit={onExit}
      onComplete={onComplete}
    />
  )
}
