import { Link } from 'react-router-dom'
import type { ConfusionPair } from '@/types/progress'
import { Icon } from '@/components/ui/Icon'
import { lookAlikeLink } from '@/lib/learn/practiceLink'
import { TRACK_LABEL } from '@/lib/learn/paths'

/** Top mix-up pairs, each linking to a look-alike drill on that pair (GET /progress/confusions). */
export function ConfusionList({ pairs }: { pairs: readonly ConfusionPair[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {pairs.map((p) => (
        <li key={`${p.target.item_id}-${p.chosen.item_id}`}>
          <Link
            to={lookAlikeLink(p.track, p.target.char, p.chosen.char)}
            aria-label={`${p.target.char} mixed up with ${p.chosen.char} ${p.times} times. Drill this pair`}
            className="flex min-h-11 items-center gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span lang="ja" className="font-jp flex items-center gap-2 text-3xl font-bold text-on-surface">
              {p.target.char}
              <Icon name="swap_horiz" className="text-xl text-on-surface-variant" />
              {p.chosen.char}
            </span>
            <span className="min-w-0 flex-1 text-sm text-on-surface-variant">
              <span className="block font-semibold text-on-surface tabular-nums">{p.times}× mixed up</span>
              {TRACK_LABEL[p.track]}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary">
              Drill
              <Icon name="arrow_forward" className="text-base" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
