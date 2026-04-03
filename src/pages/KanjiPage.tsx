import { useEffect, useMemo, useState } from 'react'
import type { JlptLevel, KanjiGroup } from '@/types'
import { kanjiService } from '@/api/services/kanjiService'
import {
  KanjiHero,
  KanjiFilterBar,
  KanjiGrid,
  KanjiLearningGuide,
} from '@/components/sections/KanjiChart'

type FilterValue = JlptLevel | 'all'

export function KanjiPage() {
  const [groups, setGroups] = useState<KanjiGroup[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterValue>('N5')

  useEffect(() => {
    kanjiService.getGroups().then(setGroups)
    window.scrollTo(0, 0)
  }, [])

  // Levels that actually have data — drives which filter pills are shown
  const availableLevels = useMemo<JlptLevel[]>(
    () => groups.map((g) => g.level),
    [groups]
  )

  // Apply filter — "all" shows every group
  const visibleGroups = useMemo(
    () => (activeFilter === 'all' ? groups : groups.filter((g) => g.level === activeFilter)),
    [groups, activeFilter]
  )

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
      <KanjiHero />

      <KanjiFilterBar
        active={activeFilter}
        available={availableLevels}
        onChange={setActiveFilter}
      />

      {visibleGroups.map((group) => (
        <KanjiGrid key={group.id} group={group} />
      ))}

      <KanjiLearningGuide />
    </main>
  )
}
