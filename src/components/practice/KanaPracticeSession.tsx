import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import type { PracticeAnswerFn, PracticeModeProps } from '@/components/practice/types'
import { learnService } from '@/api/services/learnService'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { useStudyRecorder } from '@/hooks/useStudyRecorder'
import { focusChars, kanaPracticeRequest, type KanaPracticeMode } from '@/lib/learn/practiceSession'

// Each mode is its own chunk; only the one being played is downloaded.
// 'review' is not here: kana reviews run on the learn API (/review).
const MODES: Record<KanaPracticeMode, ComponentType<PracticeModeProps>> = {
  listen: lazy(() => import('@/components/practice/ListenTap').then((m) => ({ default: m.ListenTap }))),
  build: lazy(() => import('@/components/practice/WordBuilder').then((m) => ({ default: m.WordBuilder }))),
  speed: lazy(() => import('@/components/practice/SpeedRound').then((m) => ({ default: m.SpeedRound }))),
  lookalike: lazy(() => import('@/components/practice/LookAlikeDrill').then((m) => ({ default: m.LookAlikeDrill }))),
  match: lazy(() => import('@/components/practice/KanaMatch').then((m) => ({ default: m.KanaMatch }))),
}

export function isKanaPracticeMode(mode: string | null | undefined): mode is KanaPracticeMode {
  return mode !== undefined && mode !== null && mode in MODES
}

type Status = 'loading' | 'error' | 'ready'

interface KanaPracticeSessionProps {
  mode: KanaPracticeMode
  /** Limit the session to one unit's kana (and tick that unit's Practise step on finishing). */
  unitId?: string
  /** One mix-up pair to drill, e.g. "ぬ:め". */
  pair?: string
  onExit: () => void
}

/**
 * Runs one practice mode as a session on the learn API (POST /learn/practice):
 * the server picks the cards to focus on, every answer is timed and queued,
 * and reaching the results screen completes the session. Used by the practice
 * page and the Learn page's practice popup.
 */
export function KanaPracticeSession({ mode, unitId, pair, onExit }: KanaPracticeSessionProps) {
  const script = useKanaScript()
  const path = useLearningPathStore()
  const unit = script.units.find((u) => u.id === unitId)
  const [kana, setKana] = useState<KanaChar[]>([])
  const [all, setAll] = useState<KanaChar[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const recorder = useStudyRecorder(() => learnService.startPractice(kanaPracticeRequest(script.id, mode, unit?.id, pair)))

  const load = useCallback(() => {
    setStatus('loading')
    script
      .loadSections()
      .then((sections) => {
        const chars = sections.flatMap((s) => s.chars).filter((c) => !c.isEmpty)
        setAll(chars)
        setKana(unit ? unit.kanaIds.flatMap((id) => chars.filter((c) => c.id === id)) : chars)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [script, unit])

  useEffect(load, [load])

  const { finish } = recorder
  const onComplete = useCallback(() => {
    // Unsent answers stay in the answer queue; completing is best-effort for practice.
    finish().catch(() => undefined)
    if (unit) path.markPractised(unit.id)
  }, [unit, path, finish])

  const { answer, session } = recorder
  const onAnswer = useCallback<PracticeAnswerFn>(
    (target, type, given, timer) => {
      answer(target.character, 'recognition', type, given, timer)
    },
    [answer],
  )
  // The session's cards as kana ids, in the server's order.
  const focusIds = useMemo(() => {
    const idByChar = new Map(all.map((k) => [k.character, k.id]))
    return focusChars(session?.questions ?? []).flatMap((c) => idByChar.get(c) ?? [])
  }, [all, session])

  const Mode = MODES[mode]
  const startFailed = recorder.status === 'start-error' && !session
  return (
    <>
      {(status === 'loading' || (!session && !startFailed)) && status !== 'error' && <LoadingState label="Loading practice…" className="p-6" />}
      {status === 'error' && <ErrorState message="We couldn't load the kana." onRetry={load} />}
      {status === 'ready' && startFailed && <ErrorState message="We couldn't start this practice." onRetry={recorder.retry} />}
      {status === 'ready' && session && (
        <Suspense fallback={<LoadingState label="Loading practice…" className="p-6" />}>
          <Mode kana={kana} focusIds={focusIds} onAnswer={onAnswer} onExit={onExit} onComplete={onComplete} />
        </Suspense>
      )}
    </>
  )
}
