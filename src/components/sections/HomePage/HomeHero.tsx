import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
import { useStartLearning } from '@/hooks/useStartLearning'
import { HERO_COPY } from '@/lib/content/home/hero'
import { TryLessonCard } from './TryLessonCard'

/**
 * Homepage hero: one message, one primary CTA, plus the interactive
 * 60-second lesson as the brand visual. Copy lives in `@/lib/content/home/hero`.
 */
export function HomeHero() {
  const { startLearning, prefetch } = useStartLearning()

  return (
    <section
      id="top"
      className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pb-14 pt-16"
    >
      <div className="flex min-w-0 shrink grow basis-[480px] flex-col gap-6">
        <Eyebrow variant="pill" className="!mb-0 self-start">
          {HERO_COPY.eyebrow}
        </Eyebrow>

        <h1 className="text-balance font-headline text-[clamp(2.6rem,5.2vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface">
          {HERO_COPY.titleLead}
          <br />
          <span className="italic text-primary">{HERO_COPY.titleAccent}</span>
        </h1>

        <p className="max-w-[34ch] text-pretty text-lg leading-relaxed text-on-surface-variant md:text-[1.1875rem]">
          {HERO_COPY.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={startLearning}
            {...prefetch}
            className="min-h-11 px-7 py-4 text-[1.0625rem]"
          >
            {HERO_COPY.primaryCta}
          </Button>
          <a
            href={`#${HERO_COPY.secondaryCtaTarget}`}
            className="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-outline-variant bg-surface-container-lowest px-6 py-[0.9375rem] text-[1.0625rem] font-bold text-on-surface transition-colors duration-200 hover:border-primary hover:text-primary"
          >
            {HERO_COPY.secondaryCta}
          </a>
        </div>

        <p className="flex items-center gap-2 text-[0.9375rem] text-on-surface-variant">
          <Icon name="check" className="flex-none text-lg font-bold text-success" />
          <span>{HERO_COPY.note}</span>
        </p>
      </div>

      <TryLessonCard />
    </section>
  )
}
