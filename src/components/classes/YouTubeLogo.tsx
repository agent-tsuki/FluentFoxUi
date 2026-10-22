import { cn } from '@/lib/cn'

interface YouTubeLogoProps {
  /** Accessible name; omit when the logo sits next to visible text that already says "YouTube". */
  title?: string
  className?: string
}

/**
 * YouTubeLogo — the official YouTube icon (red play button) for channel names and
 * YouTube links. Per YouTube's brand rules the mark keeps its exact shape,
 * proportions and colours (#FF0000 / white) in both themes, so it deliberately
 * uses the brand hex values instead of design tokens. Size it by height only
 * (`h-4`, `h-5`); the width follows the 1.43:1 aspect ratio.
 */
export function YouTubeLogo({ title, className }: YouTubeLogoProps) {
  return (
    <svg
      viewBox="0 0 28.57 20"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={cn('inline-block h-4 w-auto shrink-0', className)}
    >
      <path
        fill="#FF0000"
        d="M27.973 3.123A3.578 3.578 0 0 0 25.447.597C23.22 0 14.285 0 14.285 0S5.35 0 3.123.597A3.578 3.578 0 0 0 .597 3.123C0 5.35 0 10 0 10s0 4.65.597 6.877a3.578 3.578 0 0 0 2.526 2.526C5.35 20 14.285 20 14.285 20s8.935 0 11.162-.597a3.578 3.578 0 0 0 2.526-2.526C28.57 14.65 28.57 10 28.57 10s-.002-4.65-.597-6.877Z"
      />
      <path fill="#FFFFFF" d="M11.425 14.285 18.848 10l-7.423-4.285v8.57Z" />
    </svg>
  )
}
