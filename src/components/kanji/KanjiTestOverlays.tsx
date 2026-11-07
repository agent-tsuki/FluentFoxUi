import { lazy, Suspense, useCallback, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useKanjiLevel } from '@/context/KanjiLevelContext'
import { useKanjiLevelData } from '@/hooks/useKanji'
import { learnService } from '@/api/services/learnService'
import { kanjiTrack } from '@/lib/learn/practiceSession'
import { TRACK_LABEL } from '@/lib/learn/paths'
import type { LearningTrack } from '@/types/learn'
import { SessionDialog } from '@/components/kanaCourse/SessionDialog'
import { LearnerOnly } from '@/components/auth/SignInPrompt'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { LearnSessionScreen } from '@/components/learnSession/LearnSessionScreen'
import { KANJI_OVERLAY_PARAMS } from './kanjiOverlays'

// The tests load when one opens, not with the course pages.
const SkipTest = lazy(() => import('@/pages/KanjiTestPages').then((m) => ({ default: m.SkipTest })))
const LevelTest = lazy(() => import('@/pages/KanjiTestPages').then((m) => ({ default: m.LevelTest })))

/**
 * The test-out, level test and lesson popups of a kanji level (see
 * kanjiOverlays), shown over whichever tab opened them. Each needs a verified
 * learner (others get the sign-in prompt inside the popup); a test can't be
 * closed by clicking outside while its questions are being answered.
 */
export function KanjiTestOverlays() {
  const level = useKanjiLevel()
  const [params, setParams] = useSearchParams()
  const [running, setRunning] = useState(false)
  const track = kanjiTrack(level.id)
  const skip = params.get(KANJI_OVERLAY_PARAMS.skip)
  const levelTest = params.get(KANJI_OVERLAY_PARAMS.test) === 'level'
  const lesson = params.get(KANJI_OVERLAY_PARAMS.lesson) !== null

  const close = useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const name of Object.values(KANJI_OVERLAY_PARAMS)) next.delete(name)
        return next
      },
      { replace: true },
    )
  }, [setParams])

  const body = (content: (track: LearningTrack) => ReactNode) => (
    <LearnerOnly prompt="inline">
      {track ? (
        content(track)
      ) : (
        <EmptyState
          icon="schedule"
          title={`${level.label} tests and lessons are coming soon`}
          description="They are saved to your account, and for now that works for N5 kanji."
          actionLabel="Back"
          onAction={close}
        />
      )}
    </LearnerOnly>
  )

  return (
    <>
      <SessionDialog open={skip !== null} label="Test out" onClose={close} dismissable={!running}>
        {skip !== null && body((t) => <SkipTestLoader key={skip} scope={skip} track={t} onExit={close} onRunningChange={setRunning} />)}
      </SessionDialog>
      <SessionDialog open={levelTest} label={`${level.title} level test`} onClose={close} dismissable={!running}>
        {levelTest && body((t) => <LevelTestLoader track={t} onExit={close} onRunningChange={setRunning} />)}
      </SessionDialog>
      <SessionDialog open={lesson} label={`New ${level.label} kanji`} onClose={close}>
        {lesson && body((t) => <Lesson track={t} onExit={close} />)}
      </SessionDialog>
    </>
  )
}

interface TestLoaderProps {
  track: LearningTrack
  onExit: () => void
  onRunningChange: (running: boolean) => void
}

/** The level's kanji details (the questions' options), then the test-out of `scope` ('all' or a group). */
function SkipTestLoader({ scope, track, onExit, onRunningChange }: TestLoaderProps & { scope: string }) {
  const level = useKanjiLevel()
  const { data, error, refetch } = useKanjiLevelData(level.id)
  if (error) return <ErrorState message="We couldn't load this test." onRetry={refetch} />
  if (!data) return <LoadingState label="Loading test…" className="p-6" />
  const group = scope === 'all' ? undefined : data.index.groups.find((g) => g.id === scope)
  if (scope !== 'all' && !group) {
    return <EmptyState icon="search_off" title="This test isn't here" description="Its group may have moved." actionLabel="Back" onAction={onExit} />
  }
  return (
    <Suspense fallback={<LoadingState label="Loading test…" className="p-6" />}>
      <SkipTest
        scope={scope}
        track={track}
        title={group ? `Test out: ${group.title}` : `Test out of ${level.label}`}
        index={data.index}
        unitIds={group ? group.unitIds : data.index.units.map((u) => u.id)}
        byChar={data.byChar}
        pool={data.entries}
        onExit={onExit}
        onRunningChange={onRunningChange}
      />
    </Suspense>
  )
}

function LevelTestLoader({ track, onExit, onRunningChange }: TestLoaderProps) {
  const level = useKanjiLevel()
  const { data, error, refetch } = useKanjiLevelData(level.id)
  if (error) return <ErrorState message="We couldn't load the level test." onRetry={refetch} />
  if (!data) return <LoadingState label="Loading test…" className="p-6" />
  return (
    <Suspense fallback={<LoadingState label="Loading test…" className="p-6" />}>
      <LevelTest track={track} byChar={data.byChar} entries={data.entries} onExit={onExit} onRunningChange={onRunningChange} />
    </Suspense>
  )
}

/** A lesson on the learn API (the next new kanji, then a check quiz), as on /learn/lesson/kanji_n5. */
function Lesson({ track, onExit }: { track: LearningTrack; onExit: () => void }) {
  const [round, setRound] = useState(0)
  const start = useCallback(() => learnService.startLesson({ track }), [track])
  return (
    <LearnSessionScreen
      key={round}
      title={`New ${TRACK_LABEL[track]}`}
      start={start}
      emptyTitle="Nothing new right now"
      emptyDescription="You have used today's new items for this track, or finished it. Reviews keep what you learned fresh."
      onExit={onExit}
      againLabel="Learn more"
      onAgain={() => setRound((r) => r + 1)}
    />
  )
}
