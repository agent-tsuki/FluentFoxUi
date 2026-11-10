import { FadeIn } from '@/components/ui/FadeIn'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { FEEDBACK_MAILTO, FOUNDER_COPY } from '@/lib/content/home/founder'

/**
 * FounderSection — homepage "Who's behind this" band: a short first-person note from the
 * maker, a feedback mailto link, and a "Recently shipped" changelog panel.
 * All copy lives in `src/lib/content/home/founder.ts`.
 */
export function FounderSection() {
  const { eyebrow, title, name, intro, feedbackLabel, shippedHeading, shipped } = FOUNDER_COPY

  return (
    <section
      aria-labelledby="founder-title"
      className="border-y border-line bg-surface-raised"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-10 px-6 py-20 md:py-24">
        <FadeIn className="flex min-w-0 flex-[1_1_520px] flex-col gap-5">
          <Eyebrow className="!mb-0">{eyebrow}</Eyebrow>
          <h2
            id="founder-title"
            className="font-display text-display-md font-extrabold leading-[1.08] tracking-[-0.035em] text-ink"
          >
            {title}
          </h2>
          <div className="flex items-start gap-4">
            {/* Initials avatar — the name is in the text beside it, so it is decorative. */}
            <span
              aria-hidden="true"
              className="flex h-[4.5rem] w-[4.5rem] flex-none items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-extrabold text-primary"
            >
              {name.charAt(0)}
            </span>
            <p className="max-w-prose font-sans text-lg leading-relaxed text-ink">
              Hi, I&apos;m {name}. {intro}
            </p>
          </div>
          <a
            href={FEEDBACK_MAILTO}
            className="self-start rounded-md py-2.5 font-display text-base font-bold text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {feedbackLabel}
          </a>
        </FadeIn>

        <FadeIn
          delay={120}
          className="flex min-w-0 flex-[1_1_360px] flex-col gap-3.5 rounded-xl bg-surface-sunken p-6"
        >
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
            {shippedHeading}
          </h3>
          <ul className="flex flex-col gap-3">
            {shipped.map((item) => (
              <li key={item.date} className="flex gap-3.5 font-sans text-base leading-normal text-ink">
                <span className="min-w-16 flex-none font-extrabold text-primary">{item.date}</span>
                <span>{item.what}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  )
}
