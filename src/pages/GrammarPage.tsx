import { useParams, Navigate } from 'react-router-dom'
import { GrammarSidebar } from '@/components/grammar/GrammarSidebar'
import { GrammarContent } from '@/components/grammar/GrammarContent'
import { useEffect, useState } from 'react'
import { grammarData } from '@/api/mock/grammarData'
import { Icon } from '@/components/ui/Icon'

export function GrammarPage() {
  const { level, chapterId } = useParams<{ level: string; chapterId?: string }>()
  const selectedChapterId = chapterId ? parseInt(chapterId) : 1
  const [revealMode, setRevealMode] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0)
    setRevealMode(false) // Reset hints when moving to a new chapter
  }, [level, chapterId])
  
  if (!level || !['n5', 'n4', 'n3', 'n2', 'n1'].includes(level.toLowerCase())) {
    return <Navigate to="/grammar/n5/1" replace />
  }

  const chapters = grammarData[level.toLowerCase()] || []
  const chapter = chapters.find(c => c.id === selectedChapterId) || chapters[0]

  if (!chapter) {
    return (
      <div className="min-h-screen pt-[73px] flex items-center justify-center">
        <p className="text-on-surface-variant font-medium">Content coming soon for this level!</p>
      </div>
    )
  }

  const currentIndex = chapters.findIndex(c => c.id === chapter.id)
  const prevChapterId = currentIndex > 0 ? chapters[currentIndex - 1].id : undefined
  const nextChapterId = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : undefined

  return (
    <div className="min-h-screen pt-[73px] flex">
      <GrammarSidebar level={level} />
      <main className="flex-1 lg:ml-64 bg-surface fade-in relative">
        {/* Ghost Toggle Button */}
        <div className="fixed bottom-8 right-8 z-50 md:absolute md:top-12 md:right-12 md:bottom-auto">
           <button 
            onClick={() => setRevealMode(!revealMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-2xl md:shadow-lg border-2 ${
              revealMode 
              ? 'bg-primary text-on-primary border-primary' 
              : 'bg-surface text-primary border-primary hover:bg-primary/5'
            }`}
          >
            <Icon name={revealMode ? "visibility_off" : "visibility"} className="text-lg" />
            <span className="hidden sm:inline">{revealMode ? "Hide All Hints" : "Show All Hints"}</span>
            <span className="sm:hidden">{revealMode ? "Hide" : "Hints"}</span>
          </button>
        </div>

        <GrammarContent 
          chapter={chapter} 
          showAll={revealMode} 
          prevChapterId={prevChapterId}
          nextChapterId={nextChapterId}
        />
      </main>
    </div>
  )
}
