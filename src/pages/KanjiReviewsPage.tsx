import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiProgress } from '@/hooks/useKanji'
import { useKanjiCourse } from '@/pages/kanjiCourseContext'
import {
  KANJI_STAGES,
  KANJI_STAGE_LABEL,
  NEW_KANJI_PER_DAY,
  buildReviewQueue,
  kanjiStage,
  newKanjiToday,
  reviewForecast,
  type KanjiStage,
} from '@/api/services/kanjiProgressService'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import { ReviewForecast } from '@/components/kanji/ReviewForecast'
import { kanjiCharPath, kanjiReviewSessionPath } from '@/lib/content/kanji/levels'
import { cn } from '@/lib/cn'

const CARD =
  'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-6'

const STAGE_HINT: Record<KanjiStage, string> = {
  new: 'Not reviewed yet',
  learning: 'Coming back within a day',
  familiar: 'Holding for a few days',
  strong: 'Holding for most of a week',
  mastered: 'Holding for a week or more',
}

/**
 * Reviews page of a level (/kanji/<level>/reviews): what is due now, the
 * daily new-kanji allowance, a 7-day forecast and every kanji by stage.
 */
export function KanjiReviewsPage() {
  const level = useKanjiLevel()
  const { chars, rowsByChar } = useKanjiCourse()
  const progress = useKanjiProgress()
  const { queue, forecast, byStage, newToday } = useMemo(() => {
    const groups = new Map<KanjiStage, string[]>(KANJI_STAGES.map((s) => [s, []]))
    for (const c of chars) groups.get(kanjiStage(progress, c))?.push(c)
    return {
      queue: buildReviewQueue(progress, chars),
      forecast: reviewForecast(progress, chars),
      byStage: groups,
      newToday: newKanjiToday().length,
    }
  }, [progress, chars])
  const dueCount = queue.due.length + queue.fresh.length * 2

  return (
    <div className="max-w-3xl space-y-8">
      <section aria-labelledby="due-heading" className={CARD}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Now</p>
        <h2 id="due-heading" className="mt-1.5 font-headline text-xl font-bold text-on-surface md:text-2xl">
          {dueCount > 0 ? `${dueCount} review${dueCount === 1 ? '' : 's'} ready` : 'Nothing due right now'}
        </h2>
        <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
          {queue.due.length} due · {queue.fresh.length} new kanji ({newToday} of {NEW_KANJI_PER_DAY} new today)
          {queue.waiting > 0 && ` · ${queue.waiting} waiting for tomorrow`}
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          Each kanji has two cards, meaning and reading, asked separately. Any correct reading counts.
        </p>
        {dueCount > 0 && (
          <ActionLink to={kanjiReviewSessionPath(level.id)} className="mt-4 w-full sm:w-auto">
            <Icon name="replay" className="text-xl" />
            Start reviews
          </ActionLink>
        )}
        <ReviewForecast counts={forecast} className="mt-6" />
      </section>

      <section aria-labelledby="stages-heading">
        <h2 id="stages-heading" className="font-headline text-xl font-bold text-on-surface md:text-2xl">
          Your {level.label} kanji by stage
        </h2>
        <ul className="mt-4 space-y-3">
          {KANJI_STAGES.map((stage) => {
            const list = byStage.get(stage) ?? []
            return (
              <li key={stage} className={cn(CARD, 'p-4 sm:p-4')}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-bold text-on-surface">
                    {KANJI_STAGE_LABEL[stage]} <span className="font-normal tabular-nums text-on-surface-variant">· {list.length}</span>
                  </h3>
                  <span className="text-xs text-on-surface-variant">{STAGE_HINT[stage]}</span>
                </div>
                {list.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {list.map((c) => (
                      <li key={c}>
                        <Link
                          to={kanjiCharPath(c, level.id)}
                          aria-label={`${c}, ${rowsByChar.get(c)?.meaning ?? ''}`}
                          lang="ja"
                          className="flex h-11 w-11 items-center justify-center rounded-lg font-jp text-xl text-on-surface hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
