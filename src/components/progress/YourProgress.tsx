import type { LearningTrack, SrsItemType } from '@/types/learn'
import { useItemHistory } from '@/hooks/useProgress'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ItemHistoryPanel } from './ItemHistoryPanel'

interface YourProgressProps {
  itemType: SrsItemType
  /** Kana character or kanji char. */
  id: string
  track: LearningTrack
}

/**
 * The signed-in learner's history for one kana or kanji: level, cards and
 * last answers. Renders nothing for guests and unverified users.
 */
export function YourProgress({ itemType, id, track }: YourProgressProps) {
  const { data, isLoading, error, refetch } = useItemHistory(itemType, id, track)
  if (error) return <ErrorState message="We couldn't load your history for this one." onRetry={refetch} className="py-6" />
  if (isLoading) {
    return (
      <LoadingState label="Loading your progress…">
        <SkeletonBlock className="h-20 w-full rounded-xl" />
      </LoadingState>
    )
  }
  return data ? <ItemHistoryPanel history={data} /> : null
}
