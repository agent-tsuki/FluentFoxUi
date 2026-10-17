import { useMemo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiProgress } from '@/hooks/useKanji'
import {
  NEW_KANJI_PER_DAY,
  buildReviewQueue,
  newKanjiToday,
  reviewForecast,
} from '@/api/services/kanjiProgressService'
import { kanjiLevelTestPath, kanjiReviewSessionPath, kanjiUnitPath, kanjiLevelPagePath } from '@/lib/content/kanji/levels'
import type { KanjiUnitView } from './kanjiUnits'
import { percent } from './kanjiUnits'
import { ReviewForecast } from './ReviewForecast'
import type { FinalTestResult } from '@/api/services/learningPathService'

/**
 * KanjiTodayCard — the first block of a level's Course page: reviews due,
 * today's new-kanji allowance, the next unit, and a 7-day forecast. One
 * primary action: reviews when any are due, otherwise the next unit.
 */
interface KanjiTodayCardProps {
  chars: readonly string[]
  next?: KanjiUnitView
  isFresh: boolean
  unitCount: number
  levelTest?: FinalTestResult
}

const CARD =
  'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-6'

export function KanjiTodayCard({ chars, next, isFresh, unitCount, levelTest }: KanjiTodayCardProps) {
  const level = useKanjiLevel()
  const progress = useKanjiProgress()
  const { queue, forecast, newToday } = useMemo(
    () => ({
      queue: buildReviewQueue(progress, chars),
      forecast: reviewForecast(progress, chars),
      newToday: newKanjiToday().length,
    }),
    [progress, chars],
  )
  const reviewCount = queue.due.length + queue.fresh.length * 2
  const hasReviews = reviewCount > 0

  const nextAction = next ? (
    <ActionLink to={kanjiUnitPath(level.id, next.unit.id)} variant={hasReviews ? 'outline' : 'primary'} className="w-full sm:w-auto">
      <Icon name={isFresh ? 'play_circle' : 'arrow_forward'} className="text-xl" />
      {isFresh ? 'Start' : 'Continue'} · Unit {next.number}
    </ActionLink>
  ) : levelTest?.passedAt ? (
    <ActionLink to={`${kanjiLevelPagePath(level.id, 'tests')}#certificate`} variant={hasReviews ? 'outline' : 'primary'} className="w-full sm:w-auto">
      <Icon name="workspace_premium" className="text-xl" />
      View certificate
    </ActionLink>
  ) : (
    <ActionLink to={kanjiLevelTestPath(level.id)} variant={hasReviews ? 'outline' : 'primary'} className="w-full sm:w-auto">
      <Icon name="emoji_events" className="text-xl" />
      Take the level test
    </ActionLink>
  )

  return (
    <section aria-labelledby="today-heading" className={CARD}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Today</p>
      <h2 id="today-heading" className="mt-1.5 font-headline text-xl font-bold text-on-surface md:text-2xl">
        {hasReviews ? `${reviewCount} review${reviewCount === 1 ? '' : 's'} due` : next ? `Unit ${next.number}: ${next.unit.title}` : 'All units done'}
      </h2>
      <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
        {newToday} of {NEW_KANJI_PER_DAY} new kanji today
        {queue.waiting > 0 && ` · ${queue.waiting} more waiting for tomorrow`}
        {!next && levelTest && ` · level test best ${percent(levelTest.best)}`}
        {next && ` · ${next.completed} of ${next.total} steps in Unit ${next.number} of ${unitCount}`}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {hasReviews && (
          <ActionLink to={kanjiReviewSessionPath(level.id)} className="w-full sm:w-auto">
            <Icon name="replay" className="text-xl" />
            Review {reviewCount}
          </ActionLink>
        )}
        {nextAction}
      </div>

      {forecast.some((n) => n > 0) ? (
        <ReviewForecast counts={forecast} className="mt-5" />
      ) : (
        <p className="mt-5 text-sm text-on-surface-variant">No reviews scheduled yet. Finish a unit quiz to start them.</p>
      )}
    </section>
  )
}
