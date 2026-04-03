const JLPT_LEVELS = [
  { level: 'N5', label: 'Foundation', color: 'bg-tertiary/10 text-tertiary border-tertiary/20' },
  { level: 'N4', label: 'Elementary', color: 'bg-primary/10 text-primary border-primary/20' },
  { level: 'N3', label: 'Intermediate', color: 'bg-secondary/10 text-secondary border-secondary/20' },
  { level: 'N2', label: 'Advanced', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { level: 'N1', label: 'Mastery', color: 'bg-rose-50 text-rose-700 border-rose-200' },
]

export function KanjiHero() {
  return (
    <section className="mb-24 flex flex-col items-center justify-center border-b border-surface-container-high pb-16">
      <div className="max-w-3xl text-center">
        <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-6 block">
          Logographic Script
        </span>
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface tracking-tighter leading-tight mb-8">
          Kanji <span className="text-tertiary">Dictionary</span>
        </h1>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl mx-auto mb-10">
          2,136 jōyō kanji — the officially recognized characters for everyday use. Begin with
          JLPT N5 and work your way to mastery.
        </p>

        {/* JLPT level pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {JLPT_LEVELS.map(({ level, label, color }) => (
            <span
              key={level}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${color}`}
            >
              {level}
              <span className="font-normal normal-case tracking-normal opacity-70">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
