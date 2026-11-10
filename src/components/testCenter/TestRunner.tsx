import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { AnswerOption } from '@/components/ui/AnswerOption'
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
  /** Stop after a right answer too, so its explanation can be read. */
  pauseOnRight?: boolean
}

/**
 * Asks a practice test one question at a time, in whatever form each question
 * takes: full-width options (keys 1–4), a dropdown inside the sentence, a text box, or
 * word tiles to put in order. After each answer it says right or wrong with a one-line why.
 */
export function TestRunner({ title, questions, onFinish, onExit, onAnswer, leaveNote = 'Practice tests aren’t saved.', pauseOnRight = false }: TestRunnerProps) {
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
    if (!current?.correct || leaving || pauseOnRight) return
    const timer = window.setTimeout(next, NEXT_AFTER_RIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [current, next, leaving, pauseOnRight])

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
        <p className="text-center text-sm font-medium text-ink-muted">{question.instruction}</p>

        {question.kind === 'choice' && <ChoiceView key={question.id} question={question} result={current} onAnswer={answer} />}
        {question.kind === 'select' && <SelectView key={question.id} question={question} result={current} onAnswer={answer} />}
        {question.kind === 'text' && <TextView key={question.id} question={question} result={current} onAnswer={answer} />}
        {question.kind === 'tiles' && <TilesView key={question.id} question={question} result={current} onAnswer={answer} />}

        <div className="mt-auto pt-6" aria-live="polite">
          {current && <Feedback result={current} onContinue={next} last={index + 1 >= questions.length} waits={!current.correct || pauseOnRight} />}
        </div>

        {leaving && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/85 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-labelledby="leave-test-title"
              className="w-full max-w-sm rounded-xl border border-line bg-surface-raised p-5 text-center shadow-elevation-2"
            >
              <h2 id="leave-test-title" className="font-display text-lg font-bold text-ink">
                Leave this test?
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
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

  return (
    <>
      <Prompt question={question} />
      <ul className="mx-auto grid w-full max-w-xl gap-2">
        {question.options.map((option, i) => (
          <li key={option}>
            <AnswerOption
              index={i}
              label={option}
              ja={question.optionsJa}
              state={!result ? 'idle' : option === question.answer ? 'correct' : option === result.given ? 'wrong' : 'muted'}
              onSelect={() => onAnswer(option)}
            />
          </li>
        ))}
      </ul>
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
        'mx-1 inline-block rounded-sm border-2 px-2 align-baseline leading-normal',
        result.correct ? 'border-success bg-success-soft text-success-ink' : 'border-danger bg-danger-soft text-danger-ink line-through',
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
        className="cursor-pointer appearance-none rounded-sm border-2 border-primary/60 bg-primary/5 py-0 pl-3 pr-8 font-ja text-[0.85em] font-semibold leading-normal text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
          className={cn('text-center text-lg', result && (result.correct ? 'ring-2 ring-success' : 'ring-2 ring-danger'))}
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

const TILE = 'min-h-11 rounded-md border-2 px-3 py-1.5 font-ja text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

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
          'mx-auto flex min-h-16 max-w-md flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3',
          !result && 'border-line',
          result && (result.correct ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft'),
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
            <button key={tile} type="button" aria-disabled={result ? true : undefined} onClick={() => add(tile)} className={cn(TILE, 'border-line bg-surface-raised text-ink hover:border-primary/60')}>
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

function Feedback({ result, onContinue, last, waits }: { result: TestAnswer; onContinue: () => void; last: boolean; waits: boolean }) {
  const { question } = result
  const showAnswer = !result.correct || question.kind === 'text' || question.kind === 'tiles'
  return (
    <div className={cn('rounded-lg p-4', result.correct ? 'bg-success-soft' : 'bg-danger-soft')}>
      <div className="flex items-start gap-3">
        <Icon
          name={result.correct ? 'check_circle' : 'error'}
          filled
          className={cn('mt-0.5 shrink-0 text-2xl', result.correct ? 'text-success' : 'text-danger')}
        />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold text-ink">{result.correct ? 'Correct' : 'Not quite'}</p>
          {showAnswer && (
            <p className="mt-0.5 text-ink">
              Answer:{' '}
              <span lang={hasJapanese(question.answer) ? 'ja' : undefined} className={cn('font-semibold', hasJapanese(question.answer) && 'font-ja')}>
                {question.answer}
              </span>
            </p>
          )}
          {question.explanation && <p className="mt-1 text-ink-muted">{question.explanation}</p>}
        </div>
      </div>
      {waits && (
        <Button autoFocus onClick={onContinue} className="mt-4 flex w-full items-center justify-center gap-2">
          {last ? 'See results' : 'Next question'}
          <Icon name="arrow_forward" className="text-lg" />
        </Button>
      )}
    </div>
  )
}
