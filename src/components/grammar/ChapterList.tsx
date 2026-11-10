import { memo } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { GrammarChapterSummary } from '@/types/grammar'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { chapterPath, isChapterTab, type ChapterTab } from '@/lib/content/jlpt/levels'

interface ChapterListProps {
  level: string
  chapters: GrammarChapterSummary[]
  completedChapters: Set<number>
  activeChapterId: number
  /** Called after a chapter link is activated (e.g. to close the phone sheet). */
  onSelect?: (chapterId: number) => void
  className?: string
}

interface ChapterItemProps {
  level: string
  /** The tab open now (Grammar / Vocabulary / Exercise): switching chapter keeps it. */
  tab: ChapterTab
  chapter: GrammarChapterSummary
  isActive: boolean
  isDone: boolean
  onSelect?: (chapterId: number) => void
}

const ChapterItem = memo(function ChapterItem({ level, tab, chapter, isActive, isDone, onSelect }: ChapterItemProps) {
  return (
    <li>
      <Link
        to={chapterPath(level, chapter.id, tab)}
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive || undefined}
        onClick={() => onSelect?.(chapter.id)}
        className={cn(
          'flex min-h-touch-target items-start gap-3 px-3 py-2.5 rounded-md transition-colors duration-fast group',
          isActive ? 'bg-primary-soft' : 'hover:bg-surface-hover',
        )}
      >
        {/* Chapter number / done badge */}
        <span
          className={cn(
            'flex-shrink-0 size-7 rounded-full text-2xs font-bold flex items-center justify-center mt-0.5 transition-colors',
            isDone
              ? 'bg-success text-surface-raised'
              : isActive
              ? 'bg-primary text-on-primary'
              : 'bg-surface-sunken text-ink-muted',
          )}
        >
          {isDone ? <Icon name="check" className="text-[1.05rem]" /> : chapter.id}
        </span>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-sm leading-snug',
              isActive
                ? 'font-bold text-primary-ink'
                : isDone
                ? 'font-medium text-ink'
                : 'font-medium text-ink-muted group-hover:text-ink',
            )}
          >
            {chapter.title}
            {isDone && <span className="sr-only"> (completed)</span>}
          </div>
          {isActive && (
            <div className="text-xs text-primary-ink mt-0.5 font-medium">Currently studying</div>
          )}
        </div>
      </Link>
    </li>
  )
})

/**
 * ChapterList — the chapters of one grammar level with done ticks and the
 * active chapter highlighted. Shared by the desktop GrammarSidebar and the
 * phone chapter sheet in MobileGrammarNav.
 */
export function ChapterList({ level, chapters, completedChapters, activeChapterId, onSelect, className }: ChapterListProps) {
  const { tab: tabParam } = useParams()
  const tab: ChapterTab = isChapterTab(tabParam) ? tabParam : 'grammar'
  if (chapters.length === 0) {
    return (
      <div className={cn('px-5 py-12 text-center', className)}>
        <Icon name="lock" className="text-4xl text-ink-subtle mb-3" />
        <p className="text-sm font-semibold text-ink-subtle">Coming Soon</p>
        <p className="text-xs text-ink-subtle mt-1">
          {level.toUpperCase()} content is being prepared
        </p>
      </div>
    )
  }

  return (
    <ol className={cn('px-2 space-y-0.5', className)}>
      {chapters.map(ch => (
        <ChapterItem
          key={ch.id}
          level={level}
          tab={tab}
          chapter={ch}
          isActive={ch.id === activeChapterId}
          isDone={completedChapters.has(ch.id)}
          onSelect={onSelect}
        />
      ))}
    </ol>
  )
}
