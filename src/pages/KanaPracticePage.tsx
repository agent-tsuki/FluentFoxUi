import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import type { PracticeAnswerFn, PracticeModeProps } from '@/components/practice/types'
import { learnService } from '@/api/services/learnService'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { useStudyRecorder } from '@/hooks/useStudyRecorder'
import { focusChars, kanaPracticeRequest, type KanaPracticeMode } from '@/lib/learn/practiceSession'
import { lookAlikeSetsFor } from '@/lib/content/kana/lookAlikeSets'
import { reviewPath } from '@/lib/learn/paths'

// Each mode is its own chunk; only the one being played is downloaded.
// 'review' is not here: kana reviews run on the learn API (/review), see below.
const MODES: Record<KanaPracticeMode, ComponentType<PracticeModeProps>> = {
  listen: lazy(() => import('@/components/practice/ListenTap').then((m) => ({ default: m.ListenTap }))),
  build:  lazy(() => import('@/components/practice/WordBuilder').then((m) => ({ default: m.WordBuilder }))),
  speed:  lazy(() => import('@/components/practice/SpeedRound').then((m) => ({ default: m.SpeedRound }))),
  lookalike: lazy(() => import('@/components/practice/LookAlikeDrill').then((m) => ({ default: m.LookAlikeDrill }))),
  match:  lazy(() => import('@/components/practice/KanaMatch').then((m) => ({ default: m.KanaMatch }))),
}

type Status = 'loading' | 'error' | 'ready'

function isKanaPracticeMode(mode: string | undefined): mode is KanaPracticeMode {
  return mode !== undefined && mode in MODES
}

/** /kana/<script>/practice/:mode — one practice mode over the script's kana (or one unit's, with ?unit=). */
export function KanaPracticePage() {
  const script = useKanaScript()
  const { mode } = useParams<{ mode: string }>()
  // The look-alike drill exists only for scripts with look-alike sets.
  const available = mode !== 'lookalike' || lookAlikeSetsFor(script.id).length > 0
  if (mode === 'review') return <Navigate to={reviewPath(script.id)} replace />
  if (!isKanaPracticeMode(mode) || !available) return <Navigate to={`${script.basePath}#practice`} replace />
  return <Practice key={mode} mode={mode} />
}

/**
 * Runs one practice mode as a session on the learn API (POST /learn/practice):
 * the server picks the cards to focus on, every answer is timed and queued,
 * and reaching the results screen completes the session.
 */
function Practice({ mode }: { mode: KanaPracticeMode }) {
  const script = useKanaScript()
  const path = useLearningPathStore()
  const navigate = useNavigate()
  // ?unit=ka limits the session to one unit's kana and returns to that unit.
  const [searchParams] = useSearchParams()
  const unit = script.units.find((u) => u.id === searchParams.get('unit'))
  const [kana, setKana] = useState<KanaChar[]>([])
  const [all, setAll] = useState<KanaChar[]>([])
  const [status, setStatus] = useState<Status>('loading')
  // ?pair=ぬ:め drills one mix-up pair (the progress pages link here).
  const pair = searchParams.get('pair') ?? undefined
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

  const onExit = useCallback(
    () => navigate(unit ? `${script.basePath}/unit/${unit.id}` : `${script.basePath}#practice`),
    [navigate, unit, script.basePath],
  )
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
    <main className="pt-nav min-h-dvh bg-surface">
      {(status === 'loading' || (!session && !startFailed)) && status !== 'error' && <LoadingState label="Loading practice…" />}
      {status === 'error' && <ErrorState message="We couldn't load the kana." onRetry={load} />}
      {status === 'ready' && startFailed && <ErrorState message="We couldn't start this practice." onRetry={recorder.retry} />}
      {status === 'ready' && session && (
        <Suspense fallback={<LoadingState label="Loading practice…" />}>
          <Mode kana={kana} focusIds={focusIds} onAnswer={onAnswer} onExit={onExit} onComplete={onComplete} />
        </Suspense>
      )}
    </main>
  )
}
