const legend = [
  { color: 'bg-tertiary', label: 'N5 Foundation' },
  { color: 'bg-primary', label: 'N4 Elementary' },
  { color: 'bg-secondary', label: 'N3 Intermediate' },
  { color: 'bg-amber-500', label: 'N2 Advanced' },
  { color: 'bg-rose-600', label: 'N1 Mastery' },
]

export function KanjiLearningGuide() {
  return (
    <section className="mt-16 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
      {/* Guide card */}
      <div className="bg-surface-container-lowest p-10 rounded-2xl border border-surface-container-high shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-center">
        <h3 className="font-headline text-lg font-bold uppercase tracking-[0.2em] text-primary mb-6">
          How to Study
        </h3>
        <p className="text-on-surface-variant leading-relaxed mb-6">
          Each card shows the on'yomi (音読み) Chinese-derived reading and kun'yomi (訓読み)
          native Japanese reading. Start with N5, learn the meaning and both readings, then
          practise writing stroke-by-stroke.
        </p>
        <div className="flex flex-wrap gap-3">
          {legend.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface">
              <span className={`w-3 h-3 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Stroke order card */}
      <div className="relative overflow-hidden rounded-2xl group cursor-pointer min-h-[200px]">
        <div className="absolute inset-0 bg-on-background/50 z-10 transition-colors group-hover:bg-on-background/40" />
        <div className="w-full h-full bg-surface-container-highest" />
        {/* Decorative kanji watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
          <span className="japanese-text text-[10rem] font-bold text-white">字</span>
        </div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-white font-headline font-bold text-lg tracking-widest uppercase border-b-2 border-white/50 pb-2 mb-4">
            Stroke Order Mastery
          </span>
          <p className="text-white/80 text-sm max-w-xs">
            Animated stroke guides for all 2,136 jōyō kanji. Coming soon.
          </p>
        </div>
      </div>
    </section>
  )
}
