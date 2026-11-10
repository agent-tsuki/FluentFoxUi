import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { cn } from '@/lib/cn'
import type { TestPrompt, TestQuestion } from '@/lib/testCenter/types'

const GAP_LINE = 'mx-1 inline-block w-16 border-b-2 border-ink-muted align-baseline'

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
        className={cn('aspect-[3/2] w-full rounded-lg bg-surface-sunken object-contain', compact ? 'mb-3 max-w-[14rem]' : 'mx-auto mb-5 max-w-md')}
      />
      <p lang="ja" className={cn('font-ja font-medium leading-relaxed text-ink', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
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
      <div className={cn('space-y-2 rounded-xl bg-surface-sunken p-4 text-left', !compact && 'mx-auto max-w-md')}>
        {prompt.lines.map((line) => (
          <p key={line} lang="ja" className={cn('font-ja leading-relaxed text-ink', compact ? 'text-base' : 'text-lg')}>
            {line}
          </p>
        ))}
      </div>
      <p className={cn('font-display font-bold text-ink', compact ? 'mt-3 text-base' : 'mt-5 text-xl sm:text-2xl')}>{prompt.statement}</p>
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
        <p lang="ja" className={cn('font-ja text-ink-muted', compact ? 'mb-1 text-base' : 'mb-4 text-lg')}>
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
            'font-bold text-ink',
            compact
              ? prompt.ja
                ? 'font-ja text-2xl'
                : 'font-display text-lg'
              : prompt.ja
                ? cn('font-ja leading-none', Array.from(prompt.text).length <= 2 ? 'text-7xl sm:text-8xl' : 'text-5xl sm:text-6xl')
                : 'font-display text-3xl sm:text-4xl',
          )}
        >
          {prompt.text}
        </p>
      ) : prompt.type === 'sentence' ? (
        <p lang="ja" className={cn('font-ja font-medium leading-relaxed text-ink', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
          {prompt.text}
        </p>
      ) : (
        <p lang="ja" className={cn('font-ja font-medium text-ink', compact ? 'text-xl leading-[2.2]' : 'text-2xl leading-[2.4] sm:text-3xl sm:leading-[2.2]')}>
          {prompt.before}
          {slot ?? <span className={GAP_LINE} aria-label="gap" />}
          {prompt.after}
        </p>
      )}
      {hints && question.translation && <p className={cn('text-sm text-ink-muted', compact ? 'mt-1' : 'mt-3')}>{question.translation}</p>}
    </div>
  )
}
