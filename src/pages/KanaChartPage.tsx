import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { KanaChar, KanaSection } from '@/types'
import type { KanaMastery } from '@/types/kanaProgress'
import { useKanaMastery } from '@/hooks/useKanaProgress'
import { RowCelebration } from '@/components/sections/KanaChart/RowCelebration'
import { useRowCelebration } from '@/components/sections/KanaChart/useRowCelebration'
import { ChartGrid } from '@/components/sections/KanaChart/ChartGrid'
import {
  ChartToolbar,
  type ChartSet,
  type ChartSetOption,
} from '@/components/sections/KanaChart/ChartToolbar'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Icon } from '@/components/ui/Icon'
import { ChartStudyPanel } from '@/components/kanaCourse/ChartStudyPanel'
import { useCourseUnits } from '@/components/kanaCourse/courseUnits'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { useKanaScript } from '@/context/KanaScriptContext'
import type { KanaChartMarks, KanaMarkPair, KanaScriptConfig } from '@/lib/content/kana/scripts'

// The sheet (audio, stroke tracing, example word) only loads on first tap.
const KanaDetailSheet = lazy(() =>
  import('@/components/kana').then((m) => ({ default: m.KanaDetailSheet })),
)

const EMPTY_CHARS: KanaChar[] = []

interface ChartSetView {
  /** `?set=` value. */
  set: ChartSet
  label: string
  title: string
  section: KanaSection
}

/**
 * One switcher option per data section, in data order. Labels and `?set=`
 * values come from the script's `chartSets` (so old links keep working);
 * a section without an entry uses its own id and title.
 */
function chartSetsFor(script: KanaScriptConfig, sections: KanaSection[]): ChartSetView[] {
  return sections.map((section) => {
    const def = script.chartSets.find((d) => d.sectionId === section.id)
    return def
      ? { set: def.param, label: def.label, title: def.title, section }
      : { set: section.id, label: section.title, title: section.title, section }
  })
}

function readHideRomaji(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeHideRomaji(key: string, hide: boolean) {
  try {
    if (hide) localStorage.setItem(key, '1')
    else localStorage.removeItem(key)
  } catch {
    /* storage blocked: the toggle still works for this visit */
  }
}

const realCount = (section: KanaSection) => section.chars.filter((c) => !c.isEmpty).length

/** Returns focus to the chart cell of the kana that was last open. */
function focusCard(id: string) {
  window.setTimeout(() => {
    document.querySelector<HTMLElement>(`[data-kana-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true })
  }, 0)
}

function PairList({ pairs }: { pairs: readonly KanaMarkPair[] }) {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {pairs.map((p) => (
        <li key={p.to} className="flex items-baseline gap-3">
          <span className="whitespace-nowrap font-jp text-2xl font-bold text-on-surface lg:text-3xl" lang="ja">
            {p.from}
            <span aria-hidden className="mx-1.5 font-body text-base font-normal text-on-surface-variant">
              →
            </span>
            <span className="sr-only"> becomes </span>
            {p.to}
          </span>
          <span className="text-xs font-semibold tabular-nums text-on-surface-variant">{p.sound}</span>
        </li>
      ))}
    </ul>
  )
}

/** Matches the Dakuten table width at ≥ lg; stacks under it on phones. */
function MarksAside({ marks, basePath }: { marks: KanaChartMarks; basePath: string }) {
  const [rareA, rareB, commonA, commonB] = marks.rareNote
  return (
    <aside
      aria-labelledby="chart-marks-title"
      data-chart-aside
      className="flex self-start flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 dark:border-outline/60 dark:bg-surface-container-low"
    >
      <h3 id="chart-marks-title" className="font-headline text-base font-bold text-on-surface">
        How the marks work
      </h3>
      <div>
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">Dakuten</span>, two short strokes at the top right, voices
          the sound.
        </p>
        <PairList pairs={marks.dakutenPairs} />
      </div>
      <div>
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">Handakuten</span>, a small circle, only goes on the h row
          and turns it into p.
        </p>
        <PairList pairs={marks.handakutenPairs} />
      </div>
      <p className="flex items-start gap-2 text-sm text-on-surface-variant">
        <span aria-hidden className="flex text-primary">
          <Icon name="info" className="text-lg" />
        </span>
        <span>
          <span lang="ja" className="font-jp">{rareA}</span> and <span lang="ja" className="font-jp">{rareB}</span> are rare.
          Most words use <span lang="ja" className="font-jp">{commonA}</span> and <span lang="ja" className="font-jp">{commonB}</span>,
          which sound the same.
        </span>
      </p>
      <Link
        to={`${basePath}/unit/${marks.unitId}`}
        className="mt-auto inline-flex min-h-11 items-center gap-0.5 self-start rounded-lg text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        Learn them in the Dakuten unit
        <span aria-hidden className="flex">
          <Icon name="chevron_right" className="text-lg" />
        </span>
      </Link>
    </aside>
  )
}

/**
 * Chart page (/kana/<script>/chart): every kana, tap for the detail sheet.
 * Rendered inside KanaCourseLayout (header, nav and kana data via
 * useKanaCourse). `?set=` picks the visible set (Basic by default).
 */
export function KanaChartPage() {
  const script = useKanaScript()
  const { sections } = useKanaCourse()
  const [searchParams, setSearchParams] = useSearchParams()

  const chartSets = useMemo(() => chartSetsFor(script, sections), [script, sections])
  const rawSet = searchParams.get('set')
  // A chart is less intimidating when it opens on the first teachable set;
  // "All" remains one tap away for learners using it as a reference.
  const defaultSet = chartSets[0]?.set ?? 'all'
  const isKnownSet = rawSet === 'all' || chartSets.some((c) => c.set === rawSet)
  const set: ChartSet = isKnownSet && rawSet ? rawSet : defaultSet

  const hideRomajiKey = script.storageKeys.hideRomaji
  const [hideRomaji, setHideRomaji] = useState(() => readHideRomaji(hideRomajiKey))
  const toggleRomaji = useCallback(() => {
    setHideRomaji((h) => {
      writeHideRomaji(hideRomajiKey, !h)
      return !h
    })
  }, [hideRomajiKey])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Keep the sheet mounted after first open so it can animate out on close.
  const [sheetRequested, setSheetRequested] = useState(false)

  const options = useMemo<ChartSetOption[]>(
    () => [
      { value: 'all', label: 'All' },
      ...chartSets.map((c) => ({ value: c.set, label: c.label, count: realCount(c.section) })),
    ],
    [chartSets],
  )

  const visibleSets = useMemo(() => chartSets.filter((c) => set === 'all' || c.set === set), [chartSets, set])

  // Prev/next walk the visible kana in visual (gojūon) order, the same order
  // as the DOM and Tab: down each consonant column, then the next set.
  const visibleKana = useMemo(
    () => visibleSets.flatMap((c) => c.section.chars.filter((ch) => !ch.isEmpty)),
    [visibleSets],
  )

  const kanaById = useMemo(
    () => new Map(sections.flatMap((section) => section.chars).filter((char) => !char.isEmpty).map((char) => [char.id, char])),
    [sections],
  )
  const { next: nextUnit, units: courseUnits } = useCourseUnits(kanaById)
  const unitsDone = courseUnits.filter((unit) => unit.complete).length

  const mastery = useKanaMastery()
  const basicChars = sections.find((s) => s.id === 'basic')?.chars ?? EMPTY_CHARS
  const celebration = useRowCelebration(basicChars, mastery, script.storageKeys.rowsCelebrated)

  const counts = useMemo(() => {
    const c: Record<KanaMastery, number> = { new: 0, learning: 0, familiar: 0, strong: 0, mastered: 0 }
    for (const ch of visibleKana) c[mastery(ch.id)] += 1
    return c
  }, [visibleKana, mastery])

  const changeSet = useCallback(
    (next: ChartSet) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set('set', next)
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const select = useCallback((char: KanaChar) => {
    setSelectedId(char.id)
    setSheetRequested(true)
  }, [])

  const selectedIndex = selectedId ? visibleKana.findIndex((c) => c.id === selectedId) : -1
  const selected = selectedIndex >= 0 ? visibleKana[selectedIndex] : null
  const prev = selectedIndex > 0 ? visibleKana[selectedIndex - 1] : undefined
  const next = selectedIndex >= 0 && selectedIndex < visibleKana.length - 1 ? visibleKana[selectedIndex + 1] : undefined

  const closeSheet = useCallback(() => {
    if (selectedId) focusCard(selectedId)
    setSelectedId(null)
  }, [selectedId])
  const goPrev = useCallback(() => {
    if (prev) setSelectedId(prev.id)
  }, [prev])
  const goNext = useCallback(() => {
    if (next) setSelectedId(next.id)
  }, [next])

  return (
    <section aria-label={`${script.label} chart`}>
      <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
        Start with one row, tap a kana to hear it and see its strokes, then continue into a short Learn unit.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <ChartToolbar
            options={options}
            value={set}
            onChange={changeSet}
            counts={counts}
            hideRomaji={hideRomaji}
            onToggleRomaji={toggleRomaji}
            downloadsTo={`${script.basePath}/downloads`}
          />

          <div className="mt-8 flex flex-col gap-12 lg:gap-14">
            {visibleSets.map((c) => (
              <ChartGrid
                key={c.set}
                section={c.section}
                title={c.title}
                mastery={mastery}
                showRomaji={!hideRomaji}
                onSelect={select}
                aside={script.chartMarks?.sectionId === c.section.id ? <MarksAside marks={script.chartMarks} basePath={script.basePath} /> : undefined}
              />
            ))}
          </div>
        </div>

        <ChartStudyPanel
          basePath={script.basePath}
          next={nextUnit}
          unitsDone={unitsDone}
          unitsTotal={courseUnits.length}
          masteredInView={counts.mastered}
          kanaInView={visibleKana.length}
        />
      </div>

      <RowCelebration message={celebration.message} onDismiss={celebration.dismiss} />

      {sheetRequested && (
        // If the sheet chunk fails to load, the chart keeps working without it.
        <ErrorBoundary fallback={<span hidden />}>
          <Suspense fallback={null}>
            <KanaDetailSheet
              char={selected}
              onClose={closeSheet}
              onPrev={prev ? goPrev : undefined}
              onNext={next ? goNext : undefined}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </section>
  )
}
