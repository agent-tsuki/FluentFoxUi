import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChapterExercise } from '@/components/grammar/ChapterExercise'
import { ChapterListening } from '@/components/grammar/ChapterListening'
import { ChapterTabs } from '@/components/grammar/ChapterTabs'
import { ChapterVocabulary } from '@/components/grammar/ChapterVocabulary'
import { GrammarContent } from '@/components/grammar/GrammarContent'
import { GrammarSidebar } from '@/components/grammar/GrammarSidebar'
import { LOCKED_GRAMMAR_LEVELS } from '@/components/grammar/LevelSwitcher'
import { MobileGrammarNav } from '@/components/grammar/MobileGrammarNav'
import { FIXED_SIDEBAR_OFFSET } from '@/components/layout/FixedSidebar'
import { ContinueBar } from '@/components/lesson/ContinueBar'
import { useReadingPrefs } from '@/components/lesson/LessonToolbar'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { useChapterContent } from '@/hooks/useChapterContent'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import { useGrammarChapter } from '@/hooks/useGrammarChapter'
import { useGrammarChapters } from '@/hooks/useGrammarChapters'
import { CHAPTER_TABS, chapterPath, isChapterTab, type ChapterTab } from '@/lib/content/jlpt/levels'
import { readCompletedChapters } from '@/lib/grammar/completion'
import { useRecordLesson } from '@/store/lessonStore'
import { showToast } from '@/store/toastStore'

// Column on phones (sticky MobileGrammarNav on top), row on desktop (fixed sidebar + content).
const PAGE_LAYOUT = 'lesson-solid min-h-dvh pt-nav flex flex-col lg:flex-row'

// In-page anchors must land below the fixed navbar AND the phone bar
// (two rows below sm ≈ 7.5rem, one row ≈ 4rem; no bar from lg up).
const ANCHOR_OFFSET =
  '[&_[id]]:scroll-mt-[calc(theme(spacing.nav)+8rem)] sm:[&_[id]]:scroll-mt-[calc(theme(spacing.nav)+4.5rem)] lg:[&_[id]]:scroll-mt-[calc(theme(spacing.nav)+1rem)]'

const VALID_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1']

function ChapterSkeleton() {
  return (
    <LoadingState label="Loading chapter…" className="px-6 py-10 xl:px-10">
      <div className="space-y-4">
        <SkeletonBlock className="h-10 w-3/4 rounded-lg" />
        <SkeletonBlock className="h-4 w-full rounded-lg" />
        <SkeletonBlock className="h-4 w-5/6 rounded-lg" />
      </div>
      <div className="mt-10 space-y-6">
        <SkeletonBlock className="h-56 w-full rounded-xl" />
        <SkeletonBlock className="h-56 w-full rounded-xl" />
      </div>
    </LoadingState>
  )
}

export function GrammarPage() {
  const { level, chapterId, tab: tabParam } = useParams<{ level: string; chapterId?: string; tab?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openModal } = useModal()
  const selectedChapterId = chapterId ? parseInt(chapterId) : 1
  const tab: ChapterTab = isChapterTab(tabParam) ? tabParam : 'grammar'
  const levelKey = level?.toLowerCase() ?? ''
  const isValidLevel = VALID_LEVELS.includes(levelKey)
  const isLocked = LOCKED_GRAMMAR_LEVELS.has(levelKey)

  const [localCompleted, setLocalCompleted] = useState<Set<number>>(new Set())
  useEffect(() => {
    setLocalCompleted(level ? readCompletedChapters(level) : new Set())
  }, [level])

  // Signed-in learners' chapters complete on the server when they pass the test.
  const progress = useChapterProgress(levelKey)
  const { enabled: progressEnabled, byChapter, setCompleted, refetch: refetchProgress } = progress
  const completedChapters = useMemo(
    () => (progressEnabled ? new Set([...byChapter].filter(([, p]) => p.completed).map(([n]) => n)) : localCompleted),
    [progressEnabled, byChapter, localCompleted],
  )

  const chapterList = useGrammarChapters(isValidLevel ? levelKey : '')
  const chapters = chapterList.data ?? []
  const summary = chapters.find((c) => c.id === selectedChapterId) ?? chapters[0]
  const currentIndex = summary ? chapters.indexOf(summary) : -1
  const prevChapterId = currentIndex > 0 ? chapters[currentIndex - 1].id : undefined
  const nextChapterId = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : undefined

  const chapterState = useGrammarChapter(levelKey, isLocked ? undefined : summary?.id, { prefetchId: nextChapterId })
  const chapter = chapterState.data
  const content = useChapterContent(levelKey, isLocked ? undefined : summary?.id)
  const reading = useReadingPrefs(summary?.id ?? 1)

  useRecordLesson(
    summary && !isLocked
      ? { course: 'grammar', href: chapterPath(levelKey, summary.id, tab), label: `${levelKey.toUpperCase()} Ch ${summary.id}` }
      : null,
  )

  // On a new chapter or tab, start at the top and move focus into the lesson for screen readers.
  const mainRef = useRef<HTMLElement>(null)
  const firstPage = useRef(true)
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0)
    if (firstPage.current) {
      firstPage.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [level, chapterId, tab])

  const title = summary?.title
  useEffect(() => {
    if (title) document.title = `${title} · ${levelKey.toUpperCase()} Grammar · FoxSensei`
  }, [title, levelKey])

  if (!level || !isValidLevel) return <Navigate to="/grammar/n5/1" replace />
  // An unknown tab (or /grammar/n5/3/grammar) opens the chapter's notes.
  if (tabParam !== undefined && (!isChapterTab(tabParam) || tabParam === 'grammar')) {
    return <Navigate to={chapterPath(level, selectedChapterId)} replace />
  }

  const navProps = { level, chapters, completedChapters, activeChapterId: summary?.id ?? selectedChapterId }

  if (isLocked) {
    return (
      <div className={PAGE_LAYOUT}>
        <GrammarSidebar {...navProps} />
        <MobileGrammarNav {...navProps} />
        <main id="lesson" className={`flex flex-1 items-center justify-center p-8 ${FIXED_SIDEBAR_OFFSET}`}>
          <EmptyState
            glyph="文"
            title={`${level.toUpperCase()} grammar is coming soon`}
            description="N5 is ready now, and it's the best place to start."
            actionLabel="Go to N5 grammar"
            onAction={() => navigate('/grammar/n5/1')}
          />
        </main>
      </div>
    )
  }

  if (chapterList.error) {
    return (
      <div className="lesson-solid flex min-h-dvh items-center justify-center pt-nav">
        <ErrorState message="We couldn't load this course's chapters. Please try again." onRetry={chapterList.refetch} />
      </div>
    )
  }

  if (!chapterList.isLoading && !summary) {
    return (
      <div className="lesson-solid flex min-h-dvh items-center justify-center pt-nav">
        <EmptyState glyph="文" title="More chapters are coming" description="This level has no chapters yet." actionLabel="Go to N5 grammar" onAction={() => navigate('/grammar/n5/1')} />
      </div>
    )
  }

  const chapterProgress = summary ? byChapter.get(summary.id) : undefined
  const isCompleted = summary ? completedChapters.has(summary.id) : false
  const stepIndex = CHAPTER_TABS.findIndex((t) => t.id === tab)
  const wordCount = content.data?.words.length
  const clipCount = content.data?.passages?.length
  const stepSize: Record<ChapterTab, string | undefined> = {
    grammar: chapter ? `${chapter.concepts.length} concepts` : undefined,
    vocabulary: wordCount ? `${wordCount} words` : undefined,
    exercise: '20 questions',
    listening: clipCount ? `${clipCount} clips` : 'Listen and read',
  }
  const doneTabs = new Set<ChapterTab>(isCompleted ? CHAPTER_TABS.map((t) => t.id) : chapterProgress?.vocabPassed ? ['vocabulary'] : [])

  const onTestRecorded = (passed: boolean) => {
    refetchProgress()
    if (!passed || !summary || !progressEnabled) return
    setCompleted(summary.id, true).catch(() => showToast({ tone: 'error', title: "We couldn't complete the chapter", message: 'Please try the test again.' }))
  }

  let footer: ReactNode = null
  if (summary) {
    const nextStep = CHAPTER_TABS[stepIndex + 1]
    const nextChapterLink = nextChapterId !== undefined ? chapterPath(levelKey, nextChapterId) : undefined
    if (nextStep) {
      footer = (
        <ContinueBar
          title={`Next: ${nextStep.title}`}
          subtitle={[`Step ${stepIndex + 2} of ${CHAPTER_TABS.length}`, stepSize[nextStep.id]].filter(Boolean).join(' · ')}
          action={{ label: `Next: ${nextStep.title}`, to: chapterPath(levelKey, summary.id, nextStep.id) }}
          quiet={tab === 'exercise' && !isCompleted}
          // The Grammar tab has its own previous and next chapter links.
          skip={nextChapterLink && tab !== 'grammar' ? { label: `Skip to Chapter ${nextChapterId}`, to: nextChapterLink } : undefined}
        />
      )
    } else {
      const saveProgress = !user ? (
        <Button variant="secondary" onClick={() => openModal('signup')} {...authModalPrefetchHandlers}>
          Save your progress
        </Button>
      ) : undefined
      footer = (
        <ContinueBar
          title={isCompleted ? `Chapter ${summary.id} complete` : nextChapterId !== undefined ? `Next: Chapter ${nextChapterId}` : 'Last chapter of this level'}
          subtitle={isCompleted ? undefined : 'Pass the chapter test in Exercise to complete this chapter'}
          action={nextChapterLink ? { label: `Start Chapter ${nextChapterId}`, to: nextChapterLink } : { label: 'Go to Practice', to: '/quiz' }}
          extra={saveProgress}
        />
      )
    }
  }

  let body: ReactNode
  if (chapterState.error) {
    body = <ErrorState message="We couldn't load this chapter. Please try again." onRetry={chapterState.refetch} />
  } else if (chapter && tab === 'vocabulary') {
    body = (
      <div className="px-6 py-8 xl:px-10">
        <ChapterVocabulary chapter={chapter} best={chapterProgress?.vocabBest} onRecorded={refetchProgress} footer={footer} />
      </div>
    )
  } else if (chapter && tab === 'exercise') {
    body = (
      <div className="px-6 py-8 xl:px-10">
        <ChapterExercise chapterId={chapter.id} best={chapterProgress?.exerciseBest} isCompleted={isCompleted} onRecorded={onTestRecorded} footer={footer} />
      </div>
    )
  } else if (chapter && tab === 'listening') {
    body = (
      <div className="grid gap-12 px-6 py-8 xl:px-10">
        <ChapterListening level={levelKey} chapterId={chapter.id} />
        {footer}
      </div>
    )
  } else if (chapter) {
    body = <GrammarContent chapter={chapter} prevChapterId={prevChapterId} nextChapterId={nextChapterId} isCompleted={isCompleted} footer={footer} />
  } else if (chapter === null) {
    body = <ErrorState title="Chapter not found" message="This chapter isn't available right now." onRetry={chapterState.refetch} />
  } else {
    body = <ChapterSkeleton />
  }

  return (
    <div className={PAGE_LAYOUT} data-furigana={reading.furigana ? 'on' : 'off'} data-romaji={reading.romaji ? 'on' : 'off'} data-english={reading.english ? 'on' : 'off'}>
      <GrammarSidebar {...navProps} />
      <MobileGrammarNav {...navProps} prevChapterId={prevChapterId} nextChapterId={nextChapterId} />
      <main id="lesson" ref={mainRef} tabIndex={-1} className={`flex-1 focus:outline-none ${FIXED_SIDEBAR_OFFSET} ${ANCHOR_OFFSET}`}>
        {summary && <ChapterTabs level={levelKey} chapterId={summary.id} title={summary.title} current={tab} done={doneTabs} />}
        {body}
      </main>
    </div>
  )
}
