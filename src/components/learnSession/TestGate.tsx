import type { LearnTest } from '@/hooks/useLearnTest'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PracticeShell } from '@/components/practice/PracticeShell'

interface TestGateProps {
  test: LearnTest
  /** Questions built from the session. */
  questionCount: number
  title: string
  onExit: () => void
}

/**
 * The states of a learn API test around its questions: starting, could not
 * start, nothing to ask, checking the answers, could not check them.
 */
export function TestGate({ test, questionCount, title, onExit }: TestGateProps) {
  const { check, session, startFailed, recorder } = test
  let body
  if (startFailed) body = <ErrorState message="We couldn't start this test." onRetry={recorder.retry} />
  else if (!session || recorder.status === 'starting') body = <LoadingState label="Preparing your test…" />
  else if (check.state === 'error') body = <ErrorState message="We couldn't check your answers." onRetry={test.retryCheck} />
  else if (check.state !== 'idle') body = <LoadingState label="Checking your answers…" />
  else if (questionCount === 0) body = <EmptyState icon="quiz" title="Nothing to test here yet" actionLabel="Back" onAction={onExit} />
  else body = <LoadingState label="Preparing your test…" />
  return (
    <PracticeShell title={title} onExit={onExit}>
      {body}
    </PracticeShell>
  )
}
