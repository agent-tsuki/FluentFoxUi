import { useCallback, useEffect, useMemo, useState } from 'react'
import type { JlptLevel, KanjiGroup } from '@/types'
import { kanjiService } from '@/api/services/kanjiService'
import {
  KanjiHero,
  KanjiFilterBar,
  KanjiGrid,
  KanjiLearningGuide,
} from '@/components/sections/KanjiChart'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'

type FilterValue = JlptLevel | 'all'
type Status = 'loading' | 'error' | 'ready'

export function KanjiPage() {
  const [groups, setGroups] = useState<KanjiGroup[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [activeFilter, setActiveFilter] = useState<FilterValue>('N5')

  const fetchGroups = useCallback(() => {
    setStatus('loading')
    kanjiService
      .getGroups()
      .then((data) => {
        setGroups(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    fetchGroups()
    window.scrollTo(0, 0)
  }, [fetchGroups])

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

  if (status === 'loading') {
    return (
      <main className="pt-nav pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <LoadingState label="Loading kanji chart…">
          <div className="space-y-4 text-center mb-16">
            <SkeletonBlock className="h-9 w-64 rounded-xl mx-auto" />
            <SkeletonBlock className="h-5 w-96 max-w-full rounded-xl mx-auto" />
          </div>
          <div className="flex justify-center gap-3 mb-16">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-9 w-16 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </LoadingState>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="pt-nav pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <ErrorState message="We couldn't load the kanji chart." onRetry={fetchGroups} />
      </main>
    )
  }

  return (
    <main className="pt-nav pb-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
      <KanjiHero />

      <KanjiFilterBar
        active={activeFilter}
        available={availableLevels}
        onChange={setActiveFilter}
      />

      {visibleGroups.length > 0 ? (
        visibleGroups.map((group) => <KanjiGrid key={group.id} group={group} />)
      ) : (
        <EmptyState
          icon="filter_alt_off"
          title="No kanji at this level yet"
          description="Try a different JLPT level filter to see more characters."
          actionLabel={activeFilter !== 'all' ? 'Show all levels' : undefined}
          onAction={activeFilter !== 'all' ? () => setActiveFilter('all') : undefined}
        />
      )}

      <KanjiLearningGuide />
    </main>
  )
}
