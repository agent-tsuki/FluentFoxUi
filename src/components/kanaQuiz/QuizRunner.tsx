import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import type { KanaChar } from '@/types'
import { useAnswerTimer, type AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { OptionGrid } from './OptionGrid'
import { QuestionPrompt } from './QuestionPrompt'
import type { QuizSession } from './useQuizSession'
import type { QuizQuestion } from './types'

interface QuizRunnerProps {
  title: string
  session: QuizSession
  /** Header status; defaults to "3 / 10". */
  status?: ReactNode
  /** Extra content above the question, e.g. a screen-reader time warning. */
  notice?: ReactNode
  /** Each answer as it is picked, with the question's timer (to save it to the learn API). */
  onAnswer?: (question: QuizQuestion, picked: KanaChar, timer: AnswerTimerControls) => void
  onExit: () => void
}

/**
 * Plays a QuizSession inside the shared PracticeShell: prompt in the upper
 * half, options + feedback + Next in the lower half (thumb reach on phones).
 * Keys: 1–4 answer, R replays the sound; after answering, focus moves to Next.
 */
export function QuizRunner({ title, session, status, notice, onAnswer, onExit }: QuizRunnerProps) {
  const { speak } = useJapaneseSpeech()
  const { question, answer, index, questions, pick, next } = session
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Button doesn't forward refs, so Next is found through its wrapper.
  const nextRef = useRef<HTMLDivElement>(null)
  const total = questions.length
  const isLast = index + 1 >= total
  const timer = useAnswerTimer(question?.key ?? '')

  const choose = useCallback(
    (option: KanaChar) => {
      if (!question || answer) return
      timer.markInput()
      timer.attempt()
      onAnswer?.(question, option, timer)
      pick(option)
    },
    [question, answer, timer, onAnswer, pick],
  )

  // New question: focus its heading and, for listening, play the sound.
  useEffect(() => {
    if (!question) return
    headingRef.current?.focus({ preventScroll: true })
    if (question.kind !== 'listen') return
    const t = window.setTimeout(() => speak(question.target.character, { onStart: timer.audioStart, onEnd: timer.audioStop }), 250)
    return () => window.clearTimeout(t)
  }, [question, speak, timer])

  useEffect(() => {
    if (answer) nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [answer])

  const replay = useCallback(
    () => question && speak(question.target.character, { onStart: timer.audioStart, onEnd: timer.audioStop }),
    [question, speak, timer],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement) return
      const option = question?.options[Number(e.key) - 1]
      if (option) choose(option)
      else if (e.key.toLowerCase() === 'r' && question?.kind === 'listen') replay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, choose, replay])

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
        onPick={choose}
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
