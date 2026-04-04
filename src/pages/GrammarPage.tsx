import { useParams, Navigate } from 'react-router-dom'
import { GrammarSidebar } from '@/components/grammar/GrammarSidebar'
import { GrammarContent } from '@/components/grammar/GrammarContent'
import { useEffect, useState } from 'react'
import { grammarData } from '@/api/mock/grammarData'

export function GrammarPage() {
  const { level, chapterId } = useParams<{ level: string; chapterId?: string }>()
  const selectedChapterId = chapterId ? parseInt(chapterId) : 1
  const [revealMode, setRevealMode] = useState(false)
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set())

  // Load completed chapters from localStorage when level changes
  useEffect(() => {
    try {
      const s = localStorage.getItem(`ff-complete-${level?.toLowerCase()}`)
      setCompletedChapters(s ? new Set(JSON.parse(s)) : new Set())
    } catch {
      setCompletedChapters(new Set())
    }
  }, [level])

  useEffect(() => {
    window.scrollTo(0, 0)
    setRevealMode(false)
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

  const markChapterComplete = () => {
    setCompletedChapters(prev => {
      const next = new Set(prev)
      next.add(chapter.id)
      localStorage.setItem(`ff-complete-${level.toLowerCase()}`, JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div className="min-h-screen pt-[73px] flex">
      <GrammarSidebar level={level} completedChapters={completedChapters} />
      <main className="flex-1 lg:ml-72 bg-surface fade-in">
        <GrammarContent
          chapter={chapter}
          showAll={revealMode}
          revealMode={revealMode}
          onToggleReveal={() => setRevealMode(r => !r)}
          prevChapterId={prevChapterId}
          nextChapterId={nextChapterId}
          isCompleted={completedChapters.has(chapter.id)}
          onMarkComplete={markChapterComplete}
        />
      </main>
    </div>
  )
}
