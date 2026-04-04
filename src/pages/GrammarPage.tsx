import { useParams, Navigate } from 'react-router-dom'
import { GrammarSidebar } from '@/components/grammar/GrammarSidebar'
import { GrammarContent } from '@/components/grammar/GrammarContent'
import { Icon } from '@/components/ui/Icon'
import { useEffect, useState } from 'react'
import { grammarData } from '@/api/mock/grammarData'

const LOCKED_LEVELS = new Set(['n4', 'n3', 'n2', 'n1'])

function LockedLevelScreen({ level }: { level: string }) {
  return (
    <div className="flex-1 lg:ml-72 bg-surface min-h-[calc(100vh-73px)] flex items-center justify-center p-8">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner">
            <Icon name="lock" className="text-5xl text-on-surface-variant/40" />
          </div>
        </div>

        <div>
          <span className="inline-block text-xs uppercase tracking-widest font-bold bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full mb-4">
            {level.toUpperCase()} Course
          </span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-2">
            {level.toUpperCase()} is Locked
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            This level is coming soon. Complete N5 first and unlock Pro to access {level.toUpperCase()} grammar lessons.
          </p>
        </div>

        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5 text-left space-y-3">
          {['n4', 'n3', 'n2', 'n1'].map(l => (
            <div key={l} className="flex items-center gap-3 text-sm text-on-surface-variant/50">
              <Icon name="lock" className="text-base flex-shrink-0" />
              <span className="font-bold">{l.toUpperCase()}</span>
              <span className="text-xs">— Coming Soon</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-on-surface-variant/40">
          Start from <span className="font-bold text-primary">N5</span> to begin your Japanese grammar journey.
        </p>
      </div>
    </div>
  )
}

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

  if (LOCKED_LEVELS.has(level.toLowerCase())) {
    return (
      <div className="min-h-screen pt-[73px] flex">
        <GrammarSidebar level={level} completedChapters={completedChapters} />
        <LockedLevelScreen level={level} />
      </div>
    )
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
