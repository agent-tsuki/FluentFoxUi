import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiCourse } from '@/pages/kanjiCourseContext'
import { KANJI_STAGES, KANJI_STAGE_LABEL, type KanjiStage } from '@/api/services/kanjiProgressService'
import { useKanjiStage } from '@/hooks/useKanji'
import { MASTERY_HINT, MASTERY_TONE } from '@/lib/learn/mastery'
import { useLearnSummary } from '@/hooks/useLearnSummary'
import { useReviewForecast } from '@/hooks/useReviewForecast'
import { KANJI_TRACK, lessonPath, reviewPath } from '@/lib/learn/paths'
import { Icon } from '@/components/ui/Icon'
import { ActionLink } from '@/components/learn/ActionLink'
import { ReviewForecast } from '@/components/kanji/ReviewForecast'
import { kanjiCharPath } from '@/lib/content/kanji/levels'
import { cn } from '@/lib/cn'

const CARD =
  'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low sm:p-6'

/**
 * Reviews page of a level (/kanji/<level>/reviews): what is due now and the
 * new kanji left today (GET /learn/summary), a 7-day forecast when the
 * progress API serves one, and every kanji by stage (GET /progress/overview).
 */
export function KanjiReviewsPage() {
  const level = useKanjiLevel()
  const { chars, rowsByChar } = useKanjiCourse()
  const { summary } = useLearnSummary(KANJI_TRACK)
  const forecast = useReviewForecast(KANJI_TRACK)
  const stageOf = useKanjiStage()
  const byStage = useMemo(() => {
    const groups = new Map<KanjiStage, string[]>(KANJI_STAGES.map((s) => [s, []]))
    for (const c of chars) groups.get(stageOf(c))?.push(c)
    return groups
  }, [chars, stageOf])
  const dueCount = summary?.due_now ?? 0

  return (
    <div className="max-w-3xl space-y-8">
      <section aria-labelledby="due-heading" className={CARD}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Now</p>
        <h2 id="due-heading" className="mt-1.5 font-headline text-xl font-bold text-on-surface md:text-2xl">
          {dueCount > 0 ? `${dueCount} review${dueCount === 1 ? '' : 's'} ready` : 'Nothing due right now'}
        </h2>
        {summary && (
          <p className="mt-1 text-sm tabular-nums text-on-surface-variant">
            {summary.due_today} due today · {summary.new_left_today} new kanji left today
          </p>
        )}
        <p className="mt-2 text-sm text-on-surface-variant">
          Each kanji has two cards, meaning and reading, asked separately. Any correct reading counts.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {dueCount > 0 && (
            <ActionLink to={reviewPath(KANJI_TRACK)} className="w-full sm:w-auto">
              <Icon name="replay" className="text-xl" />
              Start reviews
            </ActionLink>
          )}
          {summary && summary.new_left_today > 0 && (
            <ActionLink to={lessonPath(KANJI_TRACK)} variant={dueCount > 0 ? 'outline' : 'primary'} className="w-full sm:w-auto">
              <Icon name="school" className="text-xl" />
              Learn new kanji
            </ActionLink>
          )}
        </div>
        {forecast && <ReviewForecast counts={forecast} className="mt-6" />}
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
                  <h3 className="flex items-center gap-2 font-bold text-on-surface">
                    <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', MASTERY_TONE[stage].fill)} />
                    {KANJI_STAGE_LABEL[stage]} <span className="font-normal tabular-nums text-on-surface-variant">· {list.length}</span>
                  </h3>
                  <span className="text-xs text-on-surface-variant">{MASTERY_HINT[stage]}</span>
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
