import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { KanaChar } from '@/types'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { OptionGrid } from '@/components/kanaQuiz/OptionGrid'
import { useAnswerTimer } from '@/hooks/useAnswerTimer'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import type { EntryMark } from '@/hooks/useLearnSession'
import { cardChar, questionView } from '@/lib/learn/questionView'
import type { SessionEntry } from '@/lib/learn/sessionPlan'
import type { AnswerRequestItem } from '@/types/learn'
import { markLearnAnswer } from './markLearnAnswer'
import { LeechHint } from './LeechHint'
import { QuestionPromptView } from './QuestionPromptView'
import { TypedAnswerInput } from './TypedAnswerInput'

interface SessionQuestionProps {
  entry: SessionEntry
  mark: EntryMark | undefined
  isLast: boolean
  onSubmit: (answer: AnswerRequestItem, mark: EntryMark) => void
  onNext: () => void
}

/** OptionGrid speaks KanaChar; a server option is just its text, which doubles as its id. */
function asOption(text: string): KanaChar {
  return { id: text, character: text, romaji: text, type: 'basic' }
}

const SPEAK_DELAY_MS = 250

/**
 * One server-built question. Every signal goes through the answer timer
 * (first input, attempts, audio playback); the local ✓/✗ comes from the
 * answer the question carries. Keys: 1–4 pick, R replays the sound.
 */
export function SessionQuestion({ entry, mark, isLast, onSubmit, onNext }: SessionQuestionProps) {
  const { question } = entry
  const view = questionView(question)
  const timer = useAnswerTimer(entry.key)
  const { speak } = useJapaneseSpeech()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)
  const options = useMemo(() => (question.options ?? []).map(asOption), [question.options])

  const play = useCallback(
    () => speak(question.prompt, { onStart: timer.audioStart, onEnd: timer.audioStop }),
    [speak, question.prompt, timer],
  )

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    if (view.display !== 'audio') return
    const t = window.setTimeout(play, SPEAK_DELAY_MS)
    return () => window.clearTimeout(t)
    // Once per shown question; `play` changes when the voice list loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.key])

  useEffect(() => {
    if (mark) nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [mark])

  const answer = useCallback(
    (given: string, field: 'chosen_option' | 'answer_text') => {
      if (mark) return
      timer.markInput()
      timer.attempt()
      const payload = timer.buildAnswer({
        card_id: question.card_id,
        question_type: question.question_type,
        ...(field === 'chosen_option' ? { chosen_option: given } : { answer_text: given }),
        ...(question.options ? { options: question.options } : {}),
      })
      onSubmit(payload, { given, correct: markLearnAnswer(question, given) })
    },
    [mark, timer, question, onSubmit],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.target instanceof HTMLInputElement) return
      const option = view.input === 'choice' ? question.options?.[Number(e.key) - 1] : undefined
      if (option) answer(option, 'chosen_option')
      else if (e.key.toLowerCase() === 'r' && view.display === 'audio') play()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [view.input, view.display, question.options, answer, play])

  return (
    <>
      <QuestionPromptView ref={headingRef} question={question} view={view} onReplay={play} />
      <p
        role="status"
        className={cn('mb-3 flex min-h-7 flex-wrap items-center justify-center gap-1.5 text-center font-bold', mark?.correct ? 'text-success' : 'text-on-surface')}
      >
        {mark && (
          <>
            <Icon name={mark.correct ? 'check_circle' : 'close'} filled={mark.correct} className="text-xl" />
            {mark.correct ? 'Correct!' : 'Not quite. It’s'}
            {!mark.correct && (
              <span lang={view.optionsJapanese ? 'ja' : undefined} className={view.optionsJapanese ? 'font-jp' : undefined}>
                {question.correct_answer}
              </span>
            )}
          </>
        )}
      </p>
      {mark && !mark.correct && question.is_leech && <LeechHint itemType={question.item_type} char={cardChar(question)} />}
      {view.input === 'choice' ? (
        <OptionGrid
          options={options}
          asRomaji={!view.optionsJapanese}
          targetId={question.correct_answer}
          chosenId={mark?.given ?? null}
          onPick={(k) => answer(k.id, 'chosen_option')}
        />
      ) : (
        <TypedAnswerInput
          id={`answer-${entry.key}`}
          typesKana={view.typesKana}
          label={view.typesKana ? 'Answer, in kana or romaji' : 'Answer'}
          placeholder={view.typesKana ? 'Type it (romaji is fine)' : 'Type your answer'}
          correct={mark ? mark.correct : null}
          onFirstInput={timer.markInput}
          onSubmit={(text) => answer(text, 'answer_text')}
        />
      )}
      <div ref={nextRef} className={cn('mt-4', !mark && 'invisible')}>
        <Button onClick={onNext} className="flex min-h-14 w-full items-center justify-center gap-2">
          {isLast ? 'Finish' : 'Next'}
          <Icon name="arrow_forward" className="text-xl" />
        </Button>
      </div>
    </>
  )
}
