import { ChartDownloads } from '@/components/sections/KanaChart/ChartDownloads'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { useLearningPath } from '@/hooks/useLearningPath'
import { useKanaScript } from '@/context/KanaScriptContext'
import { scriptKanaCount, unitsOfGroup } from '@/lib/content/kana/scripts'
import { unitKana } from '@/components/learn/unitStatus'
import { Icon } from '@/components/ui/Icon'
import { TestsSection } from '@/components/kanaCourse/TestsSection'
import { DownloadWorksheetRow } from '@/components/kanaCourse/DownloadWorksheetRow'
import { useCourseUnits } from '@/components/kanaCourse/courseUnits'

/**
 * Downloads page (/kana/<script>/downloads): three chart posters and one
 * worksheet per unit. Every PDF is built in the browser on click.
 */
export function KanaDownloadsPage() {
  const script = useKanaScript()
  const { allKana, kanaById } = useKanaCourse()
  const { units: pathUnits } = useLearningPath()
  const { next, units: courseUnits } = useCourseUnits(kanaById)
  const recommended = next ?? courseUnits.find((unit) => !pathUnits[unit.unit.id]?.printedAt) ?? courseUnits[0]
  const printedCount = courseUnits.filter((unit) => Boolean(pathUnits[unit.unit.id]?.printedAt)).length

  return (
    <div className="space-y-10 md:space-y-12">
      {recommended && (
        <section aria-labelledby="print-next-title" className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Recommended for your next study session</p>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
            <div>
              <h2 id="print-next-title" className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
                Print Unit {recommended.number}: {recommended.unit.title}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">Trace the row, then use the mini check when you are offline.</p>
            </div>
            <p className="shrink-0 text-sm tabular-nums text-on-surface-variant">{printedCount} / {courseUnits.length} worksheets saved</p>
          </div>
          <ul className="mt-4 max-w-2xl">
            <DownloadWorksheetRow
              unit={recommended.unit}
              number={recommended.number}
              kana={unitKana(recommended.unit, kanaById)}
              printed={Boolean(pathUnits[recommended.unit.id]?.printedAt)}
            />
          </ul>
        </section>
      )}

      <TestsSection
        id="posters"
        title="Chart posters"
        description={`Choose a daily wall reference, a printer-friendly chart or a colour-in revision sheet. Each includes all ${scriptKanaCount(script)} ${script.label.toLowerCase()} with stroke order.`}
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
                      printed={Boolean(pathUnits[unit.id]?.printedAt)}
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
