import { Eyebrow } from '@/components/ui/SectionHeader'
import { FadeIn } from '@/components/ui/FadeIn'
import { cn } from '@/lib/cn'
import {
  DASHBOARD_SECTION as COPY,
  DASHBOARD_STATS,
  REVISIT_TOPICS,
  RECENT_QUIZZES,
  type ContentLang,
  type DashboardStatTone,
  type QuizScoreTone,
} from '@/lib/content/home/dashboard'

const STAT_TONE: Record<DashboardStatTone, string> = {
  primary: 'text-primary',
  default: 'text-ink',
  success: 'text-success',
}

const SCORE_TONE: Record<QuizScoreTone, string> = {
  success: 'text-success',
  primary: 'text-primary',
}

/** Props that mark a fragment as Japanese (lang attr + Japanese font). */
const langProps = (lang: ContentLang) =>
  lang === 'ja' ? { lang: 'ja', className: 'font-ja-display' } : {}

/**
 * DashboardExample — home-page section showing a static, clearly-labelled
 * example of the learner dashboard (sample data from `@/lib/content/home/dashboard`).
 */
export function DashboardExample() {
  return (
    <section aria-labelledby="dashboard-example-title" className="px-6 py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <FadeIn className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex min-w-0 max-w-[680px] flex-1 basis-[480px] flex-col gap-3.5">
            <Eyebrow className="!mb-0">{COPY.eyebrow}</Eyebrow>
            <h2
              id="dashboard-example-title"
              className="font-display text-display-md font-extrabold leading-[1.08] tracking-[-0.035em] text-ink"
            >
              {COPY.title}
            </h2>
            <p className="text-lg leading-relaxed text-ink-muted">{COPY.description}</p>
          </div>
          <span className="rounded-full bg-surface-sunken px-3.5 py-1.5 text-xs font-bold text-ink-muted">
            {COPY.exampleBadge}
            <span className="sr-only"> — {COPY.exampleNote}</span>
          </span>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface-raised p-5 shadow-elevation-2 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                {COPY.greeting}
              </p>
              <p className="text-base text-ink-muted">
                {COPY.streakPrefix}
                <strong lang="ja" className="font-ja-display font-bold text-ink">
                  {COPY.nextUp}
                </strong>
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {DASHBOARD_STATS.map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-col-reverse gap-1 rounded-xl bg-surface-sunken p-4 sm:p-5"
                >
                  <dt className="text-xs font-bold uppercase tracking-[0.06em] text-ink-muted">
                    {stat.label}
                  </dt>
                  <dd className={cn('font-display text-3xl font-extrabold', STAT_TONE[stat.tone])}>
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-4 lg:grid-cols-2">
              <RevisitTopicsPanel />
              <RecentQuizzesPanel />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

const PANEL = 'flex min-w-0 flex-col rounded-xl border border-line p-5'

function RevisitTopicsPanel() {
  return (
    <div className={cn(PANEL, 'gap-3.5')}>
      <h3 className="text-base font-extrabold text-ink">{COPY.topicsTitle}</h3>
      {/* Label column stacks above the bar on narrow screens; 150px column from `sm` up. */}
      <ul className="flex flex-col gap-3 text-base sm:gap-2.5">
        {REVISIT_TOPICS.map((topic) => (
          <li
            key={topic.id}
            className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-x-3.5 gap-y-1.5 sm:grid-cols-[150px_minmax(0,1fr)_2.75rem]"
          >
            <span
              lang={topic.lang === 'ja' ? 'ja' : undefined}
              className={cn('col-span-2 text-ink sm:col-span-1', topic.lang === 'ja' && 'font-ja-display')}
            >
              {topic.label}
            </span>
            <div aria-hidden="true" className="h-2 rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-primary" style={{ width: `${topic.missRate}%` }} />
            </div>
            <span className="text-right font-bold text-primary">{topic.missRate}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RecentQuizzesPanel() {
  return (
    <div className={cn(PANEL, 'gap-1')}>
      <h3 className="mb-2 text-base font-extrabold text-ink">{COPY.quizzesTitle}</h3>
      <ul>
        {RECENT_QUIZZES.map((quiz) => (
          <li
            key={quiz.id}
            className="flex items-baseline justify-between gap-3 border-b border-line py-2.5 last:border-b-0"
          >
            <span className="min-w-0 text-base font-semibold text-ink">
              <span {...langProps(quiz.lang)}>{quiz.name}</span>{' '}
              <span className="font-medium text-ink-muted">· {quiz.when}</span>
            </span>
            <span className={cn('shrink-0 font-extrabold', SCORE_TONE[quiz.tone])}>{quiz.score}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
