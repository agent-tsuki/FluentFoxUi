import type { ItemCardProgress, ItemHistory } from '@/types/progress'
import { cn } from '@/lib/cn'
import { GRADE_LABEL_TEXT, formatNextDue, formatSeconds } from '@/lib/learn/sessionResult'
import { formatShare } from '@/lib/learn/progressShape'
import { MasteryChip } from './MasteryChip'

const FACET_TITLE: Record<ItemCardProgress['facet'], string> = {
  recognition: 'Recognition',
  meaning: 'Meaning',
  reading: 'Reading',
  writing: 'Writing',
}

const LABEL_TONE = {
  strong: 'text-success',
  good: 'text-info',
  shaky: 'text-warning',
  missed: 'text-error',
} as const

function CardRow({ card }: { card: ItemCardProgress }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
      <span className="w-24 font-semibold text-on-surface">{FACET_TITLE[card.facet]}</span>
      <MasteryChip level={card.level} />
      <span className="text-on-surface-variant">recall {formatShare(card.recall)}</span>
      <span className="text-on-surface-variant">next {formatNextDue(card.next_due)}</span>
      <span className="text-on-surface-variant tabular-nums">
        {card.reps} reps · {card.lapses} lapses
      </span>
      {card.is_leech && <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-semibold text-error">Leech</span>}
    </li>
  )
}

/** One item's level, cards, stats and last answers (GET /progress/items/{type}/{id}). */
export function ItemHistoryPanel({ history, className }: { history: ItemHistory; className?: string }) {
  const { stats } = history
  if (history.cards.length === 0 && history.answers.length === 0) {
    return <p className={cn('text-sm text-on-surface-variant', className)}>Not studied yet. It shows up here after its first lesson or practice.</p>
  }
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
        <MasteryChip level={history.level} />
        <span className="tabular-nums">
          {stats.answers} answers · {formatShare(stats.accuracy)} right · recall {formatShare(stats.retention)}
          {stats.avg_answer_ms !== null && ` · usually ${formatSeconds(stats.avg_answer_ms)}`}
        </span>
      </div>
      {history.cards.length > 0 && <ul className="divide-y divide-outline-variant/40">{history.cards.map((c) => <CardRow key={c.card_id} card={c} />)}</ul>}
      {history.answers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Last answers</h4>
          <ol className="flex flex-wrap gap-1.5" aria-label="Last answers, newest first">
            {history.answers.map((a) => (
              <li
                key={`${a.card_id}-${a.answered_at}`}
                title={`${new Date(a.answered_at).toLocaleString()} · ${formatSeconds(a.active_ms)}`}
                className={cn('rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold', a.label ? LABEL_TONE[a.label] : 'text-on-surface-variant')}
              >
                {a.label ? GRADE_LABEL_TEXT[a.label] : a.correct ? 'Right' : 'Missed'}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
