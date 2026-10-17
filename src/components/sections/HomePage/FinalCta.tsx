import { Button } from '@/components/ui/Button'
import { useStartLearning } from '@/hooks/useStartLearning'
import { FINAL_CTA_COPY } from '@/lib/content/home/finalCta'
import { JaText } from './JaText'

/**
 * FinalCta — closing brand band on the homepage: one headline, one "Start learning free"
 * button, and a large がんばれ watermark. Copy lives in `src/lib/content/home/finalCta.ts`.
 */
export function FinalCta() {
  const { startLearning, prefetch } = useStartLearning()
  const { title, body, cta, note, watermark } = FINAL_CTA_COPY

  return (
    <section aria-labelledby="final-cta-title" className="relative overflow-hidden bg-primary text-white">
      <span
        lang="ja"
        aria-hidden="true"
        className="font-jp pointer-events-none absolute inset-0 flex select-none items-center justify-center whitespace-nowrap text-[clamp(8rem,22vw,20rem)] font-bold text-white/[0.08]"
      >
        {watermark}
      </span>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center md:py-28">
        <h2
          id="final-cta-title"
          className="font-headline text-display-lg font-extrabold leading-[1.05] tracking-[-0.035em]"
        >
          {title}
        </h2>
        <p className="max-w-xl font-body text-lg leading-relaxed text-white/90">
          <JaText text={body} />
        </p>
        <Button
          type="button"
          variant="white"
          onClick={startLearning}
          {...prefetch}
          className="mt-2 px-8 py-4 font-headline text-lg font-extrabold hover:-translate-y-0.5 hover:shadow-elevation-3"
        >
          {cta}
        </Button>
        <p className="font-body text-sm text-white/90">{note}</p>
      </div>
    </section>
  )
}
