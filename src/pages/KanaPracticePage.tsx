import { lazy, Suspense, useCallback, useEffect, useState, type ComponentType } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { KanaChar } from '@/types'
import { useKanaScript } from '@/context/KanaScriptContext'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import type { PracticeModeId, PracticeModeProps } from '@/components/practice/types'
import { useLearningPathStore } from '@/hooks/useLearningPath'
import { lookAlikeSetsFor } from '@/lib/content/kana/lookAlikeSets'
import { reviewPath } from '@/lib/learn/paths'

// Each mode is its own chunk; only the one being played is downloaded.
// 'review' is not here: kana reviews run on the learn API (/review), see below.
const MODES: Record<Exclude<PracticeModeId, 'review'>, ComponentType<PracticeModeProps>> = {
  listen: lazy(() => import('@/components/practice/ListenTap').then((m) => ({ default: m.ListenTap }))),
  build:  lazy(() => import('@/components/practice/WordBuilder').then((m) => ({ default: m.WordBuilder }))),
  speed:  lazy(() => import('@/components/practice/SpeedRound').then((m) => ({ default: m.SpeedRound }))),
  lookalike: lazy(() => import('@/components/practice/LookAlikeDrill').then((m) => ({ default: m.LookAlikeDrill }))),
  match:  lazy(() => import('@/components/practice/KanaMatch').then((m) => ({ default: m.KanaMatch }))),
}

type Status = 'loading' | 'error' | 'ready'

/** /kana/<script>/practice/:mode — one practice mode over the script's kana (or one unit's, with ?unit=). */
export function KanaPracticePage() {
  const script = useKanaScript()
  const path = useLearningPathStore()
  const { mode } = useParams<{ mode: string }>()
  const navigate = useNavigate()
  // ?unit=ka limits the session to one unit's kana and returns to that unit.
  const [searchParams] = useSearchParams()
  const unit = script.units.find((u) => u.id === searchParams.get('unit'))
  const [kana, setKana] = useState<KanaChar[]>([])
  const [status, setStatus] = useState<Status>('loading')

  const load = useCallback(() => {
    setStatus('loading')
    script
      .loadSections()
      .then((sections) => {
        const all = sections.flatMap((s) => s.chars).filter((c) => !c.isEmpty)
        setKana(unit ? unit.kanaIds.flatMap((id) => all.filter((c) => c.id === id)) : all)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [script, unit])

  useEffect(load, [load])

  const onExit = useCallback(
    () => navigate(unit ? `${script.basePath}/unit/${unit.id}` : `${script.basePath}#practice`),
    [navigate, unit, script.basePath],
  )
  const onComplete = useCallback(() => {
    if (unit) path.markPractised(unit.id)
  }, [unit, path])

  // The look-alike drill exists only for scripts with look-alike sets.
  const available = mode !== 'lookalike' || lookAlikeSetsFor(script.id).length > 0
  if (mode === 'review') return <Navigate to={reviewPath(script.id)} replace />
  const Mode = mode && mode in MODES && available ? MODES[mode as keyof typeof MODES] : null
  if (!Mode) return <Navigate to={`${script.basePath}#practice`} replace />

  return (
    <main className="pt-nav min-h-dvh bg-surface">
      {status === 'loading' && <LoadingState label="Loading practice…" />}
      {status === 'error' && <ErrorState message="We couldn't load the kana." onRetry={load} />}
      {status === 'ready' && (
        <Suspense fallback={<LoadingState label="Loading practice…" />}>
          <Mode kana={kana} onExit={onExit} onComplete={onComplete} />
        </Suspense>
      )}
    </main>
  )
}
