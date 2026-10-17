import { ChartDownloads } from '@/components/sections/KanaChart/ChartDownloads'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { useLearningPath } from '@/hooks/useLearningPath'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount, unitsOfGroup } from '@/lib/content/kana/scripts'
import { unitKana } from '@/components/learn/unitStatus'
import { Icon } from '@/components/ui/Icon'
import { TestsSection } from '@/components/kanaCourse/TestsSection'
import { DownloadWorksheetRow } from '@/components/kanaCourse/DownloadWorksheetRow'

/**
 * Downloads page (/kana/<script>/downloads): three chart posters and one
 * worksheet per unit. Every PDF is built in the browser on click.
 */
export function KanaDownloadsPage() {
  const script = useKanaScript()
  const { allKana, kanaById } = useKanaCourse()
  const { units } = useLearningPath()

  return (
    <div className="space-y-10 md:space-y-12">
      <TestsSection
        id="posters"
        title="Chart posters"
        description={`All ${scriptKanaCount(script)} ${script.label.toLowerCase()} on one page, with stroke order. Print one and keep it where you'll see it every day.`}
      >
        <ChartDownloads kana={allKana} />
      </TestsSection>

      <TestsSection
        id="worksheets"
        title="Unit worksheets"
        description="One A4 sheet per unit: tracing practice plus a mini test. Downloading one ticks off that unit's Print step."
      >
        <div className="space-y-6">
          {script.groups.map((group) => {
            const headingId = `worksheets-${group.id}`
            const groupUnits = unitsOfGroup(script, group.id)
            return (
              <section key={group.id} aria-labelledby={headingId}>
                <h3 id={headingId} className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-on-surface">
                  {group.title}
                  <span className="text-xs font-normal tabular-nums text-on-surface-variant">
                    {groupUnits.length} {groupUnits.length === 1 ? 'worksheet' : 'worksheets'}
                  </span>
                </h3>
                <ul className="grid gap-2 lg:grid-cols-2 lg:gap-3">
                  {groupUnits.map((unit) => (
                    <DownloadWorksheetRow
                      key={unit.id}
                      unit={unit}
                      number={script.units.indexOf(unit) + 1}
                      kana={unitKana(unit, kanaById)}
                      printed={Boolean(units[unit.id]?.printedAt)}
                    />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </TestsSection>

      <p className="flex max-w-prose items-start gap-2 border-t border-outline-variant/60 pt-4 text-xs leading-relaxed text-on-surface-variant dark:border-outline/40">
        <span aria-hidden className="flex">
          <Icon name="info" className="text-base" />
        </span>
        <span>
          Posters and worksheets are generated in your browser; nothing is uploaded. Stroke data:{' '}
          <a
            href="https://kanjivg.tagaini.net"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-on-surface underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            KanjiVG
          </a>
          , CC BY-SA 3.0.
        </span>
      </p>
    </div>
  )
}
