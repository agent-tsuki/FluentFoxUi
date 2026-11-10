import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useKanaCourse } from '@/pages/kanaCourseContext'
import { useLearningPath } from '@/hooks/useLearningPath'
import { useKanaScript } from '@/context/KanaScriptContext'
import { unitsForScope } from '@/lib/content/kana/scripts'
import { TestCentre } from '@/components/sections/KanaChart/TestCentre'
import { FinalTestCard } from '@/components/sections/KanaChart/FinalTestCard'
import { CertificatePanel } from '@/components/kanaQuiz/CertificatePanel'
import { KanaMasterPanel } from '@/components/kanaQuiz/KanaMasterPanel'
import { Icon } from '@/components/ui/Icon'
import { useCourseProgress } from '@/components/kanaCourse/useCourseProgress'
import { TestOutCard } from '@/components/kanaCourse/TestOutCard'
import { TESTS_LIST, TestsRow } from '@/components/kanaCourse/TestsRow'
import { TestsSection } from '@/components/kanaCourse/TestsSection'
import { GROUP_ICON } from '@/components/kanaCourse/testsGroups'
import { formatPercent } from '@/components/kanaCourse/testsPercent'
import { useCourseUnits } from '@/components/kanaCourse/courseUnits'
import { ActionLink } from '@/components/learn/ActionLink'
import { unitLearnPath } from '@/components/kanaCourse/unitLinks'

/**
 * Check page (/kana/<script>/tests): first orient the learner toward the next
 * sensible action, then offer unit checks, optional test-out and the final test.
 */
export function KanaTestsPage() {
  const script = useKanaScript()
  const lower = script.label.toLowerCase()
  const { allKana, kanaById } = useKanaCourse()
  const { skipTests, finalTest } = useLearningPath()
  const { unitsDone } = useCourseProgress(allKana)
  const { next: nextUnit } = useCourseUnits(kanaById)
  const { hash } = useLocation()
  const certificateUnlocked = Boolean(finalTest?.passedAt)

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  // Phones: one column (next step, unit checks, test out, final test), ordered with `order`.
  // ≥ lg: a grid. Row 1 holds the "Unit checks" title; the unit list (row 2)
  // and test out (row 3) sit on the left, and the rail (next step, final
  // test) starts on row 2 so its top lines up with the first unit list box.
  // The unit-checks section and the rail are `display: contents` where their
  // children need placing on their own.
  return (
    <div className="flex flex-col gap-10 md:gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-0 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <TestsSection
        className="order-2 lg:contents"
        headerClassName="lg:col-start-1 lg:row-start-1"
        bodyClassName="lg:col-start-1 lg:row-start-2 lg:min-w-0"
        id="unit-quizzes"
        title="Unit checks"
        description="A quick check after each Learn unit. Passing one completes that unit’s quiz step; your best score is kept."
      >
        <TestCentre kanaById={kanaById} />
      </TestsSection>

      <TestsSection
        className="order-3 lg:col-start-1 lg:row-start-3 lg:mt-12 lg:min-w-0"
        id="test-out"
        title="Test out"
        description={`Already know some ${lower}? Units you score ${formatPercent(script.skipPassMark)} or more on are marked done. Undo any time on the unit page.`}
      >
        <details className="group rounded-xl bg-surface-raised shadow-elevation-1 p-4 sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span>Already comfortable? Test out of a group or the whole course.</span>
            <Icon name="expand_more" className="text-xl text-ink-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-5">
            <TestOutCard
              best={skipTests?.all}
              emphasis={unitsDone === 0 && skipTests?.all === undefined}
              certificateUnlocked={certificateUnlocked}
            />
            <h3 className="mb-2 mt-6 text-sm font-semibold text-ink">Or test out one group</h3>
            <ul className={TESTS_LIST}>
              {script.groups.map((group) => {
                const units = unitsForScope(script, group.id)
                const kana = units.reduce((n, u) => n + u.kanaIds.length, 0)
                const best = skipTests?.[group.id]
                return (
                  <li key={group.id}>
                    <TestsRow
                      to={`${script.basePath}/skip/${group.id}`}
                      leading={<Icon name={GROUP_ICON[group.id]} className="text-xl" />}
                      title={group.title}
                      detail={`${kana} kana · ${units.length} ${units.length === 1 ? 'unit' : 'units'}`}
                      best={best}
                      passed={best !== undefined && best >= script.skipPassMark}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        </details>
      </TestsSection>

      {/* mt: the unit list's top margin (mt-4) plus its one-line "Basic 46" label (1.25rem line + mb-2). */}
      <div className="contents lg:col-start-2 lg:row-span-3 lg:row-start-2 lg:mt-11 lg:block lg:space-y-10">
        <RecommendedCheck nextUnit={nextUnit} unitsDone={unitsDone} />

        <TestsSection
          className="order-4"
          id="certificate"
          title="Final test & certificate"
          description={`Pass the final test, or test out of all ${lower}, to earn your certificate.`}
        >
          <FinalTestCard />
          {certificateUnlocked ? (
            <CertificatePanel className="mt-4" />
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
              <span aria-hidden className="flex">
                <Icon name="workspace_premium" className="text-lg text-primary" />
              </span>
              Your certificate appears here once you pass.
            </p>
          )}
          <KanaMasterPanel className="mt-6" />
        </TestsSection>
      </div>
    </div>
  )
}

function RecommendedCheck({ nextUnit, unitsDone }: { nextUnit: ReturnType<typeof useCourseUnits>['next']; unitsDone: number }) {
  const script = useKanaScript()
  const isFresh = unitsDone === 0
  const courseFinished = !nextUnit
  const target = courseFinished
    ? `${script.basePath}/test`
    : isFresh
      ? `${script.basePath}/chart`
      : unitLearnPath(script.basePath, nextUnit.unit.id)
  const title = courseFinished
    ? 'You are ready for the final check'
    : isFresh
      ? 'Start with the chart'
      : `Finish Unit ${nextUnit.number}, then check it`
  const body = courseFinished
    ? 'You completed every Learn unit. The final check is your next milestone.'
    : isFresh
      ? 'Explore the first row, hear each sound and open the guided Learn unit when it feels familiar.'
      : 'Short checks work best after you have explored and practised the current row.'
  const action = courseFinished ? 'Open final check' : isFresh ? 'Open chart' : 'Continue learning'

  return (
    <section
      aria-labelledby="recommended-check-title"
      className="order-1 overflow-hidden rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Recommended next</p>
      {/* Side by side on tablets; stacked again in the narrow ≥ lg rail. */}
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch">
        <div className="max-w-xl">
          <h2 id="recommended-check-title" className="font-display text-xl font-bold text-ink sm:text-2xl lg:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
        </div>
        <ActionLink to={target} className="shrink-0 px-4 text-sm lg:w-full">
          {action} <Icon name="arrow_forward" className="text-lg" />
        </ActionLink>
      </div>
    </section>
  )
}
