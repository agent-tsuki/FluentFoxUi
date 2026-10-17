import { useState } from 'react'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiCourse } from '@/pages/kanjiCourseContext'
import { downloadKanjiUnitWorksheet } from '@/hooks/useKanji'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import type { KanjiUnit } from '@/types/kanji'
import { Icon } from '@/components/ui/Icon'
import { TESTS_LIST } from '@/components/kanaCourse/TestsRow'
import { TestsSection } from '@/components/kanaCourse/TestsSection'
import { cn } from '@/lib/cn'

/** Downloads page of a level (/kanji/<level>/downloads): one trace-and-write worksheet per unit. */
export function KanjiDownloadsPage() {
  const level = useKanjiLevel()
  const { index } = useKanjiCourse()
  return (
    <div className="mx-auto max-w-3xl">
      <TestsSection id="worksheets" title="Unit worksheets" description="A4 sheets: a model with stroke numbers, grey kanji to trace and boxes to write in. Black and grey only, so they print well.">
        <ul className={TESTS_LIST}>
          {index.units.map((unit, i) => (
            <WorksheetRow key={unit.id} unit={unit} number={i + 1} levelTitle={level.title} pdfSlug={level.pdfSlug} onDone={() => getKanjiPath(level.id).markPrinted(unit.id)} />
          ))}
        </ul>
      </TestsSection>
    </div>
  )
}

interface WorksheetRowProps {
  unit: KanjiUnit
  number: number
  levelTitle: string
  pdfSlug: string
  onDone: () => void
}

function WorksheetRow({ unit, number, levelTitle, pdfSlug, onDone }: WorksheetRowProps) {
  const level = useKanjiLevel()
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle')
  const download = async () => {
    setState('busy')
    try {
      await downloadKanjiUnitWorksheet({ level: level.id, levelTitle, pdfSlug, unit, unitNumber: number })
      onDone()
      setState('idle')
    } catch {
      setState('error')
    }
  }
  return (
    <li>
      <button
        type="button"
        onClick={download}
        disabled={state === 'busy'}
        className="group flex min-h-16 w-full items-center gap-3 px-3 py-3 text-left hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-70 sm:gap-4 sm:px-4"
      >
        <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-sm font-bold tabular-nums text-on-surface-variant dark:bg-surface-container-high">
          {number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-on-surface">{unit.title}</span>
          <span className="block text-xs text-on-surface-variant">
            <span lang="ja" className="font-jp">{unit.kanji.join(' ')}</span>
            {state === 'error' && <span className="ml-2 font-semibold text-error">Couldn’t make the PDF. Try again.</span>}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
          <Icon name={state === 'busy' ? 'progress_activity' : 'download'} className={cn('text-xl', state === 'busy' && 'motion-safe:animate-spin')} />
          <span className="hidden sm:inline">{state === 'busy' ? 'Preparing…' : 'PDF'}</span>
        </span>
      </button>
    </li>
  )
}
