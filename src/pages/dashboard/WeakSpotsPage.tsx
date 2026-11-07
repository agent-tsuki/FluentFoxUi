import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { LearningTrack } from '@/types/learn'
import { useConfusions, useWeakGroups, useWeakItems } from '@/hooks/useProgress'
import { useDashboardTitle } from '@/hooks/useDashboardTitle'
import { DashboardPageHeader } from '@/components/dashboard/DashboardBits'
import { ConfusionList, ProgressSection, TrackFilter, WeakGroupsList, WeakItemsList } from '@/components/progress'
import { HOW_GRADING_WORKS_PATH, isLearningTrack } from '@/lib/learn/paths'

const WEAK_ITEMS_LIMIT = 20
const CONFUSIONS_LIMIT = 10

/** /dashboard/weak-spots: the hardest cards, groups and look-alike pairs. */
export function WeakSpotsPage() {
  useDashboardTitle('Weak spots')
  const [params, setParams] = useSearchParams()
  const raw = params.get('track')
  const track: LearningTrack | undefined = isLearningTrack(raw) ? raw : undefined
  const setTrack = useCallback(
    (next: LearningTrack | undefined) =>
      setParams((prev) => {
        const p = new URLSearchParams(prev)
        if (next) p.set('track', next)
        else p.delete('track')
        return p
      }, { replace: true }),
    [setParams],
  )
  const weakItems = useWeakItems(track, WEAK_ITEMS_LIMIT)
  const weakGroups = useWeakGroups(track)
  const confusions = useConfusions(track, CONFUSIONS_LIMIT)

  return (
    <div className="space-y-12">
      <DashboardPageHeader
        eyebrow="Weak spots"
        title="What to practise next"
        description={
          <>
            Cards, groups and look-alike pairs you miss more than usual, with a drill for each.{' '}
            <Link to={HOW_GRADING_WORKS_PATH} className="font-semibold text-primary underline-offset-4 hover:underline">
              How grading works
            </Link>
          </>
        }
        actions={<TrackFilter value={track} onChange={setTrack} />}
      />

      <ProgressSection
        id="weak"
        eyebrow="Needs work"
        title="Weak items"
        description="The cards you find hardest right now, and why."
        state={weakItems}
        isEmpty={(items) => items.length === 0}
        empty={{ icon: 'verified', title: 'No weak items', description: 'Nothing stands out yet. Keep reviewing and this list fills in where you struggle.' }}
      >
        {(items) => <WeakItemsList items={items} />}
      </ProgressSection>

      <ProgressSection
        id="weak-groups"
        eyebrow="Needs work"
        title="Weak groups"
        description="Units and kana groups you miss more often than usual."
        state={weakGroups}
        isEmpty={(groups) => groups.length === 0}
        empty={{ icon: 'grid_view', title: 'No weak groups', description: 'Every group is at or above your average.' }}
      >
        {(groups) => <WeakGroupsList groups={groups} />}
      </ProgressSection>

      <ProgressSection
        id="mix-ups"
        eyebrow="Look-alikes"
        title="Mix-ups"
        description="Pairs you confuse most. Tap one to drill just that pair."
        state={confusions}
        isEmpty={(pairs) => pairs.length === 0}
        empty={{ icon: 'compare_arrows', title: 'No mix-ups yet', description: 'When you pick one character for another, the pair shows up here.' }}
      >
        {(pairs) => <ConfusionList pairs={pairs} />}
      </ProgressSection>
    </div>
  )
}
