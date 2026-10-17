import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { UnitStep } from '@/types/learningPath'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { groupOfUnit } from '@/lib/content/kana/scripts'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaSections } from '@/hooks/useKanaSections'
import { useLearningPathStore, useUnitSteps } from '@/hooks/useLearningPath'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { VideoEmbed } from '@/components/learn/VideoEmbed'
import { UnitHeader } from '@/components/learn/UnitHeader'
import { UnitStepItem } from '@/components/learn/UnitStepItem'
import { UnitLearnGrid } from '@/components/learn/UnitLearnGrid'
import { UnitPrintButton } from '@/components/learn/UnitPrintButton'
import { UnitQuizPanel } from '@/components/learn/UnitQuizPanel'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { JaText } from '@/components/learn/JaText'
import { unitKana } from '@/components/learn/unitStatus'
import { isKanaMark } from '@/lib/content/kana/kanaMarks'
import { PracticeModeList } from '@/components/sections/KanaChart/PracticeModeList'

const STEP_TITLE: Record<UnitStep, string> = {
  watch: 'Watch',
  learn: 'Learn',
  practise: 'Practise',
  print: 'Print',
  quiz: 'Quiz',
}

const STEP_DESCRIPTION: Record<UnitStep, string> = {
  watch: 'A short video lesson on this row.',
  learn: 'Open each character: hear it, see the strokes, trace it.',
  practise: 'Pick any mode. Each session only uses this unit’s kana.',
  print: 'Tracing sheet + mini test, A4.',
  quiz: 'A quick check on this unit. Pass it to tick the unit off.',
}

const SHELL = 'pt-nav pb-24 px-4 sm:px-6 max-w-3xl mx-auto'

/** /kana/<script>/unit/:unitId — one unit of the script's guided path. */
export function KanaUnitPage() {
  const script = useKanaScript()
  const { unitId } = useParams<{ unitId: string }>()
  const index = script.units.findIndex((u) => u.id === unitId)
  if (index < 0) return <Navigate to={script.basePath} replace />
  const unit = script.units[index]
  // Keyed so switching unit (prev/next) starts fresh: closed sheet, top of page.
  return <UnitView key={unit.id} unit={unit} index={index} />
}

interface UnitViewProps {
  unit: KanaUnit
  index: number
}

function UnitView({ unit, index }: UnitViewProps) {
  const script = useKanaScript()
  const path = useLearningPathStore()
  const { steps, done, completed, skipped } = useUnitSteps(unit)
  const [undone, setUndone] = useState(false)
  const { sections, isLoading, error, refetch } = useKanaSections()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const kanaById = useMemo(
    () => new Map((sections ?? []).flatMap((s) => s.chars).filter((c) => !c.isEmpty).map((c) => [c.id, c])),
    [sections],
  )
  const kana = useMemo(() => unitKana(unit, kanaById), [kanaById, unit])

  const prev = script.units[index - 1]
  const next = script.units[index + 1]
  // Hiragana units outside the basic rows spell few real words, so word builder has little to
  // work with. Katakana's loanwords ('extended' tier) cover every unit.
  const nonBasic = groupOfUnit(script, unit.id) !== 'basic' && !script.practiceWords.some((w) => w.tier === 'extended')

  if (isLoading) {
    return (
      <main className={SHELL}>
        <LoadingState label="Loading unit…">
          <div className="space-y-4 pt-6">
            <SkeletonBlock className="h-4 w-28 rounded-xl" />
            <SkeletonBlock className="h-10 w-56 rounded-xl" />
            <SkeletonBlock className="h-5 w-full max-w-md rounded-xl" />
            <div className="grid grid-cols-5 gap-2 pt-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="aspect-[8/11] rounded-xl" />
              ))}
            </div>
          </div>
        </LoadingState>
      </main>
    )
  }

  if (error || kana.length === 0) {
    return (
      <main className={SHELL}>
        <ErrorState message="We couldn't load this unit's kana." onRetry={refetch} />
      </main>
    )
  }

  const body: Record<UnitStep, () => JSX.Element | null> = {
    watch: () =>
      unit.youtubeId ? (
        <VideoEmbed
          youtubeId={unit.youtubeId}
          title={`${unit.title} video lesson`}
          credit={unit.videoCredit}
          onPlay={() => path.markWatched(unit.id)}
        />
      ) : null,
    learn: () =>
      kana.some(isKanaMark) ? (
        <>
          <UnitLearnGrid kana={kana} onLearned={() => path.markTraced(unit.id)} />
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-on-surface-variant">
            Neither mark has a sound of its own. <JaText text="ー" /> doubles the vowel before it (<JaText text="コーヒー" />, koohii); small{' '}
            <JaText text="ッ" /> doubles the next consonant (<JaText text="ベッド" />, beddo). The quiz checks them with real loanwords.
          </p>
        </>
      ) : (
        <UnitLearnGrid kana={kana} onLearned={() => path.markTraced(unit.id)} />
      ),
    practise: () => (
      <LearnerOnly>
        <PracticeModeList
          unitId={unit.id}
          layout="narrow"
          hints={nonBasic ? { build: 'Best for the basic rows' } : undefined}
        />
      </LearnerOnly>
    ),
    print: () => <UnitPrintButton unit={unit} kana={kana} />,
    quiz: () => (
      <LearnerOnly>
        <UnitQuizPanel unit={unit} />
      </LearnerOnly>
    ),
  }

  return (
    <main className={SHELL}>
      <UnitHeader
        unit={unit}
        index={index + 1}
        total={script.units.length}
        prev={prev}
        next={next}
        steps={steps}
        done={done}
        completed={completed}
        kanaById={kanaById}
      />

      {skipped && (
        <div className="-mt-4 mb-10 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-secondary-container px-4 py-2 text-sm text-on-secondary-container md:-mt-6">
          <span aria-hidden className="flex">
            <Icon name="verified" className="text-lg" />
          </span>
          <p className="min-w-0 flex-1 py-2 font-medium">
            You tested out of this unit. You can still go through the steps.
          </p>
          <button
            type="button"
            onClick={() => {
              path.undoSkip(unit.id)
              setUndone(true)
            }}
            className="-mx-2 min-h-11 rounded-lg px-2 font-bold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Undo skip
          </button>
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {undone && !skipped ? 'Skip undone. This unit is back in the step-by-step path.' : ''}
      </p>

      <ol aria-label="Steps in this unit">
        {steps.map((step, i) => (
          <UnitStepItem
            key={step}
            id={step}
            number={i + 1}
            title={STEP_TITLE[step]}
            description={STEP_DESCRIPTION[step]}
            done={done[step]}
            isLast={i === steps.length - 1}
          >
            {body[step]()}
          </UnitStepItem>
        ))}
      </ol>

      <Link
        to={next ? `${script.basePath}/unit/${next.id}` : `${script.basePath}/test`}
        className="group mt-12 flex min-h-11 items-center justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-elevation-1 transition duration-200 hover:border-primary/40 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span>
          <span className="block text-xs font-semibold text-on-surface-variant">{next ? 'Next unit' : 'Last step'}</span>
          <span className="mt-0.5 block font-headline text-lg font-bold text-on-surface">
            {next ? <JaText text={next.title} /> : `Final ${script.label.toLowerCase()} test`}
          </span>
        </span>
        <Icon
          name={next ? 'arrow_forward' : 'emoji_events'}
          className="text-2xl text-primary transition-transform motion-safe:group-hover:translate-x-0.5"
        />
      </Link>
    </main>
  )
}
