import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import type { KanjiLevelId } from '@/types/kanji'
import { KanjiLevelProvider } from '@/context/KanjiLevelContext'
import { KANJI_LAST_LEVEL_KEY } from '@/lib/content/kanji/levels'

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

  return (
    <KanjiLevelProvider level={level}>
      <Outlet />
    </KanjiLevelProvider>
  )
}
