import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import type { KanaChar } from '@/types'
import { useAnswerTimer, type AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { usePreloadSpeech } from '@/hooks/usePreloadSpeech'
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
  /** Something is shown over the quiz (e.g. "Leave the quiz?"): its keys are off. */
  paused?: boolean
}

/**
 * After an answer, how long its feedback stays before the next question comes
 * up by itself: long enough to see the right answer after a mistake.
 */
const ADVANCE_AFTER_MS = { correct: 700, wrong: 1500 } as const

/**
 * Plays a QuizSession inside the shared PracticeShell: prompt in the upper
 * half, options + feedback in the lower half (thumb reach on phones). Picking
 * an option answers it (no separate confirm): the options show right/wrong and
 * the next question follows automatically, or the results after the last.
 * Answering plays the right kana's sound, so every question is also heard.
 * The current and next questions' clips are fetched ahead, so they play at once.
 * Keys: 1–4 answer, R replays the sound, Enter skips the feedback pause.
 */
export function QuizRunner({ title, session, status, notice, onAnswer, onExit, paused = false }: QuizRunnerProps) {
  const { speak, loadingText } = useJapaneseSpeech()
  const { question, answer, index, questions, pick, next } = session
  const headingRef = useRef<HTMLHeadingElement>(null)
  const total = questions.length
  const timer = useAnswerTimer(question?.key ?? '')
  // Every answer plays its kana, so the next questions' sounds are fetched ahead.
  usePreloadSpeech([index, index + 1, index + 2].map((i) => questions[i]?.target.character))

  const choose = useCallback(
    (option: KanaChar) => {
      if (!question || answer) return
      timer.markInput()
      timer.attempt()
      onAnswer?.(question, option, timer)
      pick(option)
      // Inside the tap, so the browser lets it play; it carries on over the next question.
      speak(question.target.character)
    },
    [question, answer, timer, onAnswer, pick, speak],
  )

  // New question: focus its heading and, for listening, play the sound.
  useEffect(() => {
    if (!question) return
    headingRef.current?.focus({ preventScroll: true })
    if (question.kind !== 'listen') return
    const t = window.setTimeout(() => speak(question.target.character, { onStart: timer.audioStart, onEnd: timer.audioStop }), 250)
    return () => window.clearTimeout(t)
  }, [question, speak, timer])

  // Answered: move on by itself after the feedback pause.
  useEffect(() => {
    if (!answer) return
    const t = window.setTimeout(next, answer.correct ? ADVANCE_AFTER_MS.correct : ADVANCE_AFTER_MS.wrong)
    return () => window.clearTimeout(t)
  }, [answer, next])

  const replay = useCallback(
    () => question && speak(question.target.character, { onStart: timer.audioStart, onEnd: timer.audioStop }),
    [question, speak, timer],
  )

  useEffect(() => {
    if (paused) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement) return
      if (answer && e.key === 'Enter') {
        e.preventDefault()
        next()
        return
      }
      const option = question?.options[Number(e.key) - 1]
      if (option) choose(option)
      else if (e.key.toLowerCase() === 'r' && question?.kind === 'listen') replay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, answer, choose, replay, next, paused])

  if (!question) return null
  const { target } = question

  return (
    <PracticeShell title={title} progress={index / total} status={status ?? `${index + 1} / ${total}`} onExit={onExit}>
      {notice}
      <QuestionPrompt
        ref={headingRef}
        question={question}
        number={index + 1}
        total={total}
        onReplay={replay}
        loading={!answer && loadingText === target.character}
      />
      <p
        role="status"
        className={cn(
          'mb-3 flex min-h-7 items-center justify-center gap-1.5 text-center font-bold',
          answer?.correct ? 'text-success' : 'text-ink',
        )}
      >
        {answer && (
          <>
            <Icon name={answer.correct ? 'check_circle' : 'close'} filled={answer.correct} className="text-xl" />
            {answer.correct ? 'Correct! ' : 'Not quite. It’s '}
            <span lang="ja" className="font-ja-display">{target.character}</span>
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
    </PracticeShell>
  )
}
