import { memo } from 'react'
import type { WeakItem } from '@/types/progress'
import { ActionLink } from '@/components/learn/ActionLink'
import { Icon } from '@/components/ui/Icon'
import { practiceLink } from '@/lib/learn/practiceLink'
import { TRACK_LABEL } from '@/lib/learn/paths'
import { formatShare } from '@/lib/learn/progressShape'
import { MasteryChip } from './MasteryChip'

const FACET_LABEL: Record<WeakItem['facet'], string> = {
  recognition: 'reading',
  meaning: 'meaning',
  reading: 'reading',
  writing: 'writing',
}

const WeakItemRow = memo(function WeakItemRow({ item }: { item: WeakItem }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span lang="ja" className="font-jp flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container text-3xl font-bold text-on-surface">
          {item.char}
        </span>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <MasteryChip level={item.level} />
            <span className="text-xs text-on-surface-variant">
              {TRACK_LABEL[item.track]} · {FACET_LABEL[item.facet]} · recall now {formatShare(item.recall)}
            </span>
          </div>
          <ul className="space-y-0.5 text-sm text-on-surface">
            {item.reasons.map((r) => (
              <li key={r} className="flex gap-1.5">
                <Icon name="chevron_right" className="mt-0.5 text-base text-on-surface-variant" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ActionLink to={practiceLink(item.suggestion)} variant="outline" className="shrink-0 px-4 py-2 text-sm">
        <Icon name="fitness_center" className="text-base" />
        Practise this
      </ActionLink>
    </li>
  )
})

/** The weakest items with the server's reasons and a practice link each (GET /progress/weak). */
export function WeakItemsList({ items }: { items: readonly WeakItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <WeakItemRow key={item.card_id} item={item} />
      ))}
    </ul>
  )
}
