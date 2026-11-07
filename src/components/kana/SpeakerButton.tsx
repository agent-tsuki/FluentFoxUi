import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

interface SpeakerButtonProps {
  onClick: () => void
  label?: string
  className?: string
  /** The clip is still loading (e.g. generated on first play): shows a spinner until it plays. */
  loading?: boolean
}

/**
 * SpeakerButton — 44px round icon button that plays a kana or word aloud;
 * a spinner replaces the speaker while its clip loads.
 * Inline SVG speaker (the icon-font subset has no volume glyph yet).
 */
export function SpeakerButton({ onClick, label = 'Play sound', className, loading = false }: SpeakerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-primary',
        'bg-primary/10 transition-colors hover:bg-primary/15 active:bg-primary/20',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      {loading ? (
        <>
          <Icon name="progress_activity" className="animate-spin text-2xl motion-reduce:animate-none" />
          <span className="sr-only"> (loading the voice)</span>
        </>
      ) : (
        <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
        </svg>
      )}
    </button>
  )
}
