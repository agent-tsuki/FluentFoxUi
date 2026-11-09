import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { TextInput } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { useAnswerTimer, type AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { hasJapanese, markTestAnswer } from '@/lib/testCenter/mark'
import type { ChoiceQuestion, SelectQuestion, TestAnswer, TestQuestion, TextQuestion, TilesQuestion } from '@/lib/testCenter/types'
import { QuestionPrompt as Prompt } from './QuestionPrompt'

/** A right answer moves on by itself after this long; a wrong one waits for Continue. */
const NEXT_AFTER_RIGHT_MS = 900

interface TestRunnerProps {
  title: string
  questions: TestQuestion[]
  onFinish: (answers: TestAnswer[]) => void
  onExit: () => void
  /** Each answer as it is given, with its timing (graded quizzes send it to the server). */
  onAnswer?: (question: TestQuestion, given: string, timer: AnswerTimerControls) => void
  /** The leave prompt's last line. */
  leaveNote?: string
}

/**
 * Asks a practice test one question at a time, in whatever form each question
 * takes: options (keys 1–4), a dropdown inside the sentence, a text box, or
 * word tiles to put in order. After each answer it says right or wrong with a one-line why.
 */
export function TestRunner({ title, questions, onFinish, onExit, onAnswer, leaveNote = 'Practice tests aren’t saved.' }: TestRunnerProps) {
  const [answers, setAnswers] = useState<TestAnswer[]>([])
  const [current, setCurrent] = useState<TestAnswer | null>(null)
  const [leaving, setLeaving] = useState(false)
  const index = answers.length
  const question = questions[index]
  const timer = useAnswerTimer(question?.id ?? '')

  const next = useCallback(() => {
    if (!current) return
    const all = [...answers, current]
    setAnswers(all)
    setCurrent(null)
    if (all.length >= questions.length) onFinish(all)
  }, [answers, current, questions.length, onFinish])

  // A right answer moves on by itself.
  useEffect(() => {
    if (!current?.correct || leaving) return
    const timer = window.setTimeout(next, NEXT_AFTER_RIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [current, next, leaving])

  const answer = (given: string) => {
    if (current || !question) return
    timer.markInput()
    timer.attempt()
    onAnswer?.(question, given, timer)
    setCurrent(markTestAnswer(question, given))
  }

  const exit = () => (answers.length || current ? setLeaving(true) : onExit())

  if (!question) return null
  return (
    <PracticeShell title={title} progress={(index + (current ? 1 : 0)) / questions.length} status={`${index + 1} / ${questions.length}`} onExit={exit}>
      <div className="relative flex flex-1 flex-col pt-6 sm:pt-10">
        <p className="text-center text-sm font-medium text-on-surface-variant">{question.instruction}</p>

        {question.kind === 'choice' && <ChoiceView key={question.id} question={question} result={current} onAnswer={answer} />}
        {question.kind === 'select' && <SelectView key={question.id} question={question} result={current} onAnswer={answer} />}
        {question.kind === 'text' && <TextView key={question.id} question={question} result={current} onAnswer={answer} />}
        {question.kind === 'tiles' && <TilesView key={question.id} question={question} result={current} onAnswer={answer} />}

        <div className="mt-auto pt-6" aria-live="polite">
          {current && <Feedback result={current} onContinue={next} last={index + 1 >= questions.length} />}
        </div>

        {leaving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/85 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-labelledby="leave-test-title"
              className="w-full max-w-sm rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 text-center shadow-elevation-2 dark:bg-surface-container-low"
            >
              <h2 id="leave-test-title" className="font-headline text-lg font-bold text-on-surface">
                Leave this test?
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                You’ve answered {answers.length + (current ? 1 : 0)} of {questions.length}. {leaveNote}
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                <Button autoFocus onClick={() => setLeaving(false)} className="flex-1">
                  Keep going
                </Button>
                <Button variant="outline" onClick={onExit} className="flex-1">
                  Leave
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PracticeShell>
  )
}

// ─── Choice ──────────────────────────────────────────────────────────────────

function ChoiceView({ question, result, onAnswer }: { question: ChoiceQuestion; result: TestAnswer | null; onAnswer: (given: string) => void }) {
  // Keys 1–4 pick an option.
  useEffect(() => {
    if (result) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const option = question.options[Number(e.key) - 1]
      if (option !== undefined) onAnswer(option)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question.options, result, onAnswer])

  const long = question.options.some((o) => o.length > 18)
  return (
    <>
      <Prompt question={question} />
      <div className={cn('grid gap-3', long ? 'grid-cols-1' : 'grid-cols-2')}>
        {question.options.map((option, i) => {
          const state = !result ? 'idle' : option === question.answer ? 'right' : option === result.given ? 'wrong' : 'muted'
          return (
            <button
              key={option}
              type="button"
              aria-disabled={result ? true : undefined}
              onClick={() => !result && onAnswer(option)}
              className={cn(
                'relative flex min-h-16 items-center justify-center rounded-2xl border-2 px-4 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:min-h-20',
                state === 'idle' &&
                  'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:bg-surface-container-low',
                state === 'right' && 'border-success bg-success/15 text-on-surface',
                state === 'wrong' && 'border-error bg-error-container text-on-error-container',
                state === 'muted' && 'border-outline-variant/40 bg-surface-container-lowest text-on-surface opacity-50',
                result && 'cursor-default',
              )}
            >
              <span aria-hidden className="absolute left-3 top-2 hidden text-xs font-bold text-on-surface-variant sm:block">
                {i + 1}
              </span>
              <span
                lang={question.optionsJa ? 'ja' : undefined}
                className={cn(
                  'font-semibold',
                  question.optionsJa
                    ? cn('font-jp', option.length <= 2 ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl')
                    : long
                      ? 'text-base'
                      : 'text-lg sm:text-xl',
                )}
              >
                {option}
              </span>
              {state === 'right' && <Icon name="check_circle" filled className="absolute right-2 top-2 text-xl text-success" />}
              {state === 'wrong' && <Icon name="close" className="absolute right-2 top-2 text-xl" />}
              {state === 'right' && <span className="sr-only">, correct answer</span>}
              {state === 'wrong' && <span className="sr-only">, your answer, wrong</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ─── Dropdown in the sentence ────────────────────────────────────────────────

function SelectView({ question, result, onAnswer }: { question: SelectQuestion; result: TestAnswer | null; onAnswer: (given: string) => void }) {
  const [picked, setPicked] = useState('')
  const id = useId()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (picked) onAnswer(picked)
  }

  const slot = result ? (
    <span
      className={cn(
        'mx-1 inline-block rounded-lg border-2 px-2 align-baseline leading-normal',
        result.correct ? 'border-success bg-success/15 text-on-surface' : 'border-error bg-error-container text-on-error-container line-through',
      )}
    >
      {result.given}
    </span>
  ) : (
    <span className="relative mx-1 inline-block align-baseline">
      <label htmlFor={id} className="sr-only">
        Missing word
      </label>
      <select
        id={id}
        value={picked}
        onChange={(e) => setPicked(e.target.value)}
        autoFocus
        className="cursor-pointer appearance-none rounded-lg border-2 border-primary/60 bg-primary/5 py-0 pl-3 pr-8 font-jp text-[0.85em] font-semibold leading-normal text-primary focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="" disabled>
          ？
        </option>
        {question.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="expand_more" className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-lg text-primary" />
    </span>
  )

  return (
    <form onSubmit={submit}>
      <Prompt question={question} slot={slot} />
      {!result && (
        <Button
          type="submit"
          disabled={!picked}
          className="mx-auto flex w-full max-w-xs items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Check
        </Button>
      )}
    </form>
  )
}

// ─── Typed ───────────────────────────────────────────────────────────────────

function TextView({ question, result, onAnswer }: { question: TextQuestion; result: TestAnswer | null; onAnswer: (given: string) => void }) {
  const [typed, setTyped] = useState('')
  const id = useId()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (typed.trim()) onAnswer(typed)
  }
  return (
    <form onSubmit={submit}>
      <Prompt question={question} />
      <div className="mx-auto flex max-w-sm flex-col gap-3">
        <label htmlFor={id} className="sr-only">
          Your answer
        </label>
        <TextInput
          autoFocus
          id={id}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          readOnly={Boolean(result)}
          placeholder={question.placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          className={cn('text-center text-lg', result && (result.correct ? 'ring-2 ring-success' : 'ring-2 ring-error'))}
        />
        {!result && (
          <Button type="submit" disabled={!typed.trim()} className="flex items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-50">
            Check
          </Button>
        )}
      </div>
    </form>
  )
}

// ─── Word tiles ──────────────────────────────────────────────────────────────

const TILE = 'min-h-11 rounded-xl border-2 px-3 py-1.5 font-jp text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function TilesView({ question, result, onAnswer }: { question: TilesQuestion; result: TestAnswer | null; onAnswer: (given: string) => void }) {
  /** Positions in `question.tiles`, in the order tapped (the same word can appear twice). */
  const [order, setOrder] = useState<number[]>([])
  const complete = order.length === question.tiles.length
  const remove = (at: number) => !result && setOrder((o) => o.filter((_, i) => i !== at))
  const add = (tile: number) => !result && setOrder((o) => [...o, tile])
  return (
    <div>
      <Prompt question={question} />
      <div
        lang="ja"
        aria-label="Your sentence"
        className={cn(
          'mx-auto flex min-h-16 max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-3',
          !result && 'border-outline-variant/60',
          result && (result.correct ? 'border-success bg-success/10' : 'border-error bg-error/10'),
        )}
      >
        {order.map((tile, at) => (
          <button key={tile} type="button" aria-label={`Remove ${question.tiles[tile]}`} aria-disabled={result ? true : undefined} onClick={() => remove(at)} className={cn(TILE, 'border-primary/60 bg-primary/5 text-primary')}>
            {question.tiles[tile]}
          </button>
        ))}
      </div>
      <div lang="ja" className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
        {question.tiles.map((word, tile) =>
          order.includes(tile) ? null : (
            <button key={tile} type="button" aria-disabled={result ? true : undefined} onClick={() => add(tile)} className={cn(TILE, 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60')}>
              {word}
            </button>
          ),
        )}
      </div>
      {!result && (
        <Button
          onClick={() => onAnswer(order.map((tile) => question.tiles[tile]).join(''))}
          disabled={!complete}
          className="mx-auto mt-6 flex w-full max-w-xs items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Check
        </Button>
      )}
    </div>
  )
}

// ─── Feedback ────────────────────────────────────────────────────────────────

function Feedback({ result, onContinue, last }: { result: TestAnswer; onContinue: () => void; last: boolean }) {
  const { question } = result
  const showAnswer = !result.correct || question.kind === 'text' || question.kind === 'tiles'
  return (
    <div className={cn('rounded-2xl border p-4', result.correct ? 'border-success/40 bg-success/10' : 'border-error/40 bg-error/10')}>
      <div className="flex items-start gap-3">
        <Icon
          name={result.correct ? 'check_circle' : 'error'}
          filled
          className={cn('mt-0.5 shrink-0 text-2xl', result.correct ? 'text-success' : 'text-error')}
        />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold text-on-surface">{result.correct ? 'Correct' : 'Not quite'}</p>
          {showAnswer && (
            <p className="mt-0.5 text-on-surface">
              Answer:{' '}
              <span lang={hasJapanese(question.answer) ? 'ja' : undefined} className={cn('font-semibold', hasJapanese(question.answer) && 'font-jp')}>
                {question.answer}
              </span>
            </p>
          )}
          {question.explanation && <p className="mt-1 text-on-surface-variant">{question.explanation}</p>}
        </div>
      </div>
      {!result.correct && (
        <Button autoFocus onClick={onContinue} className="mt-4 flex w-full items-center justify-center gap-2">
          {last ? 'See results' : 'Continue'}
          <Icon name="arrow_forward" className="text-lg" />
        </Button>
      )}
    </div>
  )
}
