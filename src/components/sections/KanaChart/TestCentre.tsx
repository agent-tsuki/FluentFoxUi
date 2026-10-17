import type { KanaChar } from '@/types'
import { useLearningPath } from '@/hooks/useLearningPath'
import { useKanaScript } from '@/context/KanaScriptContext'
import { unitsOfGroup } from '@/lib/content/kana/scripts'
import { JaText } from '@/components/learn/JaText'
import { kanaPreview, unitKana } from '@/components/learn/unitStatus'
import { TESTS_LIST, TestsRow } from '@/components/kanaCourse/TestsRow'
import { cn } from '@/lib/cn'

interface TestCentreProps {
  kanaById: ReadonlyMap<string, KanaChar>
  className?: string
}

/**
 * Every unit quiz on the Tests page, grouped by the script's groups
 * (Basic 46 / Dakuten / Combinations / …). Each row shows the best score and whether it passed.
 */
export function TestCentre({ kanaById, className }: TestCentreProps) {
  const script = useKanaScript()
  const { units } = useLearningPath()

  return (
    <div className={cn('space-y-6', className)}>
      {script.groups.map((group) => {
        const groupUnits = unitsOfGroup(script, group.id)
        const headingId = `quizzes-${group.id}`
        return (
          <section key={group.id} aria-labelledby={headingId}>
            <h3 id={headingId} className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-on-surface">
              {group.title}
              <span className="text-xs font-normal tabular-nums text-on-surface-variant">
                {groupUnits.length} {groupUnits.length === 1 ? 'unit' : 'units'}
              </span>
            </h3>
            <ul className={TESTS_LIST}>
              {groupUnits.map((unit) => {
                const progress = units[unit.id]
                const number = script.units.indexOf(unit) + 1
                const preview = kanaPreview(unitKana(unit, kanaById))
                return (
                  <li key={unit.id}>
                    <TestsRow
                      to={`${script.basePath}/quiz/${unit.id}`}
                      leading={number}
                      title={
                        <>
                          <span className="sr-only">Unit {number}: </span>
                          <JaText text={unit.title} />
                        </>
                      }
                      detail={
                        <>
                          <span lang="ja" className="font-jp">
                            {preview.text}
                            {preview.truncated && '…'}
                          </span>
                          {` · ${unit.kanaIds.length} kana`}
                        </>
                      }
                      best={progress?.quizBest}
                      passed={Boolean(progress?.quizPassedAt)}
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
