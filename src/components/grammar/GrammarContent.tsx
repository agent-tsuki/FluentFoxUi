import { Icon } from '@/components/ui/Icon'
import { Link } from 'react-router-dom'
import { GrammarChapter, JapaneseSegment } from '@/types/grammar'
import { InteractiveWord } from '@/components/ui/InteractiveWord'
import { useState } from 'react'

interface GrammarContentProps {
  chapter: GrammarChapter;
  showAll?: boolean;
  prevChapterId?: number;
  nextChapterId?: number;
}

export function GrammarContent({ chapter, showAll = false, prevChapterId, nextChapterId }: GrammarContentProps) {
  // Local state for mastered words (the "Vanish" effect)
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set());

  const toggleMastered = (index: number) => {
    setMasteredWords(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const renderSegments = (segments: JapaneseSegment[]) => {
    return segments.map((seg, i) => {
      if (typeof seg === 'string') {
        return <span key={i} dangerouslySetInnerHTML={{ __html: seg }}></span>;
      }
      return (
        <InteractiveWord
          key={i}
          kanji={seg.kanji}
          reading={seg.reading}
          meaning={seg.meaning}
          showAll={showAll}
        />
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-8 mt-4">
        <span>{chapter.level.toUpperCase()} Course</span>
        <Icon name="chevron_right" className="text-xs" />
        <span>Chapter {chapter.id}: {chapter.title}</span>
        <Icon name="chevron_right" className="text-xs" />
        <span className="text-primary font-bold">Grammar Notes</span>
      </nav>

      {/* Hero Title Section */}
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline">{chapter.title}</h1>
        <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl leading-relaxed">
          {chapter.description}
        </p>
      </header>

      {/* Bento Grid Layout for Grammar Content */}
      <div className="grid grid-cols-12 gap-8">

        {/* Main Explanation Card */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {chapter.concepts.map((concept) => (
            <section key={concept.id} className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl shadow-xl border border-outline-variant/20 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">{concept.id}</span>
                <h2 className="text-2xl font-bold font-headline">{concept.title}</h2>
              </div>

              <div className="prose prose-zinc max-w-none text-on-surface-variant leading-loose space-y-4 mb-8">
                <p dangerouslySetInnerHTML={{ __html: concept.description }}></p>
                {concept.keyRule && (
                  <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary mt-4">
                    <span className="block text-xs uppercase tracking-widest text-primary mb-2 font-bold">Key Rule</span>
                    <p className="text-on-surface font-medium italic" dangerouslySetInnerHTML={{ __html: concept.keyRule }}></p>
                  </div>
                )}
                {concept.note && (
                  <div className="bg-surface-container-low p-4 rounded-lg flex gap-3 items-start border border-outline-variant/30">
                    <Icon name="info" className="text-primary text-lg mt-0.5" />
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      <strong>Note:</strong> <span dangerouslySetInnerHTML={{ __html: concept.note }}></span>
                    </p>
                  </div>
                )}
              </div>

              {concept.examples && concept.examples.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-headline">
                    <Icon name="lightbulb" className="text-primary" />
                    Example Sentences
                  </h3>
                  <div className="space-y-6">
                    {concept.examples.map((ex, i) => (
                      <div key={i} className="group p-6 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/10">
                        <div className="text-2xl mb-2 font-medium flex flex-wrap items-center">
                          {renderSegments(ex.japanese)}
                        </div>
                        <p className="text-on-surface-variant font-medium italic border-l-2 border-outline-variant/30 pl-4 mt-3">
                          {ex.english}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Sidebar Content: Vocab & Tips */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          {/* Chapter Vocabulary Table */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
            <div className="flex items-center gap-2 mb-6 flex-shrink-0">
              <Icon name="list" className="text-primary" />
              <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Chapter Vocabulary</h3>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 sticky top-0 bg-surface-container-low z-10">
                    <th className="py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Kanji</th>
                    <th className="py-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Reading</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {chapter.sidebar.vocab.map((v, i) => {
                    const isMastered = masteredWords.has(i);

                    return (
                      <tr
                        key={i}
                        onClick={() => toggleMastered(i)}
                        className={`group cursor-pointer transition-all duration-300 ${isMastered ? 'opacity-40' : 'hover:bg-primary/5'}`}
                      >
                        <td className="py-4 font-medium text-lg text-on-surface">{v.kanji}</td>
                        <td className="py-4">
                          <div>
                            <div className="text-xs font-bold text-primary mb-0.5">{v.reading}</div>
                            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium opacity-70 mb-1">{v.romaji}</div>
                            <div className="text-xs text-on-surface font-medium leading-tight">{v.meaning}</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-[10px] text-on-surface-variant/60 italic text-center flex-shrink-0 border-t border-outline-variant/20 pt-4">
              Click a row to mark as mastered.
            </p>
          </div>

          {/* Cultural Insight Card */}
          {chapter.sidebar.culturalInsight && (
            <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="campaign" className="text-primary" />
                <h3 className="text-xs uppercase tracking-widest text-primary font-bold">Cultural Insight</h3>
              </div>
              <h4 className="font-bold text-on-surface mb-3 text-lg font-headline">{chapter.sidebar.culturalInsight.title}</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: chapter.sidebar.culturalInsight.content }}></p>
            </div>
          )}
        </aside>
      </div>

      {/* Footer-like pagination */}
      <div className="mt-24 pt-12 border-t border-outline-variant/20 flex items-center">
        {prevChapterId !== undefined ? (
          <Link to={`/grammar/${chapter.level}/${prevChapterId}`} className="flex items-center gap-4 group mr-auto">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
              <Icon name="arrow_back" className="text-on-surface-variant group-hover:text-primary" />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant">Previous</span>
              <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Chapter {prevChapterId}</span>
            </div>
          </Link>
        ) : (
          <div className="mr-auto"></div>
        )}

        {nextChapterId !== undefined ? (
          <Link to={`/grammar/${chapter.level}/${nextChapterId}`} className="flex items-center gap-4 text-right group ml-auto">
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant">Next</span>
              <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Chapter {nextChapterId}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container transition-colors">
              <Icon name="arrow_forward" className="text-on-surface-variant group-hover:text-primary" />
            </div>
          </Link>
        ) : (
          <div className="ml-auto"></div>
        )}
      </div>
    </div>
  )
}
