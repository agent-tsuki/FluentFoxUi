import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useKanaScript } from '@/context/KanaScriptContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { ContinueCard } from '@/components/kanaCourse/ContinueCard'
import { CurriculumGroup, FinalTestRow } from '@/components/kanaCourse/CurriculumGroup'
import { CourseRail } from '@/components/kanaCourse/CourseRail'
import { useCourseUnits } from '@/components/kanaCourse/courseUnits'
import { TrackLearnBar } from '@/components/learnSession/TrackLearnBar'

/** How long a row stays tinted after arriving via `#unit-<id>`. */
const HIGHLIGHT_MS = 2000

/**
 * Course page (/kana/<script>, the layout's index route): the Continue card,
 * the curriculum (the script's groups + the final test) and the Practice
 * block, with a sticky rail at `lg`. Rendered inside KanaCourseLayout, which
 * supplies the header, the SectionNav and the kana data.
 */
export function KanaCoursePage() {
  const script = useKanaScript()
  const { allKana, kanaById } = useKanaCourse()
  const { byId, next, isFresh, finalTest } = useCourseUnits(kanaById)
  const highlightId = useHashTarget()

  return (
    <>
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
                highlightId={highlightId}
              />
            ))}
            <FinalTestRow result={finalTest} kanaCount={allKana.length} />
          </div>
        </div>
        <CourseRail byId={byId} className="mt-10 lg:mt-0" />
      </div>
      <p className="mt-10 text-xs text-on-surface-variant">Progress is saved to your account when you are signed in; print marks stay on this device.</p>
    </>
  )
}

/**
 * Scrolls to `#unit-<id>` or `#practice` on arrival. A unit row also gets
 * keyboard focus (without scrolling twice) and a ~2 s tint; under reduced
 * motion the jump is instant and the tint has no fade.
 */
function useHashTarget(): string | undefined {
  const { hash } = useLocation()
  const reducedMotion = useReducedMotion()
  const [highlightId, setHighlightId] = useState<string>()

  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return
    const target = document.getElementById(id)
    if (!target) return
    const isUnit = id.startsWith('unit-')
    target.scrollIntoView({ block: isUnit ? 'center' : 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
    if (!isUnit) return
    target.focus({ preventScroll: true })
    setHighlightId(id.slice('unit-'.length))
    const timer = window.setTimeout(() => setHighlightId(undefined), HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
    // Only on arrival / hash change, not when the motion preference flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  return highlightId
}
