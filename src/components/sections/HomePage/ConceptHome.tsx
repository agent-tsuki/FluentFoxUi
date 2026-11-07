import { useStartLearning } from '@/hooks/useStartLearning'
import { useUI } from '@/context/UIContext'
import { Icon } from '@/components/ui/Icon'
import { FallingPetals } from './FallingPetals'
import { asset } from '@/lib/assets'
import { HIGH_FETCH_PRIORITY } from '@/lib/fetchPriority'
import { HowItWorks } from './HowItWorks'

/**
 * A concept-led home page: the hero, then "How FoxSensei works", which explains
 * the real course path with small local demos (they never touch learner progress).
 */
export function ConceptHome() {
  const { startLearning, prefetch } = useStartLearning()
  const { darkMode } = useUI()

  return (
    <main className="concept-home overflow-x-clip bg-home-canvas text-home-ink">
      <section id="top" className="relative isolate h-[100svh] min-h-[42rem] overflow-hidden bg-home-hero">
        <HeroImage scene={darkMode ? 'changes' : 'journey'} />
        <div className="concept-hero-wash absolute inset-0" />
        <FallingPetals />

        <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-6 pb-14 pt-nav sm:px-10 lg:px-[6%]">
          <div className="max-w-[46rem] pb-10 pt-6">
            <p className="concept-eyebrow w-fit rounded-full border border-home-line-strong bg-home-tile/40 px-4 py-2 backdrop-blur-sm">A little curiosity goes a long way</p>
            <h1 className="concept-display mt-8 text-[clamp(2.75rem,5vw,5rem)] leading-[1.06] tracking-[-.03em] text-home-ink">
              <span className="block">A little Japanese.</span>
              <span className="block">
                A whole <em className="not-italic text-home-accent">new world.</em>
              </span>
            </h1>
            <p className="mt-8 max-w-[31rem] text-base leading-7 text-home-muted sm:text-lg sm:leading-8">
              From your first あ to the stories you’ve always wanted to understand. Your Japanese journey starts with one small discovery.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <button
                type="button"
                onClick={startLearning}
                {...prefetch}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-home-accent px-7 py-3 text-sm font-bold shadow-elevation-2 text-home-on-accent transition duration-200 hover:-translate-y-0.5 hover:bg-home-accent-hover focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-home-accent"
              >
                Find my starting point
                <Icon name="arrow_forward" className="text-lg transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
              </button>
              <a className="concept-text-link group" href="#journey">
                <span className="concept-text-link-text">See how it works</span>
                <Icon name="south" className="text-base transition-transform duration-200 motion-safe:group-hover:translate-y-0.5" />
              </a>
            </div>
            <p className="mt-10 flex items-center gap-3 text-xs tracking-wide text-home-subtle">
              <span className="h-px w-8 bg-home-line-strong" aria-hidden="true" />
              At your pace. On your own path.
            </p>
          </div>
        </div>

      </section>


      <HowItWorks />
    </main>
  )
}


/**
 * The hero photo, sized to the screen: portrait screens get a centre crop
 * (they would only show that slice of the wide photo anyway), wider screens
 * pick 960 / 1280 / full width. It is the first thing a visitor sees, so it
 * loads eagerly at high priority.
 */
function HeroImage({ scene }: { scene: 'journey' | 'changes' }) {
  const src = (variant: string) => asset(`/images/home/${scene}${variant}.webp`)
  return (
    <picture>
      <source media="(max-aspect-ratio: 1/1)" srcSet={src('-portrait')} type="image/webp" />
      <source srcSet={`${src('-960')} 960w, ${src('-1280')} 1280w, ${src('')} 1672w`} sizes="100vw" type="image/webp" />
      <img
        src={src('-1280')}
        alt=""
        width={1672}
        height={941}
        {...HIGH_FETCH_PRIORITY}
        decoding="async"
        className="absolute inset-0 size-full scale-[1.03] object-cover object-[center_54%] motion-safe:animate-[concept-drift_25s_ease-in-out_infinite_alternate]"
      />
    </picture>
  )
}
