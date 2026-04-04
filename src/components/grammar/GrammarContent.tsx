import { Icon } from '@/components/ui/Icon'
import { Link } from 'react-router-dom'
import { GrammarChapter, JapaneseSegment } from '@/types/grammar'
import { InteractiveWord } from '@/components/ui/InteractiveWord'
import { useState, useEffect } from 'react'

interface GrammarContentProps {
  chapter: GrammarChapter
  showAll?: boolean
  revealMode: boolean
  onToggleReveal: () => void
  prevChapterId?: number
  nextChapterId?: number
  isCompleted: boolean
  onMarkComplete: () => void
}

// Detect concept type from title → returns a set of classes for left-accent + badge
function getConceptStyle(title: string = '') {
  const t = title.toLowerCase()
  if (t.includes('negation') || t.includes('negative'))
    return { accent: 'bg-error', badge: 'bg-error/10 text-error', rule: 'border-error/40 bg-error/5' }
  if (t.includes('question') || t.includes('asking'))
    return { accent: 'bg-secondary', badge: 'bg-secondary/10 text-secondary', rule: 'border-secondary/40 bg-secondary/5' }
  if (t.includes('possession') || t.includes('belonging') || t.includes('demonstrative') || t.includes('confirming'))
    return { accent: 'bg-tertiary', badge: 'bg-tertiary/10 text-tertiary', rule: 'border-tertiary/40 bg-tertiary/5' }
  if (t.includes('inclusive') || t.includes('also') || t.includes('alternative'))
    return { accent: 'bg-fox-light', badge: 'bg-fox-light/10 text-fox-dark', rule: 'border-fox-light/40 bg-fox-light/5' }
  return { accent: 'bg-primary', badge: 'bg-primary-container text-on-primary-container', rule: 'border-primary/30 bg-primary/5' }
}

export function GrammarContent({
  chapter,
  showAll = false,
  revealMode,
  onToggleReveal,
  prevChapterId,
  nextChapterId,
  isCompleted,
  onMarkComplete,
}: GrammarContentProps) {
  const masteryKey = `ff-vocab-${chapter.level}-${chapter.id}`
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set())
  const [hiddenTranslations, setHiddenTranslations] = useState<Set<string>>(new Set())

  // Re-load mastery from localStorage when chapter changes
  useEffect(() => {
    try {
      const s = localStorage.getItem(masteryKey)
      setMasteredWords(s ? new Set(JSON.parse(s)) : new Set())
    } catch {
      setMasteredWords(new Set())
    }
    setHiddenTranslations(new Set())
  }, [masteryKey])

  const toggleMastered = (index: number) => {
    setMasteredWords(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      localStorage.setItem(masteryKey, JSON.stringify([...next]))
      return next
    })
  }

  const toggleTranslation = (key: string) => {
    setHiddenTranslations(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const renderSegments = (segments: JapaneseSegment[]) => {
    return segments.map((seg, i) => {
      if (typeof seg === 'string') {
        return <span key={i} dangerouslySetInnerHTML={{ __html: seg }} />
      }
      return (
        <InteractiveWord
          key={i}
          kanji={seg.kanji}
          reading={seg.reading}
          meaning={seg.meaning}
          showAll={showAll}
        />
      )
    })
  }

  const masteredCount = masteredWords.size
  const totalVocab = chapter.sidebar.vocab.length

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Top bar: breadcrumb + reveal toggle */}
      <div className="flex items-center justify-between mb-8 mt-2 gap-4 flex-wrap">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
          <span>{chapter.level.toUpperCase()} Course</span>
          <Icon name="chevron_right" className="text-xs" />
          <span>Chapter {chapter.id}</span>
          <Icon name="chevron_right" className="text-xs" />
          <span className="text-primary font-bold">Grammar Notes</span>
        </nav>

        <button
          onClick={onToggleReveal}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
            revealMode
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface text-primary border-primary hover:bg-primary/5'
          }`}
        >
          <Icon name={revealMode ? 'visibility_off' : 'visibility'} className="text-base" />
          {revealMode ? 'Hide Hints' : 'Show All Hints'}
        </button>
      </div>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold bg-surface-container-high px-3 py-1 rounded-full">
            Chapter {chapter.id}
          </span>
          {isCompleted && (
            <span className="text-xs uppercase tracking-widest text-primary font-bold bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Icon name="check_circle" className="text-sm" /> Completed
            </span>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">
          {chapter.title}
        </h1>
        <p className="text-lg text-on-surface-variant font-medium max-w-2xl leading-relaxed">
          {chapter.description}
        </p>

        {/* Concept overview pills */}
        {chapter.concepts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {chapter.concepts.map((c, i) => (
              <span
                key={c.id}
                className="text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-medium"
              >
                {i + 1}. {c.title}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-8">

        {/* Concepts */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {chapter.concepts.map((concept, conceptIndex) => {
            const style = getConceptStyle(concept.title)
            const totalConcepts = chapter.concepts.length

            return (
              <section
                key={concept.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Concept header bar */}
                <div className="flex items-center gap-0 border-b border-outline-variant/15">
                  {/* Color accent stripe */}
                  <div className={`w-1.5 self-stretch flex-shrink-0 ${style.accent}`} />
                  <div className="flex items-center justify-between flex-1 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
                        {concept.id}
                      </span>
                      <h2 className="text-lg font-bold font-headline text-on-surface">
                        {concept.title}
                      </h2>
                    </div>
                    <span className="text-[10px] text-on-surface-variant/50 font-medium flex-shrink-0">
                      {conceptIndex + 1} / {totalConcepts}
                    </span>
                  </div>
                </div>

                <div className="px-7 py-6 space-y-4">
                  {/* Description */}
                  <div
                    className="text-on-surface-variant leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: concept.description }}
                  />

                  {/* Key Rule */}
                  {concept.keyRule && (
                    <div className={`p-4 rounded-xl border-l-4 ${style.rule}`}>
                      <span className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-on-surface-variant">
                        Key Rule
                      </span>
                      <p
                        className="text-on-surface font-medium italic text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: concept.keyRule }}
                      />
                    </div>
                  )}

                  {/* Note */}
                  {concept.note && (
                    <div className="bg-surface-container-low p-4 rounded-xl flex gap-3 items-start border border-outline-variant/20">
                      <Icon name="info" className="text-primary text-lg mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        <strong className="text-on-surface">Note: </strong>
                        <span dangerouslySetInnerHTML={{ __html: concept.note }} />
                      </p>
                    </div>
                  )}

                  {/* Examples */}
                  {concept.examples && concept.examples.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
                        <Icon name="lightbulb" className="text-primary text-base" />
                        Example Sentences
                      </h3>
                      <div className="space-y-3">
                        {concept.examples.map((ex, i) => {
                          const exKey = `${concept.id}-${i}`
                          const isHidden = hiddenTranslations.has(exKey)
                          return (
                            <div
                              key={i}
                              className="group rounded-xl border border-outline-variant/15 bg-surface-container-low/50 overflow-hidden"
                            >
                              {/* Japanese sentence */}
                              <div className="px-5 py-4 text-2xl font-medium flex flex-wrap items-center gap-y-1">
                                {renderSegments(ex.japanese)}
                              </div>

                              {/* English translation + toggle */}
                              <div className="flex items-center justify-between px-5 pb-4 gap-3">
                                <p className={`text-sm text-on-surface-variant italic border-l-2 border-outline-variant/30 pl-3 transition-all duration-200 ${isHidden ? 'blur-sm select-none' : ''}`}>
                                  {ex.english}
                                </p>
                                <button
                                  onClick={() => toggleTranslation(exKey)}
                                  className="flex-shrink-0 text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/50 hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  <Icon name={isHidden ? 'visibility' : 'visibility_off'} className="text-sm" />
                                  {isHidden ? 'Show' : 'Hide'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )
          })}

          {/* Cultural Insight (inline after concepts on mobile, full width) */}
          {chapter.sidebar.culturalInsight && (
            <section className="lg:hidden bg-primary/5 p-6 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="campaign" className="text-primary" />
                <h3 className="text-xs uppercase tracking-widest text-primary font-bold">
                  Cultural Insight
                </h3>
              </div>
              <h4 className="font-bold text-on-surface mb-2 font-headline">
                {chapter.sidebar.culturalInsight.title}
              </h4>
              <div
                className="text-sm text-on-surface-variant leading-relaxed"
                dangerouslySetInnerHTML={{ __html: chapter.sidebar.culturalInsight.content }}
              />
            </section>
          )}
        </div>

        {/* Right sidebar: Vocabulary + Cultural Insight */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">

          {/* Vocab card */}
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 sticky top-24 max-h-[calc(100vh-130px)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-outline-variant/15 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon name="menu_book" className="text-primary text-base" />
                  <h3 className="text-xs uppercase tracking-widest text-primary font-bold">
                    Chapter Vocabulary
                  </h3>
                </div>
                {totalVocab > 0 && (
                  <span className="text-[10px] font-bold text-on-surface-variant/60">
                    {masteredCount}/{totalVocab}
                  </span>
                )}
              </div>

              {/* Vocab mastery mini-bar */}
              {totalVocab > 0 && (
                <div className="mt-2.5 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((masteredCount / totalVocab) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Vocab list */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {chapter.sidebar.vocab.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-on-surface-variant/50">
                  No vocabulary for this chapter.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/15">
                  {chapter.sidebar.vocab.map((v, i) => {
                    const isMastered = masteredWords.has(i)
                    return (
                      <button
                        key={i}
                        onClick={() => toggleMastered(i)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 group ${
                          isMastered
                            ? 'opacity-40 bg-surface-container-lowest'
                            : 'hover:bg-primary/5'
                        }`}
                      >
                        {/* Mastery dot */}
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full transition-colors ${
                          isMastered ? 'bg-primary' : 'bg-outline-variant/40 group-hover:bg-primary/40'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-lg font-medium text-on-surface leading-tight">
                              {v.kanji}
                            </span>
                            <span className="text-xs font-bold text-primary">{v.reading}</span>
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5 leading-tight">
                            {v.meaning}
                          </div>
                        </div>
                        {isMastered && (
                          <Icon name="check" className="text-primary text-sm flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {totalVocab > 0 && (
              <div className="px-5 py-3 border-t border-outline-variant/15 flex-shrink-0">
                <p className="text-[10px] text-on-surface-variant/50 italic text-center">
                  Tap a word to mark it as mastered
                </p>
              </div>
            )}
          </div>

          {/* Cultural Insight (desktop only) */}
          {chapter.sidebar.culturalInsight && (
            <div className="hidden lg:block bg-primary/5 p-6 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="campaign" className="text-primary" />
                <h3 className="text-xs uppercase tracking-widest text-primary font-bold">
                  Cultural Insight
                </h3>
              </div>
              <h4 className="font-bold text-on-surface mb-2 font-headline">
                {chapter.sidebar.culturalInsight.title}
              </h4>
              <div
                className="text-sm text-on-surface-variant leading-relaxed"
                dangerouslySetInnerHTML={{ __html: chapter.sidebar.culturalInsight.content }}
              />
            </div>
          )}
        </aside>
      </div>

      {/* Chapter completion + pagination */}
      <div className="mt-16 pt-10 border-t border-outline-variant/20 space-y-8">

        {/* Mark complete CTA */}
        {!isCompleted ? (
          <div className="flex flex-col items-center gap-3 py-6 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <Icon name="check_circle" className="text-4xl text-on-surface-variant/30" />
            <p className="text-sm font-medium text-on-surface-variant">Done with this chapter?</p>
            <button
              onClick={onMarkComplete}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-full text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-md"
            >
              <Icon name="check" className="text-base" />
              Mark Chapter {chapter.id} as Complete
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-5 bg-primary/5 rounded-2xl border border-primary/20">
            <Icon name="celebration" className="text-3xl text-primary" />
            <p className="text-sm font-bold text-primary">Chapter {chapter.id} complete!</p>
            <p className="text-xs text-on-surface-variant">Move on to the next chapter when you're ready.</p>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className="flex items-center">
          {prevChapterId !== undefined ? (
            <Link
              to={`/grammar/${chapter.level}/${prevChapterId}`}
              className="flex items-center gap-4 group mr-auto"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
                <Icon name="arrow_back" className="text-on-surface-variant group-hover:text-primary" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant">Previous</span>
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Chapter {prevChapterId}
                </span>
              </div>
            </Link>
          ) : (
            <div className="mr-auto" />
          )}

          {nextChapterId !== undefined ? (
            <Link
              to={`/grammar/${chapter.level}/${nextChapterId}`}
              className="flex items-center gap-4 text-right group ml-auto"
            >
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant">Next</span>
                <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                  Chapter {nextChapterId}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
                <Icon name="arrow_forward" className="text-on-surface-variant group-hover:text-primary" />
              </div>
            </Link>
          ) : (
            <div className="ml-auto" />
          )}
        </div>
      </div>
    </div>
  )
}
