import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface PracticeShellProps {
  title: string
  /** 0–1. Omit for open-ended modes (e.g. a timed round shows its own timer). */
  progress?: number
  /** Short status on the right of the header, e.g. "3 / 10" or "0:42". */
  status?: ReactNode
  onExit: () => void
  children: ReactNode
}

/**
 * Shared frame for every practice mode: exit, title, progress, then the mode's
 * own content. Interactive content should sit in the lower half of the screen
 * on phones (thumb reach); the shell keeps its header compact for that.
 */
export function PracticeShell({ title, progress, status, onExit, children }: PracticeShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-theme(spacing.nav))] w-full max-w-xl flex-col px-4 pb-6 pt-3 sm:px-6 sm:pt-6">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit practice"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name="close" className="text-2xl" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-headline text-base font-bold text-on-surface">{title}</p>
          {progress !== undefined && (
            <div
              role="progressbar"
              aria-label={`${title} progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container-high"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
              />
            </div>
          )}
        </div>
        {status !== undefined && (
          <div className="shrink-0 font-label text-sm font-bold tabular-nums text-on-surface-variant">{status}</div>
        )}
      </header>
      <div className="flex flex-1 flex-col pt-4 sm:pt-6">{children}</div>
    </div>
  )
}

interface PracticeResultsProps {
  /** Large headline, e.g. "8 of 10 correct". */
  headline: string
  detail?: string
  /** Kana (characters) to show as "keep practising", optional. */
  missed?: string[]
  onAgain: () => void
  onExit: () => void
}

export function PracticeResults({ headline, detail, missed, onAgain, onExit }: PracticeResultsProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center" role="status">
      <Icon name="celebration" className="text-5xl text-primary" />
      <div>
        <p className="font-headline text-2xl font-extrabold text-on-surface">{headline}</p>
        {detail && <p className="mt-1 text-on-surface-variant">{detail}</p>}
      </div>
      {missed && missed.length > 0 && (
        <div className="w-full rounded-2xl bg-surface-container-low p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Keep practising</p>
          <p lang="ja" className="text-3xl font-bold tracking-wider text-on-surface">{missed.join(' ')}</p>
        </div>
      )}
      <div className="mt-auto flex w-full flex-col gap-2 sm:mt-0 sm:flex-row sm:justify-center">
        <Button onClick={onAgain} className="min-h-12">Play again</Button>
        <Button variant="outline" onClick={onExit} className="min-h-12">Back to chart</Button>
      </div>
    </div>
  )
}
