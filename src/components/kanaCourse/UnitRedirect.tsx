import { Navigate, useParams } from 'react-router-dom'
import { unitLearnPath, unitQuizPath } from './unitLinks'

/**
 * The old unit page (/kana/<script>/unit/:unitId) and unit quiz page
 * (/quiz/:unitId) now live on the Learn page: the row opened in place, the quiz
 * as a popup. Bookmarks and old links land there.
 */
export function UnitRedirect({ basePath, quiz = false }: { basePath: string; quiz?: boolean }) {
  const { unitId = '' } = useParams<{ unitId: string }>()
  return <Navigate to={quiz ? unitQuizPath(basePath, unitId) : unitLearnPath(basePath, unitId)} replace />
}
