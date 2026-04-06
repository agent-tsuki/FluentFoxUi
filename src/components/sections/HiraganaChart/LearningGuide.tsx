export function LearningGuide() {
  return (
    <section className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      {/* Guide card */}
      <div className="bg-surface-container-lowest p-10 rounded-2xl border border-surface-container-high shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-center">
        <h3 className="font-headline text-lg font-bold uppercase tracking-[0.2em] text-primary mb-6">
          Learning Guide
        </h3>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          Click any character to hear the native pronunciation. Master the base 46 before moving
          to Dakuten (voiced sounds) and Yōon (combination sounds).
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface">
            <span className="w-3 h-3 bg-primary rounded-full" />
            Basic
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface">
            <span className="w-3 h-3 bg-tertiary rounded-full" />
            Voiced
          </div>
        </div>
      </div>

      {/* Stroke order card */}
      <div className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-video md:aspect-auto min-h-[200px]">
        <div className="absolute inset-0 bg-on-background/50 z-10 transition-colors group-hover:bg-on-background/40" />
        <div className="w-full h-full bg-surface-container-highest" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-white font-headline font-bold text-lg tracking-widest uppercase border-b-2 border-white/50 pb-2 mb-4">
            Stroke Order Mastery
          </span>
          <p className="text-white/80 text-sm max-w-xs">
            Interactive visual guides for every single character.
          </p>
        </div>
      </div>
    </section>
  )
}
