import { forwardRef, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PracticeShell } from '@/components/practice/PracticeShell'
import { useAnswerTimer, type AnswerTimerControls } from '@/hooks/useAnswerTimer'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { romajiToHiragana } from '@/lib/content/kanji/romaji'
import type { KanjiQuizSession } from './useKanjiQuizSession'
import type { KanjiAnswer, KanjiAnswerMode, KanjiQuestion } from './types'

interface KanjiQuizRunnerProps {
  title: string
  session: KanjiQuizSession
  /** Header status; defaults to "3 / 10". */
  status?: ReactNode
  /** Extra content above the question, e.g. a time warning. */
  notice?: ReactNode
  /** The typed ⇄ choice preference; omit both to hide the toggle (e.g. timed tests). */
  mode?: KanjiAnswerMode
  onModeChange?: (mode: KanjiAnswerMode) => void
  /** Each answer as it is given, with the question's timer (to save it to the learn API). */
  onAnswer?: (question: KanjiQuestion, given: string, timer: AnswerTimerControls) => void
  onExit: () => void
}

const ASK: Record<KanjiQuestion['kind'], string> = {
  meaning: 'What does this kanji mean?',
  reading: 'How do you read this kanji?',
  kanji: 'Which kanji means…',
  listen: 'Which kanji is in the word you heard?',
}

/**
 * Plays a KanjiQuizSession inside the shared PracticeShell (same frame as the
 * kana quizzes): prompt in the upper half; options or a text field, feedback
 * and Next in the lower half. Keys: 1–4 pick, Enter submits / moves on,
 * R replays a listening prompt. Readings can be typed in romaji.
 */
export function KanjiQuizRunner({ title, session, status, notice, mode, onModeChange, onAnswer, onExit }: KanjiQuizRunnerProps) {
  const { speak } = useJapaneseSpeech()
  const { question, answer, index, questions, submit, next } = session
  const headingRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  const total = questions.length
  const isLast = index + 1 >= total
  const keyWord = question?.target.vocab.find((v) => v.isKey) ?? question?.target.vocab[0]
  const timer = useAnswerTimer(question?.key ?? '')

  const answerWith = useCallback(
    (given: string) => {
      if (!question || answer) return
      timer.markInput()
      timer.attempt()
      onAnswer?.(question, given, timer)
      submit(given)
    },
    [question, answer, timer, onAnswer, submit],
  )

  useEffect(() => {
    if (!question) return
    headingRef.current?.focus({ preventScroll: true })
    if (question.kind !== 'listen' || !keyWord) return
    const t = window.setTimeout(() => speak(keyWord.reading, { onStart: timer.audioStart, onEnd: timer.audioStop }), 250)
    return () => window.clearTimeout(t)
    // keyWord derives from question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, speak, timer])

  useEffect(() => {
    if (answer) nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [answer])

  const replay = useCallback(
    () => keyWord && speak(keyWord.reading, { onStart: timer.audioStart, onEnd: timer.audioStop }),
    [keyWord, speak, timer],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement) return
      if (!question || question.answerKind !== 'choice') return
      const option = question.options[Number(e.key) - 1]
      if (option && !answer) answerWith(option)
      else if (e.key.toLowerCase() === 'r' && question.kind === 'listen') replay()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question, answer, answerWith, replay])

  if (!question) return null
  const showToggle = mode !== undefined && onModeChange && (question.kind === 'meaning' || question.kind === 'reading') && !answer

  return (
    <PracticeShell title={title} progress={index / total} status={status ?? `${index + 1} / ${total}`} onExit={onExit}>
      {notice}
      <Prompt ref={headingRef} question={question} number={index + 1} total={total} onReplay={replay} />
      {showToggle && <AnswerModeToggle mode={mode} onChange={onModeChange} />}
      <Feedback answer={answer} />
      {question.answerKind === 'choice' ? (
        <ChoiceGrid key={question.key} question={question} answer={answer} onPick={answerWith} />
      ) : (
        <TypedAnswer key={question.key} question={question} answer={answer} onInput={timer.markInput} onSubmit={answerWith} />
      )}
      <div ref={nextRef} className={cn('mt-4', !answer && 'invisible')}>
        <Button onClick={next} className="flex min-h-14 w-full items-center justify-center gap-2">
          {isLast ? 'See results' : 'Next'}
          <Icon name="arrow_forward" className="text-xl" />
        </Button>
      </div>
    </PracticeShell>
  )
}

interface PromptProps {
  question: KanjiQuestion
  number: number
  total: number
  onReplay: () => void
}

const Prompt = forwardRef<HTMLHeadingElement, PromptProps>(function Prompt({ question, number, total, onReplay }, ref) {
  const { kind, target } = question
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
      <h2 ref={ref} tabIndex={-1} className="text-sm font-semibold text-on-surface-variant focus:outline-none">
        <span className="sr-only">Question {number} of {total}. </span>
        {ASK[kind]}
        {(kind === 'meaning' || kind === 'reading') && <span className="sr-only"> {target.char}</span>}
      </h2>
      {(kind === 'meaning' || kind === 'reading') && (
        <p lang="ja" aria-hidden="true" className="font-jp text-8xl font-bold leading-none text-on-surface sm:text-9xl">
          {target.char}
        </p>
      )}
      {kind === 'kanji' && (
        <p className="font-headline text-4xl font-extrabold text-primary sm:text-5xl">“{target.meanings[0]}”</p>
      )}
      {kind === 'listen' && (
        <>
          <button
            type="button"
            onClick={onReplay}
            aria-label="Play the word"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-150 hover:bg-primary/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
          >
            <Icon name="volume_up" className="text-5xl" />
          </button>
          <p className="text-xs text-on-surface-variant">
            Tap to hear it again<span className="hidden sm:inline"> · press R</span>
          </p>
        </>
      )}
    </div>
  )
})

function AnswerModeToggle({ mode, onChange }: { mode: KanjiAnswerMode; onChange: (mode: KanjiAnswerMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Answer by" className="mx-auto mb-3 inline-flex self-center rounded-full border border-outline-variant/60 p-0.5">
      {(['typed', 'choice'] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={cn(
            'min-h-9 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            mode === m ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {m === 'typed' ? 'Type it' : 'Choose'}
        </button>
      ))}
    </div>
  )
}

/** "Correct!" / "Not quite" with the answer, its key word and (typed) the accepted alternative. */
function Feedback({ answer }: { answer?: KanjiAnswer }) {
  if (!answer) return <p role="status" className="mb-3 min-h-7" />
  const { question, correct, alternative } = answer
  const { target } = question
  const key = target.vocab.find((v) => v.isKey) ?? target.vocab[0]
  return (
    <div role="status" className="mb-3 text-center">
      <p className={cn('flex items-center justify-center gap-1.5 font-bold', correct ? 'text-success' : 'text-on-surface')}>
        <Icon name={correct ? 'check_circle' : 'close'} filled={correct} className="text-xl" />
        {correct ? (alternative ? 'Correct — we were after ' : 'Correct! ') : 'Not quite. It’s '}
        <span lang={question.kind === 'reading' ? 'ja' : undefined} className={question.kind === 'reading' ? 'font-jp' : undefined}>
          {question.kind === 'kanji' || question.kind === 'listen' ? target.char : question.answer}
        </span>
      </p>
      {key && (
        <p className="mt-0.5 text-sm text-on-surface-variant">
          <span lang="ja" className="font-jp">
            {key.word}（{key.reading}）
          </span>{' '}
          {key.meaning}
        </p>
      )}
    </div>
  )
}

const OPTION_STATE = {
  idle: 'border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:bg-surface-container-low',
  correct: 'border-success bg-success/15 text-on-surface',
  wrong: 'border-error bg-error-container text-on-error-container',
  muted: 'border-outline-variant/40 bg-surface-container-lowest text-on-surface opacity-50',
} as const

function ChoiceGrid({ question, answer, onPick }: { question: KanjiQuestion; answer?: KanjiAnswer; onPick: (o: string) => void }) {
  const isKanji = question.kind === 'kanji' || question.kind === 'listen'
  const isReading = question.kind === 'reading'
  const stateOf = (o: string): keyof typeof OPTION_STATE => {
    if (!answer) return 'idle'
    if (o === question.answer) return 'correct'
    return o === answer.given ? 'wrong' : 'muted'
  }
  return (
    <div role="group" aria-label="Answers" className="grid grid-cols-2 gap-3">
      {question.options.map((o, i) => {
        const state = stateOf(o)
        return (
          <button
            key={o}
            type="button"
            aria-disabled={answer ? true : undefined}
            onClick={() => !answer && onPick(o)}
            className={cn(
              'relative flex min-h-20 w-full items-center justify-center rounded-2xl border-2 px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none sm:min-h-24',
              OPTION_STATE[state],
              answer && 'cursor-default',
            )}
          >
            <span className="absolute left-3 top-2 hidden font-label text-xs font-bold text-on-surface-variant sm:block" aria-hidden>
              {i + 1}
            </span>
            <span
              lang={isKanji || isReading ? 'ja' : undefined}
              className={cn(
                isKanji ? 'font-jp text-5xl font-bold leading-none' : isReading ? 'font-jp text-2xl font-bold sm:text-3xl' : 'text-base font-bold sm:text-lg',
              )}
            >
              {o}
            </span>
            {state === 'correct' && <Icon name="check_circle" filled className="absolute right-2 top-2 text-2xl text-success" />}
            {state === 'wrong' && <Icon name="close" className="absolute right-2 top-2 text-2xl" />}
            {state === 'correct' && <span className="sr-only">, correct answer</span>}
            {state === 'wrong' && <span className="sr-only">, your answer, wrong</span>}
          </button>
        )
      })}
    </div>
  )
}

interface TypedAnswerProps {
  question: KanjiQuestion
  answer?: KanjiAnswer
  /** Every keystroke (the timer keeps the first). */
  onInput: () => void
  onSubmit: (text: string) => void
}

function TypedAnswer({ question, answer, onInput, onSubmit }: TypedAnswerProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isReading = question.kind === 'reading'
  const preview = isReading ? romajiToHiragana(value, false) : ''

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (answer || !value.trim()) return
    onSubmit(value)
  }

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-2">
      <label htmlFor={`answer-${question.key}`} className="sr-only">
        {isReading ? 'Reading, in kana or romaji' : 'Meaning in English'}
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id={`answer-${question.key}`}
          value={value}
          onChange={(e) => {
            onInput()
            setValue(e.target.value)
          }}
          readOnly={Boolean(answer)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={isReading ? 'Type a reading (romaji is fine)' : 'Type the meaning'}
          className={cn(
            'min-h-14 w-full min-w-0 flex-1 rounded-xl border-2 bg-surface-container-lowest px-4 text-lg text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            !answer ? 'border-outline-variant/60' : answer.correct ? 'border-success' : 'border-error',
          )}
        />
        {!answer && (
          <Button type="submit" disabled={!value.trim()} className="min-h-14 shrink-0 px-5 disabled:opacity-50">
            Check
          </Button>
        )}
      </div>
      <p aria-live="polite" lang="ja" className="min-h-6 px-1 font-jp text-base text-on-surface-variant">
        {isReading && preview && preview !== value ? preview : ''}
      </p>
    </form>
  )
}
