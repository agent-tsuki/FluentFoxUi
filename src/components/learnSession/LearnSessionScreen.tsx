import { useState } from 'react'
import { resolveErrorMessage } from '@/api/errors'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { useLearnSession } from '@/hooks/useLearnSession'
import type { SessionStart } from '@/types/learn'
import { LessonCards } from './LessonCards'
import { SessionQuestion } from './SessionQuestion'
import { SessionResultView } from './SessionResultView'

interface LearnSessionScreenProps {
  title: string
  start: () => Promise<SessionStart>
  emptyTitle: string
  emptyDescription: string
  onExit: () => void
  /** Offered on the result screen, e.g. "Review more". Remounts the screen with a new session. */
  againLabel?: string
  onAgain?: () => void
}

/** A lesson or review session from start to result, inside the practice frame. */
export function LearnSessionScreen({ title, start, emptyTitle, emptyDescription, onExit, againLabel, onAgain }: LearnSessionScreenProps) {
  const session = useLearnSession(start)
  const [cardIndex, setCardIndex] = useState(0)
  const { phase, entries, index, entry } = session

  if (phase === 'learn') {
    const total = session.items.length
    return (
      <PracticeShell title={title} progress={cardIndex / Math.max(1, total)} status={`${cardIndex + 1} / ${total}`} onExit={onExit}>
        <LessonCards items={session.items} onDone={session.startQuiz} onProgress={setCardIndex} />
      </PracticeShell>
    )
  }
  if (phase === 'quiz' && entry) {
    return (
      <PracticeShell title={title} progress={index / entries.length} status={`${index + 1} / ${entries.length}`} onExit={onExit}>
        <SessionQuestion key={entry.key} entry={entry} mark={session.mark} isLast={index + 1 >= entries.length} onSubmit={session.submit} onNext={session.next} />
      </PracticeShell>
    )
  }
  if (phase === 'done' && session.result) {
    return (
      <PracticeShell title={title} progress={1} onExit={onExit}>
        <SessionResultView
          result={session.result}
          answersByCard={session.answersByCard}
          actions={
            <>
              {onAgain && (
                <Button onClick={onAgain} className="flex min-h-12 items-center justify-center gap-2">
                  <Icon name="replay" className="text-xl" /> {againLabel ?? 'Again'}
                </Button>
              )}
              <Button variant={onAgain ? 'outline' : 'primary'} onClick={onExit} className="flex min-h-12 items-center justify-center gap-2">
                Done
              </Button>
            </>
          }
        />
      </PracticeShell>
    )
  }
  return (
    <PracticeShell title={title} onExit={onExit}>
      {phase === 'empty' && <EmptyState icon="task_alt" title={emptyTitle} description={emptyDescription} actionLabel="Back" onAction={onExit} />}
      {phase === 'start-error' && <ErrorState message={resolveErrorMessage(session.error)} onRetry={session.retry} />}
      {phase === 'finish-error' && (
        <ErrorState
          title="Your answers are not saved yet"
          message={`${resolveErrorMessage(session.error)} They are kept on this device and sent again when you retry or come back.`}
          onRetry={session.retry}
        />
      )}
      {(phase === 'starting' || phase === 'finishing') && (
        <LoadingState label={phase === 'starting' ? 'Getting your session ready…' : 'Saving your answers…'} className="pt-6" />
      )}
    </PracticeShell>
  )
}
