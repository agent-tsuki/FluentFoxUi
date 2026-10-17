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

/**
 * Tests page (/kana/<script>/tests): test out (all or per group), the unit
 * quizzes, and the final test + certificate (#certificate). One centred column.
 */
export function KanaTestsPage() {
  const script = useKanaScript()
  const lower = script.label.toLowerCase()
  const { allKana, kanaById } = useKanaCourse()
  const { skipTests, finalTest } = useLearningPath()
  const { unitsDone } = useCourseProgress(allKana)
  const { hash } = useLocation()
  const certificateUnlocked = Boolean(finalTest?.passedAt)

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="mx-auto max-w-3xl space-y-10 md:space-y-12">
      <TestsSection
        id="test-out"
        title="Test out"
        description={`Already know some ${lower}? Units you score ${formatPercent(script.skipPassMark)} or more on are marked done. Undo any time on the unit page.`}
      >
        <TestOutCard
          best={skipTests?.all}
          emphasis={unitsDone === 0 && skipTests?.all === undefined}
          certificateUnlocked={certificateUnlocked}
        />
        <h3 className="mb-2 mt-6 text-sm font-semibold text-on-surface">Or test out one group</h3>
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
      </TestsSection>

      <TestsSection
        id="unit-quizzes"
        title="Unit quizzes"
        description="A quick check on each unit. Passing one ticks off that unit's quiz step. Your best score is kept."
      >
        <TestCentre kanaById={kanaById} />
      </TestsSection>

      <TestsSection
        id="certificate"
        title="Final test & certificate"
        description={`Pass the final test, or test out of all ${lower}, to earn your certificate.`}
      >
        <FinalTestCard />
        {certificateUnlocked ? (
          <CertificatePanel className="mt-4" />
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
            <span aria-hidden className="flex">
              <Icon name="workspace_premium" className="text-lg text-primary" />
            </span>
            Your certificate appears here once you pass.
          </p>
        )}
        <KanaMasterPanel className="mt-6" />
      </TestsSection>
    </div>
  )
}
