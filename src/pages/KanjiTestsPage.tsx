import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiCourse } from '@/pages/kanjiCourseContext'
import { downloadKanjiCertificate } from '@/hooks/useKanji'
import { getKanjiPath } from '@/api/services/kanjiProgressService'
import { kanjiLevelTestPath, kanjiSkipPath, kanjiUnitQuizPath } from '@/lib/content/kanji/levels'
import { Icon } from '@/components/ui/Icon'
import { TESTS_LIST, TestsRow } from '@/components/kanaCourse/TestsRow'
import { TestsSection } from '@/components/kanaCourse/TestsSection'
import { formatPercent } from '@/components/kanaCourse/testsPercent'
import { CertificateNameForm } from '@/components/kanaQuiz/CertificateNameForm'
import { useKanjiCourseUnits } from '@/components/kanji/kanjiUnits'
import { levelTestMeta } from '@/components/kanji/KanjiCurriculum'

/**
 * Tests page of a level (/kanji/<level>/tests): test out (whole level or a
 * group), the unit quizzes, and the level test + certificate (#certificate).
 */
export function KanjiTestsPage() {
  const level = useKanjiLevel()
  const { index } = useKanjiCourse()
  const { units, byId, skipTests, levelTest } = useKanjiCourseUnits(index)
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="mx-auto max-w-3xl space-y-10 md:space-y-12">
      <TestsSection
        id="test-out"
        title="Test out"
        description={`Already know some ${level.label} kanji? Units you score ${formatPercent(level.skipPassMark)} or more on are marked done, and their kanji still come back in reviews now and then. Undo any time on the unit page.`}
      >
        <ul className={TESTS_LIST}>
          <li>
            <TestsRow
              to={kanjiSkipPath(level.id, 'all')}
              leading={<Icon name="bolt" className="text-xl" />}
              title={`All of ${level.label}`}
              detail={`${index.rows.length} kanji · ${index.units.length} units`}
              best={skipTests.all}
              passed={skipTests.all !== undefined && skipTests.all >= level.skipPassMark}
            />
          </li>
          {index.groups.map((group) => {
            const kanji = group.unitIds.reduce((n, id) => n + (byId.get(id)?.unit.kanji.length ?? 0), 0)
            const best = skipTests[group.id]
            return (
              <li key={group.id}>
                <TestsRow
                  to={kanjiSkipPath(level.id, group.id)}
                  leading={<Icon name="checklist" className="text-xl" />}
                  title={group.title}
                  detail={`${kanji} kanji · ${group.unitIds.length} ${group.unitIds.length === 1 ? 'unit' : 'units'}`}
                  best={best}
                  passed={best !== undefined && best >= level.skipPassMark}
                />
              </li>
            )
          })}
        </ul>
      </TestsSection>

      <TestsSection id="unit-quizzes" title="Unit quizzes" description="Meaning and reading for each kanji of a unit. Passing one ticks off that unit's quiz step. Your best score is kept.">
        <ul className={TESTS_LIST}>
          {units.map((u) => (
            <li key={u.unit.id}>
              <TestsRow
                to={kanjiUnitQuizPath(level.id, u.unit.id)}
                leading={u.number}
                title={u.unit.title}
                detail={<span lang="ja" className="font-jp">{u.unit.kanji.join(' ')}</span>}
                best={u.quizBest}
                passed={u.done.quiz}
              />
            </li>
          ))}
        </ul>
      </TestsSection>

      <TestsSection id="certificate" title="Level test & certificate" description={`${levelTestMeta(level, index.rows.length)}. Pass it to earn your ${level.title} certificate.`}>
        <ul className={TESTS_LIST}>
          <li>
            <TestsRow
              to={kanjiLevelTestPath(level.id)}
              leading={<Icon name="emoji_events" className="text-xl" />}
              title={`${level.title} level test`}
              detail={`${level.levelTest.questions} questions · ${level.levelTest.minutes} min`}
              best={levelTest?.best}
              passed={Boolean(levelTest?.passedAt)}
            />
          </li>
        </ul>
        {levelTest?.passedAt ? (
          <section aria-labelledby="certificate-title" className="mt-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5">
            <div className="flex items-start gap-3">
              <Icon name="verified" filled className="text-3xl text-primary" />
              <div>
                <h3 id="certificate-title" className="font-headline text-lg font-bold text-on-surface">
                  {level.certificateTitle}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Passed on {new Date(levelTest.passedAt).toLocaleDateString(undefined, { dateStyle: 'long' })} · best score {formatPercent(levelTest.best)}
                </p>
              </div>
            </div>
            <CertificateNameForm
              initialName={levelTest.certificateName ?? ''}
              onSaveName={(name) => getKanjiPath(level.id).setCertificateName(name)}
              onDownload={(name) =>
                downloadKanjiCertificate({
                  title: level.certificateTitle,
                  levelLabel: level.label,
                  kanjiCount: index.rows.length,
                  pdfSlug: level.pdfSlug,
                  name,
                  score: levelTest.best,
                  date: new Date(levelTest.passedAt ?? Date.now()),
                })
              }
              downloadLabel="Download certificate (PDF)"
            />
            <p className="mt-2 text-xs text-on-surface-variant">A FoxSensei course certificate, not an official JLPT result.</p>
          </section>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm text-on-surface-variant">
            <Icon name="workspace_premium" className="text-lg text-primary" />
            Your certificate appears here once you pass.
          </p>
        )}
      </TestsSection>
    </div>
  )
}
