import { Navigate, useParams } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { kanjiLevelTestPath, kanjiSkipPath, kanjiUnitPath, kanjiUnitQuizPath } from '@/lib/content/kanji/levels'

/**
 * The old kanji unit page (/kanji/<level>/unit/:unitId) and unit quiz page
 * (/quiz/:unitId) now live on the course page: the row opened in place, the
 * quiz as a popup. Bookmarks and old links land there.
 */
export function KanjiUnitRedirect({ quiz = false }: { quiz?: boolean }) {
  const level = useKanjiLevel()
  const { unitId = '' } = useParams<{ unitId: string }>()
  return <Navigate to={quiz ? kanjiUnitQuizPath(level.id, unitId) : kanjiUnitPath(level.id, unitId)} replace />
}

/** The old test-out (/skip/:scope) and level test (/test) pages: now popups on the course page. */
export function KanjiTestRedirect({ levelTest = false }: { levelTest?: boolean }) {
  const level = useKanjiLevel()
  const { scope = 'all' } = useParams<{ scope: string }>()
  return <Navigate to={levelTest ? kanjiLevelTestPath(level.id) : kanjiSkipPath(level.id, scope)} replace />
}
