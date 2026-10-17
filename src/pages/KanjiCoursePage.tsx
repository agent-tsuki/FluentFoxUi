import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useKanjiCourse } from '@/pages/kanjiCourseContext'
import { Icon } from '@/components/ui/Icon'
import { STICKY_RAIL_TOP } from '@/components/kanaCourse/courseUnits'
import { KanjiTodayCard } from '@/components/kanji/KanjiTodayCard'
import { KanjiCurriculumGroup, KanjiLevelTestRow } from '@/components/kanji/KanjiCurriculum'
import { useKanjiCourseUnits } from '@/components/kanji/kanjiUnits'
import { KANJI_PRACTICE_MODES } from '@/components/kanji/practiceModes'
import { kanjiPracticePath } from '@/lib/content/kanji/levels'
import { cn } from '@/lib/cn'

const HIGHLIGHT_MS = 2000

/**
 * Course page of a kanji level (/kanji/<level>): Today (reviews, new kanji,
 * next unit, forecast), the themed unit groups and the level test, with a
 * Practice rail at `lg`. Inside KanjiCourseLayout.
 */
export function KanjiCoursePage() {
  const { index, chars } = useKanjiCourse()
  const { byId, next, isFresh, levelTest } = useKanjiCourseUnits(index)
  const highlightId = useUnitHashTarget()

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-8 md:space-y-10">
          <KanjiTodayCard chars={chars} next={next} isFresh={isFresh} unitCount={index.units.length} levelTest={levelTest} />
          <div className="space-y-8">
            {index.groups.map((group) => (
              <KanjiCurriculumGroup
                key={group.id}
                group={group}
                units={group.unitIds.flatMap((id) => byId.get(id) ?? [])}
                nextId={next?.unit.id}
                highlightId={highlightId}
              />
            ))}
            <KanjiLevelTestRow result={levelTest} kanjiCount={index.rows.length} />
          </div>
        </div>
        <PracticeRail />
      </div>
      <p className="mt-10 text-xs text-on-surface-variant">Progress is saved in this browser.</p>
    </>
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

/** Scrolls to `#unit-<id>` on arrival (the unit page's back link), focuses and briefly tints the row. */
function useUnitHashTarget(): string | undefined {
  const { hash } = useLocation()
  const reducedMotion = useReducedMotion()
  const [highlightId, setHighlightId] = useState<string>()

  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id.startsWith('unit-')) return
    const target = document.getElementById(id)
    if (!target) return
    target.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' })
    target.focus({ preventScroll: true })
    setHighlightId(id.slice('unit-'.length))
    const timer = window.setTimeout(() => setHighlightId(undefined), HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
    // Only on arrival / hash change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash])

  return highlightId
}
