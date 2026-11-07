import { useMemo, type ReactNode } from 'react'
import type { KanaUnit } from '@/lib/content/kana/courseTypes'
import { groupOfUnit } from '@/lib/content/kana/scripts'
import { isKanaMark } from '@/lib/content/kana/kanaMarks'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { useLearningPath, useLearningPathStore, useUnitSteps } from '@/hooks/useLearningPath'
import { Icon } from '@/components/ui/Icon'
import { VideoEmbed } from '@/components/learn/VideoEmbed'
import { UnitLearnGrid } from '@/components/learn/UnitLearnGrid'
import { useUnitWorksheet } from '@/components/learn/UnitPrintButton'
import { UnitStepTabs, type UnitTab } from '@/components/learn/UnitStepTabs'
import type { KanaPracticeMode } from '@/lib/learn/practiceSession'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { unitQuizPath } from './unitLinks'
import { JaText } from '@/components/learn/JaText'
import { unitKana } from '@/components/learn/unitStatus'
import { PracticeModeList } from '@/components/sections/KanaChart/PracticeModeList'

type TabStep = 'watch' | 'learn' | 'practise'

const STEPS: Record<TabStep, { title: string; icon: string; hint: string }> = {
  watch: { title: 'Watch', icon: 'smart_display', hint: 'A short video lesson on this row.' },
  learn: { title: 'Learn', icon: 'gesture', hint: 'Open each character: hear it and watch its strokes.' },
  practise: { title: 'Practise', icon: 'fitness_center', hint: 'Pick any mode. Each session only uses this unit’s kana.' },
}

interface UnitPanelProps {
  unit: KanaUnit
  /** Opens this unit's quiz popup. */
  onStartQuiz: () => void
  /** Opens one practice mode for this unit as a popup. */
  onStartPractice: (mode: KanaPracticeMode) => void
}

/**
 * UnitPanel — one unit's steps under its row on the Learn page, kept short
 * (UnitStepTabs): Watch / Learn / Practise are small tabs whose content swaps
 * in place, opening on the first one not done yet, or on Practise once the
 * unit is finished. Passing the quiz finishes the unit, and practice stays
 * available after. Quiz opens as a popup and Download PDF downloads the
 * worksheet; practice modes open as popups too.
 */
export function UnitPanel({ unit, onStartQuiz, onStartPractice }: UnitPanelProps) {
  const script = useKanaScript()
  const { kanaById } = useKanaCourse()
  const path = useLearningPathStore()
  const { steps: allSteps, done, skipped, complete } = useUnitSteps(unit)
  const kana = useMemo(() => unitKana(unit, kanaById), [kanaById, unit])
  const worksheet = useUnitWorksheet(unit, kana)
  const progress = useLearningPath().units[unit.id]
  // Hiragana units outside the basic rows spell few real words, so word builder has little to
  // work with. Katakana's loanwords ('extended' tier) cover every unit.
  const nonBasic = groupOfUnit(script, unit.id) !== 'basic' && !script.practiceWords.some((w) => w.tier === 'extended')

  const body: Record<TabStep, () => ReactNode> = {
    watch: () =>
      unit.youtubeId ? (
        <VideoEmbed
          youtubeId={unit.youtubeId}
          title={`${unit.title} video lesson`}
          credit={unit.videoCredit}
          onPlay={() => path.markWatched(unit.id)}
        />
      ) : null,
    learn: () => (
      <>
        <UnitLearnGrid kana={kana} onLearned={() => path.markTraced(unit.id)} />
        {kana.some(isKanaMark) && (
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-on-surface-variant">
            Neither mark has a sound of its own. <JaText text="ー" /> doubles the vowel before it (<JaText text="コーヒー" />,
            koohii); small <JaText text="ッ" /> doubles the next consonant (<JaText text="ベッド" />, beddo).
          </p>
        )}
      </>
    ),
    practise: () => (
      <LearnerOnly prompt="inline">
        <PracticeModeList
          unitId={unit.id}
          variant="compact"
          className="sm:grid-cols-3"
          onSelect={onStartPractice}
          hints={nonBasic ? { build: 'Best for basic rows' } : undefined}
        />
      </LearnerOnly>
    ),
  }
  // Quiz and Print are actions (popup, download), not tabs.
  const tabSteps = allSteps.filter((s): s is TabStep => s === 'watch' || s === 'learn' || s === 'practise')
  const tabs: UnitTab<TabStep>[] = tabSteps.map((step) => ({ id: step, ...STEPS[step], done: done[step], render: body[step] }))
  // A finished unit opens on Practise (it stays open to practise); otherwise on the first step not done yet.
  const initial: TabStep = complete ? 'practise' : (tabSteps.find((s) => !done[s]) ?? 'practise')

  return (
    <div className="space-y-4 px-3 pb-3 pt-3 sm:px-5">
      {skipped && (
        <p className="flex items-center gap-2 rounded-xl bg-secondary-container px-3 py-2 text-sm text-on-secondary-container">
          <Icon name="verified" className="text-lg" />
          <span className="min-w-0 flex-1">You tested out of this unit.</span>
          <button
            type="button"
            onClick={() => path.undoSkip(unit.id)}
            className="min-h-10 rounded-lg px-2 font-bold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Undo
          </button>
        </p>
      )}
      <UnitStepTabs
        idPrefix={unit.id}
        label={`${unit.title} steps`}
        tabs={tabs}
        initial={initial}
        quiz={{
          passed: Boolean(progress?.quizPassedAt),
          best: progress?.quizBest,
          onStart: onStartQuiz,
          returnTo: unitQuizPath(script.basePath, unit.id),
        }}
        pdf={allSteps.includes('print') ? { done: done.print, onDownload: worksheet.download } : undefined}
      />
    </div>
  )
}
