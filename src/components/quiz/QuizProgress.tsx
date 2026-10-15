import { Icon } from '@/components/ui/Icon'

interface QuizProgressProps {
  current: number    // 1-based current question number
  total: number
  score: number
  streak: number
}

export function QuizProgress({ current, total, score, streak }: QuizProgressProps) {
  const pct = Math.round(((current - 1) / total) * 100)

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-4 px-6 pt-9 pb-4">
      {/* Progress bar */}
      <div className="w-full max-w-[800px] flex items-center gap-3">
        <span className="text-xs font-bold font-label text-on-surface-variant tabular-nums w-6 text-right">
          {current - 1}
        </span>
        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold font-label text-on-surface-variant tabular-nums w-6">
          {total}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full">
        <span className="text-xs font-label text-on-surface-variant">Score</span>
        <span className="text-sm font-black font-headline text-on-surface tabular-nums">{score}</span>
      </div>

      {/* Streak */}
      {streak >= 2 && (
        <div className="flex items-center gap-1 bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/20">
          <Icon name="local_fire_department" className="text-sm text-primary animate-streak-flame" />
          <span className="text-sm font-black font-headline text-amber-600 tabular-nums">{streak}</span>
        </div>
      )}
    </div>
  )
}
