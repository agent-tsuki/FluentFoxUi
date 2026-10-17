import { cn } from '@/lib/cn'

interface SpeakerButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

/**
 * SpeakerButton — 44px round icon button that plays a kana or word aloud.
 * Inline SVG speaker (the icon-font subset has no volume glyph yet).
 */
export function SpeakerButton({ onClick, label = 'Play sound', className }: SpeakerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-primary',
        'bg-primary/10 transition-colors hover:bg-primary/15 active:bg-primary/20',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
      </svg>
    </button>
  )
}
