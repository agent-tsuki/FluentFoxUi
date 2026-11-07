import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { KanjiUnit } from '@/types/kanji'
import type { LearningTrack } from '@/types/learn'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useAuth } from '@/context/AuthContext'
import { useKanjiLevelData } from '@/hooks/useKanji'
import { useUnitAccordionParams, type UnitAccordionParams } from '@/hooks/useUnitAccordionParams'
import { UnitAccordionContext } from '@/components/kanaCourse/unitAccordion'
import { SessionDialog } from '@/components/kanaCourse/SessionDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { KanjiUnitQuiz } from '@/components/kanji/KanjiUnitQuiz'
import { KanjiPracticeSession } from '@/components/kanji/KanjiPracticeSession'
import { isKanjiPracticeMode, type KanjiPracticeModeId } from '@/components/kanji/practiceModes'
import { kanjiTrack } from '@/lib/learn/practiceSession'
import { useKanjiCourse } from '@/pages/kanjiCourseContext'
import { Icon } from '@/components/ui/Icon'
import { STICKY_RAIL_TOP } from '@/components/kanaCourse/courseUnits'
import { KanjiTodayCard } from '@/components/kanji/KanjiTodayCard'
import { KanjiCurriculumGroup, KanjiLevelTestRow } from '@/components/kanji/KanjiCurriculum'
import { useKanjiCourseUnits } from '@/components/kanji/kanjiUnits'
import { KANJI_PRACTICE_MODES } from '@/components/kanji/practiceModes'
import { kanjiPracticePath } from '@/lib/content/kanji/levels'
import { cn } from '@/lib/cn'

/**
 * Course page of a kanji level (/kanji/<level>): Today (reviews, new kanji,
 * next unit, forecast), the themed unit groups and the level test, with a
 * Practice rail at `lg`. A unit opens in place under its row (`?unit=<id>`),
 * its quiz and practice modes as popups on top (`&quiz=1`, `&practice=<mode>`),
 * like the kana Learn page; the old unit and quiz pages redirect here.
 * Inside KanjiCourseLayout.
 */
export function KanjiCoursePage() {
  const { index } = useKanjiCourse()
  const { byId, next, isFresh, levelTest } = useKanjiCourseUnits(index)
  const unitIds = useMemo(() => index.units.map((u) => u.id), [index.units])
  const accordion = useUnitAccordionParams(unitIds, isPracticeMode)

  return (
    <UnitAccordionContext.Provider value={accordion}>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-8 md:space-y-10">
          <KanjiTodayCard next={next} isFresh={isFresh} unitCount={index.units.length} levelTest={levelTest} />
          <div className="space-y-8">
            {index.groups.map((group) => (
              <KanjiCurriculumGroup
                key={group.id}
                group={group}
                units={group.unitIds.flatMap((id) => byId.get(id) ?? [])}
                nextId={next?.unit.id}
              />
            ))}
            <KanjiLevelTestRow result={levelTest} kanjiCount={index.rows.length} />
          </div>
        </div>
        <PracticeRail />
      </div>
      <p className="mt-10 text-xs text-on-surface-variant">Progress is saved to your account when you are signed in; print marks stay on this device.</p>
      <UnitOverlays accordion={accordion} />
    </UnitAccordionContext.Provider>
  )
}

const isPracticeMode = (mode: string | null): mode is KanjiPracticeModeId => isKanjiPracticeMode(mode ?? undefined)

/**
 * The open unit's quiz or practice popup. Both need a signed-in learner (the
 * quiz button asks a guest to sign in first); levels the learn API doesn't
 * serve yet say so instead.
 */
function UnitOverlays({ accordion }: { accordion: UnitAccordionParams<KanjiPracticeModeId> }) {
  const level = useKanjiLevel()
  const { index } = useKanjiCourse()
  const { user } = useAuth()
  const [running, setRunning] = useState(false)
  const track = kanjiTrack(level.id)
  const quizUnit = accordion.quizId && user ? index.units.find((u) => u.id === accordion.quizId) : undefined
  const practice = accordion.practice && user ? accordion.practice : null
  const practiceUnit = practice ? index.units.find((u) => u.id === practice.unitId) : undefined

  const comingSoon = (
    <EmptyState
      icon="schedule"
      title={`${level.label} quizzes and practice are coming soon`}
      description="They are saved to your account, and for now that works for N5 kanji."
      actionLabel="Back to the unit"
      onAction={accordion.closeOverlay}
    />
  )

  return (
    <>
      <SessionDialog
        open={Boolean(quizUnit)}
        label={quizUnit ? `${quizUnit.title} quiz` : 'Quiz'}
        onClose={accordion.closeOverlay}
        dismissable={!running}
      >
        {quizUnit &&
          (track ? (
            <QuizLoader
              key={quizUnit.id}
              unit={quizUnit}
              next={index.units[index.units.indexOf(quizUnit) + 1]}
              track={track}
              onExit={accordion.closeOverlay}
              onRunningChange={setRunning}
            />
          ) : (
            comingSoon
          ))}
      </SessionDialog>
      <SessionDialog
        open={practice !== null}
        label={practiceUnit ? `${practiceUnit.title} practice` : 'Practice'}
        onClose={accordion.closeOverlay}
      >
        {practice &&
          (track ? (
            <KanjiPracticeSession
              key={`${practice.unitId}-${practice.mode}`}
              mode={practice.mode}
              track={track}
              unitId={practice.unitId}
              onExit={accordion.closeOverlay}
            />
          ) : (
            comingSoon
          ))}
      </SessionDialog>
    </>
  )
}

interface QuizLoaderProps {
  unit: KanjiUnit
  next?: KanjiUnit
  track: LearningTrack
  onExit: () => void
  onRunningChange: (running: boolean) => void
}

/** Loads every kanji's details (the quiz's answer options) once a quiz opens, then runs it. */
function QuizLoader({ unit, next, track, onExit, onRunningChange }: QuizLoaderProps) {
  const level = useKanjiLevel()
  const { data, error, refetch } = useKanjiLevelData(level.id)
  if (error) return <ErrorState message="We couldn't load this quiz." onRetry={refetch} />
  if (!data) return <LoadingState label="Loading quiz…" className="p-6" />
  return (
    <KanjiUnitQuiz
      unit={unit}
      next={next}
      track={track}
      byChar={data.byChar}
      pool={data.entries}
      onExit={onExit}
      onRunningChange={onRunningChange}
    />
  )
}

function PracticeRail() {
  const level = useKanjiLevel()
  return (
    <aside aria-labelledby="practice-heading" className={cn('mt-10 lg:sticky lg:mt-0', STICKY_RAIL_TOP)}>
      <h2 id="practice-heading" className="font-headline text-lg font-bold text-on-surface">
        Practice
      </h2>
      <p className="mt-1 text-sm text-on-surface-variant">Short rounds over the kanji you have opened.</p>
      <ul className="mt-3 space-y-1">
        {KANJI_PRACTICE_MODES.map((mode) => (
          <li key={mode.id}>
            <Link
              to={kanjiPracticePath(level.id, mode.id)}
              className="group -mx-2 flex min-h-12 items-center gap-3 rounded-xl px-2 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon name={mode.icon} className="text-xl text-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-on-surface">{mode.title}</span>
                <span className="block text-xs text-on-surface-variant">{mode.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
