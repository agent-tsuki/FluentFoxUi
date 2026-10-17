import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { useReviewForecast } from '@/hooks/useReviewForecast'
import { kanjiLevelTestPath, kanjiUnitPath, kanjiLevelPagePath } from '@/lib/content/kanji/levels'
import { KANJI_TRACK, lessonPath, reviewPath } from '@/lib/learn/paths'
import type { KanjiUnitView } from './kanjiUnits'
import { percent } from './kanjiUnits'
import { ReviewForecast } from './ReviewForecast'
import type { FinalTestResult } from '@/api/services/learningPathService'

/**
 * KanjiTodayCard — the first block of a level's Course page: reviews due and
 * new kanji left today (GET /learn/summary, signed-in learners only), the next
 * unit, and a 7-day forecast when the progress API serves one. One primary
 * action: reviews when any are due, otherwise the next unit.
 */
interface KanjiTodayCardProps {
  next?: KanjiUnitView
  isFresh: boolean
  unitCount: number
  levelTest?: FinalTestResult
}

const CARD =
  'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-6'

export function KanjiTodayCard({ next, isFresh, unitCount, levelTest }: KanjiTodayCardProps) {
  const level = useKanjiLevel()
  const { summary } = useLearnSummary(KANJI_TRACK)
  const forecast = useReviewForecast(KANJI_TRACK)
  const reviewCount = summary?.due_now ?? 0
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
        {summary && `${summary.new_left_today} new kanji left today · `}
        {!next && levelTest && `level test best ${percent(levelTest.best)}`}
        {next && `${next.completed} of ${next.total} steps in Unit ${next.number} of ${unitCount}`}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {hasReviews && (
          <ActionLink to={reviewPath(KANJI_TRACK)} className="w-full sm:w-auto">
            <Icon name="replay" className="text-xl" />
            Review {reviewCount}
          </ActionLink>
        )}
        {summary && summary.new_left_today > 0 && (
          <ActionLink to={lessonPath(KANJI_TRACK)} variant="outline" className="w-full sm:w-auto">
            <Icon name="school" className="text-xl" />
            Learn new kanji
          </ActionLink>
        )}
        {nextAction}
      </div>

      {forecast && forecast.some((n) => n > 0) && <ReviewForecast counts={forecast} className="mt-5" />}
    </section>
  )
}
