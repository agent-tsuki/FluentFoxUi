import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { GrammarChapterSummary } from '@/types/grammar'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

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
  chapter: GrammarChapterSummary
  isActive: boolean
  isDone: boolean
  onSelect?: (chapterId: number) => void
}

const ChapterItem = memo(function ChapterItem({ level, chapter, isActive, isDone, onSelect }: ChapterItemProps) {
  return (
    <li>
      <Link
        to={`/grammar/${level}/${chapter.id}`}
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive || undefined}
        onClick={() => onSelect?.(chapter.id)}
        className={cn(
          'flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isActive ? 'bg-primary/10' : 'hover:bg-surface-container-high',
        )}
      >
        {/* Chapter number / done badge */}
        <span
          className={cn(
            'flex-shrink-0 size-7 rounded-full text-2xs font-bold flex items-center justify-center mt-0.5 transition-colors',
            isDone
              ? 'bg-primary text-on-primary'
              : isActive
              ? 'bg-primary/20 text-primary'
              : 'bg-surface-container-highest text-on-surface-variant group-hover:bg-outline-variant/30',
          )}
        >
          {isDone ? <Icon name="check" className="text-[1.05rem]" /> : chapter.id}
        </span>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-sm leading-snug',
              isActive
                ? 'font-bold text-primary'
                : isDone
                ? 'font-medium text-on-surface'
                : 'font-medium text-on-surface-variant group-hover:text-on-surface',
            )}
          >
            {chapter.title}
            {isDone && <span className="sr-only"> (completed)</span>}
          </div>
          {isActive && (
            <div className="text-xs text-primary/60 mt-0.5 font-medium">Currently studying</div>
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
  if (chapters.length === 0) {
    return (
      <div className={cn('px-5 py-12 text-center', className)}>
        <Icon name="lock" className="text-4xl text-on-surface-variant/30 mb-3" />
        <p className="text-sm font-semibold text-on-surface-variant/60">Coming Soon</p>
        <p className="text-xs text-on-surface-variant/40 mt-1">
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
          chapter={ch}
          isActive={ch.id === activeChapterId}
          isDone={completedChapters.has(ch.id)}
          onSelect={onSelect}
        />
      ))}
    </ol>
  )
}
