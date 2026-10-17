import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import type { QuestionView } from '@/lib/learn/questionView'
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
      <h2 ref={ref} tabIndex={-1} className="text-sm font-semibold text-on-surface-variant focus:outline-none">
        {view.ask}
        {view.display !== 'audio' && <span className="sr-only"> {prompt}</span>}
      </h2>
      {view.display === 'japanese' && (
        <p
          lang="ja"
          aria-hidden="true"
          className={cn(
            'font-jp font-bold leading-none text-on-surface',
            length <= 2 ? 'text-8xl sm:text-9xl' : length <= 4 ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-7xl',
          )}
        >
          {prompt}
        </p>
      )}
      {view.display === 'latin' && (
        <p
          aria-hidden="true"
          className={cn('break-words font-headline font-extrabold text-primary', length <= 5 ? 'text-6xl sm:text-7xl' : 'text-4xl sm:text-5xl')}
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
          <p className="text-xs text-on-surface-variant">
            Tap to hear it again<span className="hidden sm:inline"> · press R</span>
          </p>
        </>
      )}
    </div>
  )
})
