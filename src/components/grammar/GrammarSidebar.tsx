import type { GrammarChapterSummary } from '@/types/grammar'
import { FixedSidebar } from '@/components/layout/FixedSidebar'
import { LevelSwitcher } from '@/components/grammar/LevelSwitcher'
import { ChapterProgress } from '@/components/grammar/ChapterProgress'
import { ChapterList } from '@/components/grammar/ChapterList'

interface GrammarSidebarProps {
  level: string
  chapters: GrammarChapterSummary[]
  completedChapters: Set<number>
  activeChapterId: number
}

/**
 * GrammarSidebar — desktop (lg+) course navigation: level switcher, progress,
 * and chapter list. Phones get the same pieces via MobileGrammarNav.
 */
export function GrammarSidebar({ level, chapters, completedChapters, activeChapterId }: GrammarSidebarProps) {
  return (
    <FixedSidebar>

      {/* Level Switcher */}
      <div className="px-4 pt-5 pb-4 border-b border-line flex-shrink-0">
        <div className="mb-3 text-eyebrow uppercase text-ink-muted">Grammar Course</div>
        <LevelSwitcher level={level} />
      </div>

      {/* Progress Bar */}
      <ChapterProgress
        chapters={chapters}
        completedChapters={completedChapters}
        className="border-b border-line flex-shrink-0"
      />

      {/* Chapter List */}
      <nav aria-label={`${level.toUpperCase()} chapters`} className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <ChapterList
          level={level}
          chapters={chapters}
          completedChapters={completedChapters}
          activeChapterId={activeChapterId}
        />
      </nav>
    </FixedSidebar>
  )
}
