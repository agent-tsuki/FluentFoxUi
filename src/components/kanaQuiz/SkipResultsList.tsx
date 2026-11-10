import { memo } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { UnitScore } from './skipScoring'
import { TextLink } from '@/components/ui/TextLink'
import { unitLearnPath } from '@/components/kanaCourse/unitLinks'

/** Per-unit results of a skip test: score, then "Tested out" or a link to learn the unit. */
export function SkipResultsList({ scores }: { scores: UnitScore[] }) {
  return (
    <section aria-labelledby="skip-units" className="rounded-xl border border-line bg-surface-sunken p-4">
      <h3 id="skip-units" className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
        Unit by unit
      </h3>
      <ul className="flex flex-col divide-y divide-line">
        {scores.map((s) => (
          <UnitRow key={s.unit.id} score={s} />
        ))}
      </ul>
    </section>
  )
}

const UnitRow = memo(function UnitRow({ score: { unit, correct, total, passed } }: { score: UnitScore }) {
  const { basePath } = useKanaScript()
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <li className="flex min-h-14 items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{unit.title}</p>
        <p className="text-sm tabular-nums text-ink-muted">
          {correct}/{total} · {percent}%
        </p>
      </div>
      {passed ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-3 py-1.5 text-sm font-bold text-success">
          <span aria-hidden className="flex">
            <Icon name="verified" filled className="text-base" />
          </span>
          Tested out
        </span>
      ) : (
        <TextLink to={unitLearnPath(basePath, unit.id)} aria-label={`Learn the ${unit.title} unit`} className="shrink-0 px-3">
          Learn this
        </TextLink>
      )}
    </li>
  )
})
