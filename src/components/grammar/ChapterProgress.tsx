import type { GrammarChapterSummary } from '@/types/grammar'
import { cn } from '@/lib/cn'

interface ChapterProgressProps {
  chapters: GrammarChapterSummary[]
  completedChapters: Set<number>
  className?: string
}

/**
 * ChapterProgress — "Your Progress  3 / 25" with a bar, for a grammar level.
 * Shown above the ChapterList in the desktop sidebar and the phone chapter sheet.
 */
export function ChapterProgress({ chapters, completedChapters, className }: ChapterProgressProps) {
  if (chapters.length === 0) return null

  const completedCount = chapters.filter(ch => completedChapters.has(ch.id)).length
  const progressPct = Math.round((completedCount / chapters.length) * 100)

  return (
    <div className={cn('px-4 py-3.5', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-on-surface-variant font-medium">Your Progress</span>
        <span className="text-xs font-bold text-primary">
          {completedCount} / {chapters.length}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Chapters completed"
        aria-valuemin={0}
        aria-valuemax={chapters.length}
        aria-valuenow={completedCount}
        className="h-1.5 bg-surface-container-high rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      {completedCount > 0 && (
        <p className="text-xs text-on-surface-variant/60 mt-1.5">
          {progressPct}% complete — keep going!
        </p>
      )}
    </div>
  )
}
