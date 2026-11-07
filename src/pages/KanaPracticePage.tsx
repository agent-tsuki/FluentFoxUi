import { useCallback } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useKanaScript } from '@/context/KanaScriptContext'
import { lookAlikeSetsFor } from '@/lib/content/kana/lookAlikeSets'
import { reviewPath } from '@/lib/learn/paths'
import { unitLearnPath } from '@/components/kanaCourse/unitLinks'
import { isKanaPracticeMode, KanaPracticeSession } from '@/components/practice/KanaPracticeSession'

/**
 * /kana/<script>/practice/:mode — one practice mode over the script's kana
 * (or one unit's, with ?unit=; ?pair=ぬ:め drills one mix-up pair, linked from
 * the progress pages). The Learn page runs the same session in a popup.
 */
export function KanaPracticePage() {
  const script = useKanaScript()
  const navigate = useNavigate()
  const { mode } = useParams<{ mode: string }>()
  const [searchParams] = useSearchParams()
  const unitId = searchParams.get('unit') ?? undefined
  const pair = searchParams.get('pair') ?? undefined
  const onExit = useCallback(
    () => navigate(unitId ? unitLearnPath(script.basePath, unitId) : `${script.basePath}/learn`),
    [navigate, unitId, script.basePath],
  )
  // The look-alike drill exists only for scripts with look-alike sets.
  const available = mode !== 'lookalike' || lookAlikeSetsFor(script.id).length > 0
  if (mode === 'review') return <Navigate to={reviewPath(script.id)} replace />
  if (!isKanaPracticeMode(mode) || !available) return <Navigate to={`${script.basePath}/learn`} replace />
  return (
    <main className="pt-nav min-h-dvh bg-surface">
      <KanaPracticeSession key={mode} mode={mode} unitId={unitId} pair={pair} onExit={onExit} />
    </main>
  )
}
