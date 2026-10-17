import { Eyebrow } from '@/components/ui/SectionHeader'
import { FadeIn } from '@/components/ui/FadeIn'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { WHY_SECTION as COPY, WHY_POINTS, type WhyTone } from '@/lib/content/home/why'

const TILE_TONE: Record<WhyTone, string> = {
  primary: 'bg-primary/10 text-primary',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
}

/**
 * WhyItWorks — home-page section (id="why") with the three learning-science
 * principles behind FoxSensei. Copy lives in `@/lib/content/home/why`.
 */
export function WhyItWorks() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="scroll-mt-nav border-y border-outline-variant/60 bg-surface-container-lowest"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 md:py-[5.5rem]">
        <FadeIn className="flex max-w-[720px] flex-col gap-3.5">
          <Eyebrow className="!mb-0">{COPY.eyebrow}</Eyebrow>
          <h2
            id="why-title"
            className="font-headline text-display-md font-extrabold leading-[1.08] tracking-[-0.035em] text-on-surface"
          >
            {COPY.title}
          </h2>
        </FadeIn>

        <ul className="grid gap-8 md:grid-cols-3 md:gap-5">
          {WHY_POINTS.map((point, i) => (
            <li key={point.id}>
              <FadeIn delay={i * 80} className="flex flex-col gap-3">
                <span
                  aria-hidden="true"
                  className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', TILE_TONE[point.tone])}
                >
                  <Icon name={point.icon} className="text-2xl" />
                </span>
                <h3 className="font-headline text-xl font-extrabold text-on-surface">{point.title}</h3>
                <p className="max-w-prose text-base leading-relaxed text-on-surface-variant">{point.body}</p>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
