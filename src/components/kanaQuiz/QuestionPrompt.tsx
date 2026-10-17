import { forwardRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { QuizQuestion } from './types'

interface QuestionPromptProps {
  question: QuizQuestion
  number: number
  total: number
  onReplay: () => void
}

const ASK: Record<QuizQuestion['kind'], string> = {
  read: 'How do you read this kana?',
  find: 'Which kana is this?',
  listen: 'Which kana did you hear?',
}

/**
 * The question itself: a big kana (read), a big romaji (find) or a replay
 * button (listen). The heading takes focus at each new question so screen
 * readers announce it.
 */
export const QuestionPrompt = forwardRef<HTMLHeadingElement, QuestionPromptProps>(function QuestionPrompt(
  { question, number, total, onReplay },
  ref,
) {
  const { kind, target } = question
  // Loanword questions (katakana ー/ッ) show a whole word: scale it down to fit a phone.
  const kanaLength = Array.from(target.character).length
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
      <h2 ref={ref} tabIndex={-1} className="text-sm font-semibold text-on-surface-variant focus:outline-none">
        <span className="sr-only">Question {number} of {total}. </span>
        {question.prompt ?? ASK[kind]}
        {kind === 'read' && <span className="sr-only"> {target.character}</span>}
        {kind === 'find' && <span className="sr-only"> {target.romaji}</span>}
      </h2>
      {kind === 'read' && (
        <p
          lang="ja"
          aria-hidden="true"
          className={cn(
            'font-jp font-bold leading-none text-on-surface',
            kanaLength <= 2 ? 'text-8xl sm:text-9xl' : kanaLength <= 4 ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-7xl',
          )}
        >
          {target.character}
        </p>
      )}
      {kind === 'find' && (
        <p
          aria-hidden="true"
          className={cn(
            'break-all font-headline font-extrabold text-primary',
            target.romaji.length <= 5 ? 'text-6xl sm:text-7xl' : 'text-5xl sm:text-6xl',
          )}
        >
          {target.romaji}
        </p>
      )}
      {kind === 'listen' && (
        <>
          <button
            type="button"
            onClick={onReplay}
            aria-label="Play the sound"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-150 hover:bg-primary/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none sm:h-28 sm:w-28"
          >
            <Icon name="volume_up" className="text-5xl" />
          </button>
          <p className="text-xs text-on-surface-variant">
            Tap to hear it again<span className="hidden sm:inline"> · press R</span>
          </p>
        </>
      )}
      {question.hint && <p className="text-sm font-medium text-on-surface-variant">{question.hint}</p>}
    </div>
  )
})
