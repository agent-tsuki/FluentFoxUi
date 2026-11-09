import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { cn } from '@/lib/cn'
import type { TestPrompt, TestQuestion } from '@/lib/testCenter/types'

const GAP_LINE = 'mx-1 inline-block w-16 border-b-2 border-on-surface-variant align-baseline'

/** A line to hear: nothing plays until the learner taps, so browsers allow the sound. */
function ListenButton({ prompt, compact }: { prompt: Extract<TestPrompt, { type: 'audio' }>; compact: boolean }) {
  const { speak, loadingText } = useJapaneseSpeech()
  const loading = loadingText === prompt.text
  return (
    <Button
      type="button"
      onClick={() => speak(prompt.text, { voice: prompt.voice })}
      className={cn('flex items-center justify-center gap-2', compact ? 'min-h-11 !px-4 !py-2 text-sm' : 'mx-auto min-h-14 !px-6')}
    >
      <Icon name={loading ? 'progress_activity' : 'volume_up'} className={cn(compact ? 'text-xl' : 'text-2xl', loading && 'animate-spin motion-reduce:animate-none')} />
      Play the sentence
    </Button>
  )
}

function PictureSentence({ prompt, compact }: { prompt: Extract<TestPrompt, { type: 'picture' }>; compact: boolean }) {
  return (
    <>
      <img
        src={prompt.src}
        alt={prompt.alt}
        width={640}
        height={480}
        loading="lazy"
        className={cn('aspect-[4/3] w-full rounded-2xl border border-outline-variant/60 object-cover', compact ? 'mb-3 max-w-[14rem]' : 'mx-auto mb-5 max-w-xs')}
      />
      <p lang="ja" className={cn('font-jp font-medium leading-relaxed text-on-surface', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
        {prompt.before}
        <span className={GAP_LINE} aria-label="gap" />
        {prompt.after}
      </p>
    </>
  )
}

function Exchange({ prompt, compact }: { prompt: Extract<TestPrompt, { type: 'exchange' }>; compact: boolean }) {
  return (
    <>
      <div className={cn('space-y-2 rounded-2xl bg-surface-container-low p-4 text-left', !compact && 'mx-auto max-w-md')}>
        {prompt.lines.map((line) => (
          <p key={line} lang="ja" className={cn('font-jp leading-relaxed text-on-surface', compact ? 'text-base' : 'text-lg')}>
            {line}
          </p>
        ))}
      </div>
      <p className={cn('font-headline font-bold text-on-surface', compact ? 'mt-3 text-base' : 'mt-5 text-xl sm:text-2xl')}>{prompt.statement}</p>
    </>
  )
}

/**
 * The question's main line: a big item, a sentence, a sentence with a gap
 * (`slot` fills it), a line to hear, a picture or an exchange. `compact` is
 * the smaller, left-aligned form used when many questions share a page;
 * `hints` off hides the line under it (the English or the reading).
 */
export function QuestionPrompt({ question, slot, compact = false, hints = true }: { question: TestQuestion; slot?: ReactNode; compact?: boolean; hints?: boolean }) {
  const { prompt } = question
  return (
    <div className={compact ? 'text-left' : 'my-8 text-center sm:my-10'}>
      {question.source && (
        <p lang="ja" className={cn('font-jp text-on-surface-variant', compact ? 'mb-1 text-base' : 'mb-4 text-lg')}>
          {question.source}
        </p>
      )}
      {prompt.type === 'audio' ? (
        <ListenButton prompt={prompt} compact={compact} />
      ) : prompt.type === 'picture' ? (
        <PictureSentence prompt={prompt} compact={compact} />
      ) : prompt.type === 'exchange' ? (
        <Exchange prompt={prompt} compact={compact} />
      ) : prompt.type === 'glyph' ? (
        <p
          lang={prompt.ja ? 'ja' : undefined}
          className={cn(
            'font-bold text-on-surface',
            compact
              ? prompt.ja
                ? 'font-jp text-2xl'
                : 'font-headline text-lg'
              : prompt.ja
                ? cn('font-jp leading-none', Array.from(prompt.text).length <= 2 ? 'text-7xl sm:text-8xl' : 'text-5xl sm:text-6xl')
                : 'font-headline text-3xl sm:text-4xl',
          )}
        >
          {prompt.text}
        </p>
      ) : prompt.type === 'sentence' ? (
        <p lang="ja" className={cn('font-jp font-medium leading-relaxed text-on-surface', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
          {prompt.text}
        </p>
      ) : (
        <p lang="ja" className={cn('font-jp font-medium text-on-surface', compact ? 'text-xl leading-[2.2]' : 'text-2xl leading-[2.4] sm:text-3xl sm:leading-[2.2]')}>
          {prompt.before}
          {slot ?? <span className={GAP_LINE} aria-label="gap" />}
          {prompt.after}
        </p>
      )}
      {hints && question.translation && <p className={cn('text-sm text-on-surface-variant', compact ? 'mt-1' : 'mt-3')}>{question.translation}</p>}
    </div>
  )
}
