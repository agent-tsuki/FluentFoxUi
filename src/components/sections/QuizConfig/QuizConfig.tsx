import { useEffect, useMemo, useState } from 'react'
import type { QuizCategory, QuizConfigData, QuizFilterMethod, QuizJlptLevel } from '@/types'
import { quizService } from '@/api/services/quizService'
import { Icon } from '@/components/ui/Icon'
import { KanjiModal } from './KanjiModal'

interface QuizConfigProps {
  onStart: (category: QuizCategory, level: QuizJlptLevel) => void
}

export function QuizConfig({ onStart }: QuizConfigProps) {
  const [data, setData] = useState<QuizConfigData | null>(null)
  const [level, setLevel] = useState<QuizJlptLevel>('n5')
  const [category, setCategory] = useState<QuizCategory>('kanji')
  const [filterMethod, setFilterMethod] = useState<QuizFilterMethod>('custom')
  const [selectedKanji, setSelectedKanji] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    quizService.getConfig().then((cfg) => {
      setData(cfg)
      setSelectedKanji(
        new Set(cfg.selectableKanji.filter((k) => k.selected).map((k) => k.character))
      )
    })
    window.scrollTo(0, 0)
  }, [])

  const selectedLevelLabel = useMemo(
    () => data?.jlptLevels.find((l) => l.value === level)?.label ?? '',
    [data, level]
  )

  const moduleLabel = useMemo(() => {
    const cat = data?.categories.find((c) => c.value === category)?.label ?? ''
    return category === 'kanji' ? `${cat} (${filterMethod === 'custom' ? 'Custom' : 'Chapter'})` : cat
  }, [data, category, filterMethod])

  const itemsLabel = useMemo(() => {
    if (category === 'kanji') return `${selectedKanji.size} Radical Characters`
    return 'All Items'
  }, [category, selectedKanji])

  const estTimeLabel = useMemo(() => {
    const count = category === 'kanji' ? selectedKanji.size : 20
    const mins = Math.max(2, Math.round(count * 0.67))
    return `${String(mins).padStart(2, '0')}:00 Minutes`
  }, [category, selectedKanji])

  const toggleKanji = (char: string) => {
    setSelectedKanji((prev) => {
      const next = new Set(prev)
      next.has(char) ? next.delete(char) : next.add(char)
      return next
    })
  }

  const handleStartQuiz = () => {
    quizService.startQuiz({ level, category, selectedKanji: Array.from(selectedKanji) })
    onStart(category, level)
  }

  if (!data) return null

  const summaryRows = [
    { label: 'Level', value: selectedLevelLabel, highlight: true },
    { label: 'Module', value: moduleLabel, highlight: false },
    { label: 'Items', value: itemsLabel, highlight: false },
    { label: 'Est. Time', value: estTimeLabel, highlight: false },
  ]

  return (
    <>
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="mb-16">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4 block font-label">
            {data.pageLabel}
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-on-surface font-headline">
            {data.heading}
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl font-body">{data.subheading}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Left: Configuration ──────────────────────────────── */}
          <div className="lg:col-span-8 space-y-12">
            {/* JLPT Level + Category Pills */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* JLPT select */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2 font-label">
                    Target Proficiency
                  </label>
                  <div className="relative inline-block w-full md:w-64">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as QuizJlptLevel)}
                      className="w-full appearance-none bg-surface-container-lowest border-none py-4 px-6 rounded-lg text-lg font-bold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer outline-none"
                    >
                      {data.jlptLevels.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                      <Icon name="expand_more" />
                    </div>
                  </div>
                </div>

                {/* Category radio pills */}
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2 font-label">
                    Category Selection
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {data.categories.map((cat) => (
                      <label key={cat.value} className="cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={category === cat.value}
                          onChange={() => setCategory(cat.value)}
                          className="hidden"
                        />
                        <span
                          className={`px-5 py-3 rounded-full font-semibold transition-all block group-hover:scale-105 font-label ${
                            category === cat.value
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-highest text-on-surface-variant'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Kanji Specifics — visible only when kanji is selected */}
            {category === 'kanji' && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-outline-variant" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-on-surface-variant font-label">
                    Kanji Specifics
                  </h2>
                  <div className="h-px flex-1 bg-outline-variant" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Filter method select */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
                      Filter Methodology
                    </label>
                    <div className="relative">
                      <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value as QuizFilterMethod)}
                        className="w-full appearance-none bg-surface-container-low border-none py-4 px-6 rounded-lg text-base font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer outline-none"
                      >
                        <option value="chapter">By Chapter</option>
                        <option value="custom">Custom Selection</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                        <Icon name="unfold_more" />
                      </div>
                    </div>
                  </div>

                  {/* Open kanji selector modal */}
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant font-bold hover:border-primary hover:text-primary hover:bg-surface-container-lowest transition-all font-label"
                    >
                      <Icon name="edit_note" />
                      Select Kanji ({selectedKanji.size} Active)
                    </button>
                  </div>
                </div>

                {/* Kanji Preview Bento */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_20px_40px_rgba(25,28,29,0.04)] grid grid-cols-2 md:grid-cols-4 gap-6">
                  {data.kanjiPreview.map((k) => (
                    <div key={k.character} className="text-center p-4 bg-surface-container-low rounded-xl">
                      <div className="text-3xl font-bold mb-1 font-headline">{k.character}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-tighter font-label">
                        {k.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Grammar & Mechanics */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-outline-variant" />
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-on-surface-variant font-label">
                  Grammar &amp; Mechanics
                </h2>
                <div className="h-px flex-1 bg-outline-variant" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {data.grammarCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-6 bg-surface-container-lowest rounded-xl border-b-4 border-surface-container hover:border-primary/20 transition-all cursor-pointer"
                  >
                    <div className="text-primary mb-3">
                      <Icon name={card.icon} />
                    </div>
                    <h3 className="font-bold text-on-surface mb-1 font-headline">{card.title}</h3>
                    <p className="text-xs text-on-surface-variant font-body">{card.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: Session Summary Sidebar ──────────────────── */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {/* Summary card */}
              <div className="bg-on-surface text-inverse-on-surface p-10 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6 font-headline">Session Summary</h2>
                  <ul className="space-y-4 mb-10">
                    {summaryRows.map((row) => (
                      <li
                        key={row.label}
                        className="flex justify-between items-center text-sm border-b border-white/10 pb-3"
                      >
                        <span className="text-white/60 font-label">{row.label}</span>
                        <span
                          className={`font-bold font-label ${row.highlight ? 'text-primary-fixed-dim' : ''}`}
                        >
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleStartQuiz}
                    className="w-full bg-primary-container hover:bg-primary text-on-primary py-5 rounded-xl font-bold text-lg tracking-wide shadow-2xl transition-all active:scale-95 font-label"
                  >
                    Start Quiz
                  </button>
                </div>
                {/* Decorative ring */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border-[20px] border-white/5 pointer-events-none" />
              </div>

              {/* Pro Tip */}
              <div className="bg-surface-container p-8 rounded-2xl">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-label">
                  Pro Tip
                </h4>
                <p className="text-sm text-on-surface-variant italic leading-relaxed font-body">
                  {data.proTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Kanji Selection Modal */}
      {data && (
        <KanjiModal
          open={modalOpen}
          kanji={data.selectableKanji}
          selected={selectedKanji}
          onToggle={toggleKanji}
          onConfirm={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
