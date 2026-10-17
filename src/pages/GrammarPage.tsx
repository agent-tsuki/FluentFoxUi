import { useParams, Navigate } from 'react-router-dom'
import { GrammarSidebar } from '@/components/grammar/GrammarSidebar'
import { GrammarContent } from '@/components/grammar/GrammarContent'
import { MobileGrammarNav } from '@/components/grammar/MobileGrammarNav'
import { LOCKED_GRAMMAR_LEVELS } from '@/components/grammar/LevelSwitcher'
import { Icon } from '@/components/ui/Icon'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useEffect, useState } from 'react'
import { useGrammarChapters } from '@/hooks/useGrammarChapters'
import { useGrammarChapter } from '@/hooks/useGrammarChapter'

// Column on phones (sticky MobileGrammarNav on top), row on desktop (fixed sidebar + content).
const PAGE_LAYOUT = 'min-h-dvh pt-nav flex flex-col lg:flex-row'

// In-page anchors must land below the fixed navbar AND the sticky phone bar
// (two rows below sm ≈ 7.5rem, one row ≈ 4rem; no bar from lg up).
const ANCHOR_OFFSET =
  '[&_[id]]:scroll-mt-[calc(theme(spacing.nav)+8rem)] sm:[&_[id]]:scroll-mt-[calc(theme(spacing.nav)+4.5rem)] lg:[&_[id]]:scroll-mt-[calc(theme(spacing.nav)+1rem)]'

function LockedLevelScreen({ level }: { level: string }) {
  return (
    <div className="flex-1 lg:ml-72 bg-surface min-h-[calc(100dvh-theme(spacing.nav))] flex items-center justify-center p-8">
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

/** Mirrors GrammarContent's header + concept cards while a chapter's chunk loads. */
function ChapterSkeleton() {
  return (
    <LoadingState label="Loading chapter…" className="px-6 xl:px-10 py-10">
      <div className="space-y-4">
        <SkeletonBlock className="h-4 w-40 rounded-full" />
        <SkeletonBlock className="h-10 w-3/4 rounded-xl" />
        <SkeletonBlock className="h-4 w-full rounded-xl" />
        <SkeletonBlock className="h-4 w-5/6 rounded-xl" />
      </div>
      <div className="mt-10 space-y-6">
        <SkeletonBlock className="h-56 w-full rounded-2xl" />
        <SkeletonBlock className="h-56 w-full rounded-2xl" />
      </div>
    </LoadingState>
  )
}

const VALID_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']

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

  const levelKey = level?.toLowerCase() ?? ''
  const isValidLevel = VALID_LEVELS.includes(levelKey)
  const isLocked = LOCKED_GRAMMAR_LEVELS.has(levelKey)

  const chapterList = useGrammarChapters(isValidLevel ? levelKey : '')
  const chapters = chapterList.data ?? []

  // An unknown chapter id falls back to the level's first chapter.
  const summary = chapters.find(c => c.id === selectedChapterId) ?? chapters[0]
  const currentIndex = summary ? chapters.indexOf(summary) : -1
  const prevChapterId = currentIndex > 0 ? chapters[currentIndex - 1].id : undefined
  const nextChapterId = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : undefined

  const chapterState = useGrammarChapter(levelKey, isLocked ? undefined : summary?.id, { prefetchId: nextChapterId })

  if (!level || !isValidLevel) {
    return <Navigate to="/grammar/n5/1" replace />
  }

  const activeChapterId = summary?.id ?? selectedChapterId

  if (isLocked) {
    return (
      <div className={PAGE_LAYOUT}>
        <GrammarSidebar level={level} chapters={chapters} completedChapters={completedChapters} activeChapterId={selectedChapterId} />
        <MobileGrammarNav level={level} chapters={chapters} completedChapters={completedChapters} activeChapterId={selectedChapterId} />
        <LockedLevelScreen level={level} />
      </div>
    )
  }

  if (chapterList.error) {
    return (
      <div className="min-h-dvh pt-nav flex items-center justify-center">
        <ErrorState message="We couldn't load this course's chapters. Please try again." onRetry={chapterList.refetch} />
      </div>
    )
  }

  if (!chapterList.isLoading && !summary) {
    return (
      <div className="min-h-dvh pt-nav flex items-center justify-center">
        <p className="text-on-surface-variant font-medium">Content coming soon for this level!</p>
      </div>
    )
  }

  const markChapterComplete = () => {
    if (!summary) return
    setCompletedChapters(prev => {
      const next = new Set(prev)
      next.add(summary.id)
      localStorage.setItem(`ff-complete-${levelKey}`, JSON.stringify([...next]))
      return next
    })
  }

  const chapter = chapterState.data
  let body
  if (chapterState.error) {
    body = <ErrorState message="We couldn't load this chapter. Please try again." onRetry={chapterState.refetch} />
  } else if (chapter) {
    body = (
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
    )
  } else if (chapter === null) {
    // Listed but no content (shouldn't happen: the list is built from the same files).
    body = <ErrorState title="Chapter not found" message="This chapter isn't available right now." onRetry={chapterState.refetch} />
  } else {
    body = <ChapterSkeleton />
  }

  return (
    <div className={PAGE_LAYOUT}>
      <GrammarSidebar level={level} chapters={chapters} completedChapters={completedChapters} activeChapterId={activeChapterId} />
      <MobileGrammarNav
        level={level}
        chapters={chapters}
        completedChapters={completedChapters}
        activeChapterId={activeChapterId}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
      />
      <main className={`flex-1 lg:ml-72 bg-surface fade-in ${ANCHOR_OFFSET}`}>
        {body}
      </main>
    </div>
  )
}
