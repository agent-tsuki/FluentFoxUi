import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { SENTENCE_GAP, type QuestionView } from '@/lib/learn/questionView'
import type { LearnQuestion } from '@/types/learn'

interface QuestionPromptViewProps {
  question: LearnQuestion
  view: QuestionView
  onReplay: () => void
}

/**
 * The upper half of a session question: the question line, then a big glyph,
 * a big romaji / English word, or a play button for listening questions. The
 * heading takes focus on each new question so screen readers announce it.
 */
export const QuestionPromptView = forwardRef<HTMLHeadingElement, QuestionPromptViewProps>(function QuestionPromptView(
  { question, view, onReplay },
  ref,
) {
  const { prompt } = question
  const length = Array.from(prompt).length
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
      <h2 ref={ref} tabIndex={-1} className="text-sm font-semibold text-ink-muted focus:outline-none">
        {view.ask}
        {view.display !== 'audio' && <span className="sr-only"> {prompt}</span>}
      </h2>
      {view.display === 'japanese' && (
        <p
          lang="ja"
          aria-hidden="true"
          className={cn(
            'font-ja font-bold leading-none text-ink',
            length <= 2 ? 'text-8xl sm:text-9xl' : length <= 4 ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-7xl',
          )}
        >
          {prompt}
        </p>
      )}
      {view.display === 'sentence' && (
        <div aria-hidden="true" className="max-w-xl space-y-3">
          <p lang="ja" className="font-ja text-2xl font-medium leading-relaxed text-ink sm:text-3xl">
            {prompt.split(SENTENCE_GAP).map((part, i, parts) => (
              <span key={i}>
                {part}
                {i < parts.length - 1 && <span className="mx-1 inline-block w-14 border-b-2 border-ink-muted align-baseline" />}
              </span>
            ))}
          </p>
          {question.sentence?.translation && <p className="text-sm text-ink-muted">{question.sentence.translation}</p>}
        </div>
      )}
      {view.display === 'latin' && (
        <p
          aria-hidden="true"
          className={cn('break-words font-display font-extrabold text-primary', length <= 5 ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl')}
        >
          {prompt}
        </p>
      )}
      {view.display === 'audio' && (
        <>
          <button
            type="button"
            onClick={onReplay}
            aria-label="Play the sound"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-150 hover:bg-primary/15 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none sm:h-28 sm:w-28"
          >
            <Icon name="volume_up" className="text-5xl" />
          </button>
          <p className="text-xs text-ink-muted">
            Tap to hear it again<span className="hidden sm:inline"> · press R</span>
          </p>
        </>
      )}
    </div>
  )
})
