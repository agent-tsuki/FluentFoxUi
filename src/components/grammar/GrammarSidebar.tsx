import type { GrammarChapterSummary } from '@/types/grammar'
import { Button } from '@/components/ui/Button'
import { useStartLearning } from '@/hooks/useStartLearning'
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
  const { startLearning } = useStartLearning()

  return (
    <aside className="fixed left-0 top-nav h-[calc(100dvh-theme(spacing.nav))] w-72 bg-surface-container-lowest flex-col border-r border-outline-variant/30 hidden lg:flex">

      {/* Level Switcher */}
      <div className="px-4 pt-5 pb-4 border-b border-outline-variant/20 flex-shrink-0">
        <div className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">Grammar Course</div>
        <LevelSwitcher level={level} />
      </div>

      {/* Progress Bar */}
      <ChapterProgress
        chapters={chapters}
        completedChapters={completedChapters}
        className="border-b border-outline-variant/20 flex-shrink-0"
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

      {level.toLowerCase() !== 'n5' && (
        <div className="flex-shrink-0 p-4 border-t border-outline-variant/20">
          {/* Pro isn't built yet: for now this opens signup (or goes to the
              dashboard when signed in) so the button isn't a dead control. */}
          <Button variant="primary" className="w-full py-3 rounded-xl shadow-none" onClick={startLearning}>
            Unlock Pro Deck
          </Button>
        </div>
      )}
    </aside>
  )
}
