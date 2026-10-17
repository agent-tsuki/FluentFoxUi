import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { KanjiEntry, KanjiLevelIndex, KanjiUnit } from '@/types/kanji'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { downloadKanjiWorksheet, useKanjiLevelData, useKanjiPath, useKanjiProgress } from '@/hooks/useKanji'
import { getKanjiPath, kanjiUnitSteps } from '@/api/services/kanjiProgressService'
import { KANJI_UNIT_STEPS, type KanjiUnitStep } from '@/lib/content/kanji/courseTypes'
import {
  kanjiLevelPath,
  kanjiLevelTestPath,
  kanjiPracticePath,
  kanjiUnitPath,
  kanjiUnitQuizPath,
} from '@/lib/content/kanji/levels'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { ActionLink } from '@/components/learn/ActionLink'
import { StepProgress } from '@/components/learn/StepProgress'
import { UnitStepItem } from '@/components/learn/UnitStepItem'
import { KanjiLesson } from '@/components/kanji/KanjiLesson'
import { KanjiWriteStep } from '@/components/kanji/KanjiWriteStep'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { KANJI_PRACTICE_MODES } from '@/components/kanji/practiceModes'
import { percent } from '@/components/kanji/kanjiUnits'
import { KanjiDataCredit } from '@/components/kanji/KanjiCourseHeader'
import { cn } from '@/lib/cn'

const STEP_TITLE: Record<KanjiUnitStep, string> = {
  learn: 'Learn',
  write: 'Write',
  practise: 'Practise',
  print: 'Print',
  quiz: 'Quiz',
}

const STEP_DESCRIPTION: Record<KanjiUnitStep, string> = {
  learn: 'Meet each kanji: its meaning, the reading to learn first, a key word and its strokes.',
  write: 'Trace each kanji, then write it with a faded guide, then from memory.',
  practise: 'Pick any mode. Each round only uses this unit’s kanji.',
  print: 'A trace-and-write sheet, A4.',
  quiz: 'Meaning and reading for each kanji. Pass it to tick the unit off and start reviews.',
}

const SHELL = 'mx-auto max-w-3xl px-4 pb-24 pt-nav sm:px-6'

const NAV_LINK = cn(
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-on-surface-variant transition-colors',
  'hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
)

/** /kanji/<level>/unit/:unitId — one unit: Learn → Write → Practise → Print → Quiz. */
export function KanjiUnitPage() {
  const level = useKanjiLevel()
  const { unitId } = useParams<{ unitId: string }>()
  const { data, isLoading, error, refetch } = useKanjiLevelData(level.id)

  if (isLoading) {
    return (
      <main className={SHELL}>
        <LoadingState label="Loading unit…">
          <div className="space-y-4 pt-6">
            <SkeletonBlock className="h-4 w-28 rounded-xl" />
            <SkeletonBlock className="h-10 w-56 rounded-xl" />
            <SkeletonBlock className="h-64 w-full rounded-2xl" />
          </div>
        </LoadingState>
      </main>
    )
  }
  if (error || !data) {
    return (
      <main className={SHELL}>
        <ErrorState message="We couldn't load this unit." onRetry={refetch} />
      </main>
    )
  }
  const index = data.index.units.findIndex((u) => u.id === unitId)
  if (index < 0) return <Navigate to={kanjiLevelPath(level.id)} replace />
  const unit = data.index.units[index]
  return (
    <UnitView
      key={unit.id}
      unit={unit}
      number={index + 1}
      levelIndex={data.index}
      entries={unit.kanji.flatMap((c) => data.byChar.get(c) ?? [])}
    />
  )
}

interface UnitViewProps {
  unit: KanjiUnit
  number: number
  levelIndex: KanjiLevelIndex
  entries: KanjiEntry[]
}

function UnitView({ unit, number, levelIndex, entries }: UnitViewProps) {
  const level = useKanjiLevel()
  const path = useKanjiPath(level.id)
  const progress = useKanjiProgress()
  const store = getKanjiPath(level.id)
  const done = kanjiUnitSteps(unit, path.units[unit.id], progress)
  const completed = KANJI_UNIT_STEPS.filter((s) => done[s]).length
  const skipped = Boolean(path.units[unit.id]?.skippedAt)
  const prev = levelIndex.units[number - 2]
  const next = levelIndex.units[number]

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `Unit ${number}: ${unit.title} · ${level.title} · FoxSensei`
  }, [number, unit.title, level.title])

  const body: Record<KanjiUnitStep, JSX.Element> = {
    learn: <KanjiLesson entries={entries} batchSize={level.batchSize} onFinish={() => document.getElementById('step-write')?.scrollIntoView({ block: 'start' })} />,
    write: <KanjiWriteStep entries={entries} onComplete={() => store.markWritten(unit.id)} />,
    practise: (
      <LearnerOnly>
        <ul className="grid gap-2 sm:grid-cols-2">
          {KANJI_PRACTICE_MODES.map((mode) => (
            <li key={mode.id}>
              <Link
                to={kanjiPracticePath(level.id, mode.id, { unit: unit.id })}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-surface-container-low"
              >
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon name={mode.icon} className="text-xl text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-on-surface">{mode.title}</span>
                  <span className="block text-xs text-on-surface-variant">{mode.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </LearnerOnly>
    ),
    print: <PrintButton unit={unit} number={number} entries={entries} onPrinted={() => store.markPrinted(unit.id)} />,
    quiz: (
      <LearnerOnly>
        <div className="flex flex-wrap items-center gap-4">
          <ActionLink to={kanjiUnitQuizPath(level.id, unit.id)}>
            <Icon name="quiz" className="text-xl" />
            {path.units[unit.id]?.quizBest !== undefined ? 'Retake the quiz' : 'Take the quiz'}
          </ActionLink>
          <p className="text-sm tabular-nums text-on-surface-variant">
            {entries.length * 2} questions · {Math.round(level.unitQuizPassMark * 100)}% to pass
            {path.units[unit.id]?.quizBest !== undefined && ` · best ${percent(path.units[unit.id]?.quizBest ?? 0)}`}
          </p>
        </div>
      </LearnerOnly>
    ),
  }

  return (
    <main className={SHELL}>
      <header className="mb-10 md:mb-14">
        <nav aria-label="Unit navigation" className="-mx-3 mb-6 flex items-center justify-between gap-2">
          <Link to={`${kanjiLevelPath(level.id)}#unit-${unit.id}`} className={NAV_LINK}>
            <Icon name="chevron_left" className="text-xl" />
            {level.title}
          </Link>
          <span className="flex shrink-0 items-center">
            {prev && (
              <Link to={kanjiUnitPath(level.id, prev.id)} className={NAV_LINK} aria-label={`Previous unit: ${prev.title}`}>
                <Icon name="arrow_back" className="text-lg" />
                <span className="hidden sm:inline">{prev.title}</span>
              </Link>
            )}
            {next && (
              <Link to={kanjiUnitPath(level.id, next.id)} className={NAV_LINK} aria-label={`Next unit: ${next.title}`}>
                <span className="hidden sm:inline">{next.title}</span>
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
            )}
          </span>
        </nav>
        <Eyebrow>
          {level.title} · Unit {number} of {levelIndex.units.length}
        </Eyebrow>
        <h1 className="font-headline text-[clamp(2rem,7vw,3rem)] font-extrabold leading-tight tracking-tight text-on-surface">{unit.title}</h1>
        <p lang="ja" className="mt-2 font-jp text-3xl tracking-wider text-on-surface-variant">
          {unit.kanji.join('')}
        </p>
        <p className="mt-3 max-w-prose text-base leading-relaxed text-on-surface-variant">{unit.summary}</p>
        {unit.newParts && unit.newParts.length > 0 && (
          <p className="mt-3 text-sm text-on-surface-variant">
            New parts in this unit: <span lang="ja" className="font-jp text-base text-on-surface">{unit.newParts.join(' ')}</span>
          </p>
        )}
        <StepProgress steps={KANJI_UNIT_STEPS} done={done} completed={completed} className="mt-6 max-w-sm" />
      </header>

      {skipped && (
        <div className="-mt-4 mb-10 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-secondary-container px-4 py-2 text-sm text-on-secondary-container md:-mt-6">
          <Icon name="verified" className="text-lg" />
          <p className="min-w-0 flex-1 py-2 font-medium">You tested out of this unit. You can still go through the steps.</p>
          <button
            type="button"
            onClick={() => store.undoSkip(unit.id)}
            className="-mx-2 min-h-11 rounded-lg px-2 font-bold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Undo skip
          </button>
        </div>
      )}

      <ol aria-label="Steps in this unit">
        {KANJI_UNIT_STEPS.map((step, i) => (
          <UnitStepItem
            key={step}
            id={step}
            number={i + 1}
            title={STEP_TITLE[step]}
            description={STEP_DESCRIPTION[step]}
            done={done[step]}
            isLast={i === KANJI_UNIT_STEPS.length - 1}
          >
            {body[step]}
          </UnitStepItem>
        ))}
      </ol>

      <Link
        to={next ? kanjiUnitPath(level.id, next.id) : kanjiLevelTestPath(level.id)}
        className="group mt-12 flex min-h-11 items-center justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-elevation-1 transition duration-200 hover:border-primary/40 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span>
          <span className="block text-xs font-semibold text-on-surface-variant">{next ? 'Next unit' : 'Last step'}</span>
          <span className="mt-0.5 block font-headline text-lg font-bold text-on-surface">{next ? next.title : `${level.title} level test`}</span>
        </span>
        <Icon name={next ? 'arrow_forward' : 'emoji_events'} className="text-2xl text-primary transition-transform motion-safe:group-hover:translate-x-0.5" />
      </Link>
      <KanjiDataCredit className="mt-10" />
    </main>
  )
}

function PrintButton({ unit, number, entries, onPrinted }: { unit: KanjiUnit; number: number; entries: KanjiEntry[]; onPrinted: () => void }) {
  const level = useKanjiLevel()
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle')
  const download = async () => {
    setState('busy')
    try {
      await downloadKanjiWorksheet({ levelTitle: level.title, pdfSlug: level.pdfSlug, unit, unitNumber: number, entries })
      onPrinted()
      setState('idle')
    } catch {
      setState('error')
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={download} disabled={state === 'busy'} variant="outline" className="flex min-h-11 items-center gap-2 disabled:opacity-60">
        <Icon name={state === 'busy' ? 'progress_activity' : 'picture_as_pdf'} className={cn('text-xl', state === 'busy' && 'motion-safe:animate-spin')} />
        {state === 'busy' ? 'Making your PDF…' : 'Download worksheet'}
      </Button>
      <p role="status" className="text-sm text-on-surface-variant">
        {state === 'error' ? "Couldn't make the PDF. Check your connection and try again." : 'Print it, or tick this step off once you have it.'}
      </p>
      {state !== 'busy' && (
        <button type="button" onClick={onPrinted} className="min-h-11 rounded-xl px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          Mark as done
        </button>
      )}
    </div>
  )
}
