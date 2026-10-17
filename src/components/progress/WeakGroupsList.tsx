import type { WeakGroup } from '@/types/progress'
import { ActionLink } from '@/components/learn/ActionLink'
import { JaText } from '@/components/learn/JaText'
import { Icon } from '@/components/ui/Icon'
import { practiceLink } from '@/lib/learn/practiceLink'
import { TRACK_LABEL } from '@/lib/learn/paths'
import { formatShare } from '@/lib/learn/progressShape'

/** Units and kana groups weaker than the learner's average (GET /progress/weak-groups). */
export function WeakGroupsList({ groups }: { groups: readonly WeakGroup[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {groups.map((g) => (
        <li key={`${g.track}-${g.kind}-${g.slug}`} className="flex flex-col gap-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4">
          <div className="space-y-1">
            <p className="text-xs text-on-surface-variant">{TRACK_LABEL[g.track]}</p>
            <h3 className="font-headline text-base font-bold text-on-surface">
              <JaText text={g.title} />
            </h3>
            <p className="text-sm text-on-surface">{g.reason}</p>
            <p className="text-xs text-on-surface-variant tabular-nums">
              {g.reviews} reviews · missed {formatShare(g.lapse_rate)}
            </p>
          </div>
          <ActionLink to={practiceLink(g.suggestion)} variant="outline" className="mt-auto self-start px-4 py-2 text-sm">
            <Icon name="fitness_center" className="text-base" />
            Practise this
          </ActionLink>
        </li>
      ))}
    </ul>
  )
}
