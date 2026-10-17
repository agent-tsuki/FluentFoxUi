import { FadeIn } from '@/components/ui/FadeIn'
import { FAQ_COPY } from '@/lib/content/home/faq'

/**
 * FaqSection — homepage "Questions before you start". Native <details>/<summary> so it is
 * keyboard- and screen-reader-accessible with no JS; the "+" rotates into "×" when open.
 * All copy lives in `src/lib/content/home/faq.ts`.
 */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto flex max-w-4xl flex-col gap-7 px-6 py-20 md:py-24"
    >
      <FadeIn>
        <h2
          id="faq-title"
          className="text-center font-headline text-display-md font-extrabold leading-[1.08] tracking-[-0.035em] text-on-surface"
        >
          {FAQ_COPY.title}
        </h2>
      </FadeIn>

      <FadeIn delay={100} className="flex flex-col gap-3">
        {FAQ_COPY.items.map((item) => (
          <details
            key={item.id}
            className="group rounded-2xl border border-outline-variant bg-surface-container-lowest px-6"
          >
            <summary className="-mx-6 flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-6 py-3 font-headline text-lg font-bold text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="flex-none text-2xl font-normal leading-none text-primary transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mb-5 max-w-prose font-body text-base leading-relaxed text-on-surface-variant">
              {item.answer}
            </p>
          </details>
        ))}
      </FadeIn>
    </section>
  )
}
