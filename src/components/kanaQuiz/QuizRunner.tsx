import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { OptionGrid } from './OptionGrid'
import { QuestionPrompt } from './QuestionPrompt'
import type { QuizSession } from './useQuizSession'

interface QuizRunnerProps {
  title: string
  session: QuizSession
  /** Header status; defaults to "3 / 10". */
  status?: ReactNode
  /** Extra content above the question, e.g. a screen-reader time warning. */
  notice?: ReactNode
  onExit: () => void
}

/**
 * Plays a QuizSession inside the shared PracticeShell: prompt in the upper
 * half, options + feedback + Next in the lower half (thumb reach on phones).
 * Keys: 1–4 answer, R replays the sound; after answering, focus moves to Next.
 */
export function QuizRunner({ title, session, status, notice, onExit }: QuizRunnerProps) {
  const { speak } = useJapaneseSpeech()
  const { question, answer, index, questions, pick, next } = session
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Button doesn't forward refs, so Next is found through its wrapper.
  const nextRef = useRef<HTMLDivElement>(null)
  const total = questions.length
  const isLast = index + 1 >= total

  // New question: focus its heading and, for listening, play the sound.
  useEffect(() => {
    if (!question) return
    headingRef.current?.focus({ preventScroll: true })
    if (question.kind !== 'listen') return
    const t = window.setTimeout(() => speak(question.target.character), 250)
    return () => window.clearTimeout(t)
  }, [question, speak])

  useEffect(() => {
    if (answer) nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [answer])

  const replay = useCallback(() => question && speak(question.target.character), [question, speak])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement) return
      const option = question?.options[Number(e.key) - 1]
      if (option) pick(option)
      else if (e.key.toLowerCase() === 'r' && question?.kind === 'listen') replay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, pick, replay])

  if (!question) return null
  const { target } = question

  return (
    <PracticeShell title={title} progress={index / total} status={status ?? `${index + 1} / ${total}`} onExit={onExit}>
      {notice}
      <QuestionPrompt ref={headingRef} question={question} number={index + 1} total={total} onReplay={replay} />
      <p
        role="status"
        className={cn(
          'mb-3 flex min-h-7 items-center justify-center gap-1.5 text-center font-bold',
          answer?.correct ? 'text-success' : 'text-on-surface',
        )}
      >
        {answer && (
          <>
            <Icon name={answer.correct ? 'check_circle' : 'close'} filled={answer.correct} className="text-xl" />
            {answer.correct ? 'Correct! ' : 'Not quite. It’s '}
            <span lang="ja" className="font-jp">{target.character}</span>
            <span>({target.romaji})</span>
          </>
        )}
      </p>
      <OptionGrid
        key={question.key}
        options={question.options}
        asRomaji={question.kind === 'read'}
        targetId={target.id}
        chosenId={answer?.chosenId ?? null}
        onPick={pick}
      />
      <div ref={nextRef} className={cn('mt-4', !answer && 'invisible')}>
        <Button onClick={next} className="flex min-h-14 w-full items-center justify-center gap-2">
          {isLast ? 'See results' : 'Next'}
          <Icon name="arrow_forward" className="text-xl" />
        </Button>
      </div>
    </PracticeShell>
  )
}
