import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { UnitScore } from './skipScoring'

/** Per-unit results of a skip test: score, then "Tested out" or a link to learn the unit. */
export function SkipResultsList({ scores }: { scores: UnitScore[] }) {
  return (
    <section aria-labelledby="skip-units" className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4">
      <h3 id="skip-units" className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
        Unit by unit
      </h3>
      <ul className="flex flex-col divide-y divide-outline-variant/30">
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
        <p className="truncate font-semibold text-on-surface">{unit.title}</p>
        <p className="text-sm tabular-nums text-on-surface-variant">
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
        <Link
          to={`${basePath}/unit/${unit.id}`}
          aria-label={`Learn the ${unit.title} unit`}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Learn this
          <span aria-hidden className="flex">
            <Icon name="arrow_forward" className="text-lg" />
          </span>
        </Link>
      )}
    </li>
  )
})
