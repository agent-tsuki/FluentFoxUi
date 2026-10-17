import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import type { KanjiLevelId } from '@/types/kanji'
import { KanjiLevelProvider } from '@/context/KanjiLevelContext'
import { KANJI_LAST_LEVEL_KEY } from '@/lib/content/kanji/levels'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import { useKanjiLevelIndex } from '@/hooks/useKanji'

/**
 * Route element for one level's course tree (`/kanji/n5/*`): provides the
 * level config and remembers the level for the `/kanji` redirect.
 */
export function KanjiLevelRoute({ level }: { level: KanjiLevelId }) {
  useEffect(() => {
    try {
      localStorage.setItem(KANJI_LAST_LEVEL_KEY, level)
    } catch {
      /* storage blocked: /kanji falls back to N5 */
    }
  }, [level])

  // Passed skip tests mark the units of their group tested out (index is cached).
  const groups = useKanjiLevelIndex(level).data?.groups
  useEffect(() => {
    if (groups) getKanjiPath(level).setScopes({ groups })
  }, [level, groups])

  return (
    <KanjiLevelProvider level={level}>
      <Outlet />
    </KanjiLevelProvider>
  )
}
