import { memo, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CourseCard } from '@/components/classes/CourseCard'
import { CourseGridSkeleton } from '@/components/classes/CourseGrid'
import { Carousel } from '@/components/ui/Carousel'
import { Icon } from '@/components/ui/Icon'
import { useClasses } from '@/hooks/useClasses'
import {
  HOME_CLASSES,
  HOME_STATS,
  HOW_IT_WORKS_CLOSING,
  HOW_IT_WORKS_INTRO,
  HOW_IT_WORKS_STEPS,
  type HowItWorksStep,
} from '@/lib/content/home/howItWorks'
import type { ClassesFilters } from '@/types/classes'

/**
 * Everything under the hero: the numbers band, "How FoxSensei works" as one
 * path of four steps (kana → kanji → N5 grammar → review), a few hand-picked
 * video courses, then the closing call to start.
 */
export function HowItWorks() {
  return (
    <>
      <StatsBand />

      <section id="journey" aria-labelledby="how-title" className="scroll-mt-nav bg-surface-sunken">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:py-24">
          <p className="concept-eyebrow">{HOW_IT_WORKS_INTRO.eyebrow}</p>
          <h2 id="how-title" className="concept-section-title mt-4 max-w-4xl">
            {HOW_IT_WORKS_INTRO.title}
          </h2>

          <ol className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:mt-14 lg:grid-cols-4 lg:gap-x-6">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <StepColumn key={step.number} step={step} last={index === HOW_IT_WORKS_STEPS.length - 1} />
            ))}
          </ol>
        </div>
      </section>

      <HomeClasses />

      <section aria-labelledby="closing-title" className="mx-auto max-w-6xl px-6 py-20 text-center sm:px-10 lg:py-24">
        <h2 id="closing-title" className="concept-section-title">
          {HOW_IT_WORKS_CLOSING.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-ink-muted">{HOW_IT_WORKS_CLOSING.body}</p>
        <Link
          to={HOW_IT_WORKS_CLOSING.cta.to}
          className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-bold text-on-primary shadow-elevation-2 transition duration-200 hover:bg-primary-hover motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {HOW_IT_WORKS_CLOSING.cta.label}
          <Icon name="arrow_forward" className="text-lg transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </section>
    </>
  )
}

function StatsBand() {
  return (
    <section aria-label="FoxSensei in numbers" className="border-y border-line bg-surface-raised">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 text-center sm:grid-cols-3 sm:px-10 lg:grid-cols-5">
        {HOME_STATS.map((stat, index) => (
          // On two columns the fifth stat would sit alone, so it takes the whole row.
          <div key={stat.label} className={index === HOME_STATS.length - 1 ? 'col-span-2 sm:col-span-1' : undefined}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="concept-display text-[clamp(2rem,3.5vw,2.75rem)] leading-none tracking-[-0.02em] text-ink">{stat.value}</dd>
            <dd className="mt-2 text-sm text-ink-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const StepColumn = memo(function StepColumn({ step, last }: { step: HowItWorksStep; last: boolean }) {
  const titleId = `how-step-${step.number}`
  return (
    <li aria-labelledby={titleId} className="flex flex-col">
      {/* The circles sit on one line across the four steps on wide screens. */}
      <div className="flex items-center" aria-hidden="true">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border-2 border-primary bg-surface font-ja text-2xl font-bold text-primary-ink">
          {step.glyph}
        </span>
        {!last && <span className="hidden h-0.5 flex-1 bg-line-strong lg:-mr-6 lg:block" />}
      </div>
      <h3 id={titleId} className="mt-6 font-display text-h3 font-bold text-ink">
        {step.number} · {step.title}
      </h3>
      <p className="mt-2 max-w-prose text-base leading-7 text-ink-muted lg:pr-4">{step.body}</p>
      {/* mt-auto keeps the four links on one line even when a title wraps. */}
      <div className="mt-auto pt-3">
        <ArrowLink to={step.link.to}>{step.link.label}</ArrowLink>
      </div>
    </li>
  )
})

/** A few N5 video courses from the /classes directory. If the list can't load, only the link to it shows. */
function HomeClasses() {
  const filters = useMemo<ClassesFilters>(() => ({ level: HOME_CLASSES.level }), [])
  const { data, isLoading } = useClasses(filters)
  const courses = data?.items.slice(0, HOME_CLASSES.count) ?? []

  const header = (
    <div className="max-w-2xl">
      <p className="concept-eyebrow">{HOME_CLASSES.eyebrow}</p>
      <h2 className="concept-section-title mt-4">{HOME_CLASSES.title}</h2>
      <p className="mt-4 text-base leading-7 text-ink-muted">{HOME_CLASSES.body}</p>
      <ArrowLink to={HOME_CLASSES.link.to} className="mt-2">
        {HOME_CLASSES.link.label}
      </ArrowLink>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-6 pt-20 sm:px-10 lg:pt-24">
      {isLoading && !data ? (
        <>
          {header}
          <div className="mt-6">
            <CourseGridSkeleton count={4} maxCols={4} />
          </div>
        </>
      ) : courses.length > 0 ? (
        <Carousel
          label="video courses"
          header={header}
          items={courses}
          itemKey={(course) => course.slug}
          renderItem={(course) => <CourseCard course={course} className="h-full" />}
        />
      ) : (
        header
      )}
    </div>
  )
}

function ArrowLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`concept-step-link group text-primary-ink ${className}`}>
      <span className="concept-step-link-text">{children}</span>
      <Icon name="arrow_forward" className="text-base transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
    </Link>
  )
}
