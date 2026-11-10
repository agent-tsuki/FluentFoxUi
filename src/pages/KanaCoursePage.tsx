import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useAuth } from '@/context/AuthContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { ContinueCard } from '@/components/kanaCourse/ContinueCard'
import { CurriculumGroup, FinalTestRow } from '@/components/kanaCourse/CurriculumGroup'
import { CourseRail } from '@/components/kanaCourse/CourseRail'
import { useCourseUnits } from '@/components/kanaCourse/courseUnits'
import { UnitAccordionContext } from '@/components/kanaCourse/unitAccordion'
import { useUnitAccordionParams } from '@/hooks/useUnitAccordionParams'
import { UnitQuizDialog } from '@/components/kanaCourse/UnitQuizDialog'
import { SessionDialog } from '@/components/kanaCourse/SessionDialog'
import { isKanaPracticeMode, KanaPracticeSession } from '@/components/practice/KanaPracticeSession'
import { TrackLearnBar } from '@/components/learnSession/TrackLearnBar'

/**
 * Learn page (/kana/<script>/learn): the Continue card and the curriculum (the
 * script's groups + the final test), with a sticky rail at `lg`. Practice is
 * in each unit. A unit opens in place under its row (`?unit=<id>`), and its quiz as
 * a popup on top (`&quiz=1`); the old unit and quiz pages redirect here.
 * Rendered inside KanaCourseLayout, which supplies the header, the SectionNav
 * and the kana data.
 */
export function KanaCoursePage() {
  const script = useKanaScript()
  const { allKana, kanaById } = useKanaCourse()
  const { byId, next, isFresh, finalTest } = useCourseUnits(kanaById)
  const { user } = useAuth()
  const unitIds = useMemo(() => script.units.map((u) => u.id), [script.units])
  const accordion = useUnitAccordionParams(unitIds, isKanaPracticeMode)
  usePracticeHash()

  const quizUnit = accordion.quizId && user ? (script.units.find((u) => u.id === accordion.quizId) ?? null) : null
  const practice = accordion.practice && user ? accordion.practice : null
  const practiceUnit = practice ? script.units.find((u) => u.id === practice.unitId) : undefined

  return (
    <UnitAccordionContext.Provider value={accordion}>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-8 md:space-y-10">
          <ContinueCard next={next} isFresh={isFresh} finalTest={finalTest} kanaCount={allKana.length} />
          <TrackLearnBar track={script.id} />
          <div className="space-y-8">
            {script.groups.map((group) => (
              <CurriculumGroup
                key={group.id}
                group={group}
                units={group.unitIds.flatMap((id) => byId.get(id) ?? [])}
                nextId={next?.unit.id}
              />
            ))}
            <FinalTestRow result={finalTest} kanaCount={allKana.length} />
          </div>
        </div>
        <CourseRail byId={byId} className="mt-10 lg:mt-0" />
      </div>
      <p className="mt-10 text-xs text-ink-muted">Progress is saved to your account when you are signed in; print marks stay on this device.</p>
      <UnitQuizDialog unit={quizUnit} all={allKana} onClose={accordion.closeOverlay} />
      <SessionDialog open={practice !== null} label={practiceUnit ? `${practiceUnit.title} practice` : 'Practice'} onClose={accordion.closeOverlay}>
        {practice && <KanaPracticeSession key={`${practice.unitId}-${practice.mode}`} mode={practice.mode} unitId={practice.unitId} onExit={accordion.closeOverlay} />}
      </SessionDialog>
    </UnitAccordionContext.Provider>
  )
}

/** Scrolls to an in-page anchor (`#…`) on arrival. */
function usePracticeHash() {
  const { hash } = useLocation()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id || id.startsWith('unit-')) return
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
    // Only on arrival / hash change, not when the motion preference flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])
}
