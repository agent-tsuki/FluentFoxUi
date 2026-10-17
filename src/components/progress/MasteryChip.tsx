import type { MasteryLevel } from '@/types/progress'
import { cn } from '@/lib/cn'
import { MASTERY_HINT, MASTERY_LABEL, MASTERY_TONE } from '@/lib/learn/mastery'

/** A small pill naming an item's mastery level in its colour. */
export function MasteryChip({ level, className }: { level: MasteryLevel; className?: string }) {
  return (
    <span
      title={MASTERY_HINT[level]}
      className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', MASTERY_TONE[level].soft, className)}
    >
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', MASTERY_TONE[level].fill)} />
      <span className="text-on-surface">{MASTERY_LABEL[level]}</span>
    </span>
  )
}
