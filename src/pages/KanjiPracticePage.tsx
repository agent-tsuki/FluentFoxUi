import { useCallback } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { kanjiTrack } from '@/lib/learn/practiceSession'
import { kanjiLevelPath, kanjiUnitPath } from '@/lib/content/kanji/levels'
import { EmptyState } from '@/components/ui/EmptyState'
import { isKanjiPracticeMode } from '@/components/kanji/practiceModes'
import { KanjiPracticeSession } from '@/components/kanji/KanjiPracticeSession'

/**
 * /kanji/<level>/practice/:mode — a practice round as its own page (the
 * course page's Practice rail and the progress pages link here; a unit's
 * practice opens as a popup on the course page instead). `?unit=` limits it
 * to one unit, `?pair=日:目` drills one mix-up pair.
 */
export function KanjiPracticePage() {
  const level = useKanjiLevel()
  const navigate = useNavigate()
  const { mode } = useParams<{ mode: string }>()
  const [params] = useSearchParams()
  const unitId = params.get('unit') ?? undefined
  const pair = params.get('pair') ?? undefined
  const track = kanjiTrack(level.id)
  const exit = useCallback(
    () => navigate(unitId ? kanjiUnitPath(level.id, unitId) : kanjiLevelPath(level.id)),
    [navigate, unitId, level.id],
  )

  if (!isKanjiPracticeMode(mode)) return <Navigate to={kanjiLevelPath(level.id)} replace />
  return (
    <main className="min-h-dvh bg-surface pt-nav">
      {track ? (
        <KanjiPracticeSession key={mode} mode={mode} track={track} unitId={unitId} pair={pair} onExit={exit} />
      ) : (
        <EmptyState
          icon="schedule"
          title={`${level.label} practice is coming soon`}
          description="Practice is saved to your account, and for now that works for N5 kanji."
          actionLabel="Back to the course"
          onAction={() => navigate(kanjiLevelPath(level.id))}
        />
      )}
    </main>
  )
}
