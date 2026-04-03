import { Icon } from '@/components/ui/Icon'

const features = [
  'Personalized Kanji Tracks',
  'JLPT Simulation Exams',
  'Distraction-free Learning',
]

export function ModalSidebar() {
  return (
    <div className="hidden md:flex md:w-5/12 bg-primary p-10 flex-col justify-between text-on-primary relative overflow-hidden shrink-0">
      {/* Subtle pinstripe texture overlay */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.05) 2px,
            rgba(255,255,255,0.05) 4px
          )`,
        }}
      />

      {/* Top: branding + headline */}
      <div className="relative z-10">
        <div className="text-2xl font-headline font-extrabold tracking-tighter mb-12">
          FluentFox
        </div>
        <h2 className="text-3xl font-headline font-bold leading-tight mb-6 italic">
          Begin your journey to fluency.
        </h2>
        <p className="text-on-primary/80 text-sm leading-relaxed">
          Join 50,000+ students mastering Japanese through our immersive, distraction-free
          environment.
        </p>
      </div>

      {/* Bottom: feature list */}
      <div className="relative z-10 flex flex-col gap-4">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <Icon name="check_circle" className="text-sm" filled />
            <span className="text-xs font-medium tracking-wide">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
