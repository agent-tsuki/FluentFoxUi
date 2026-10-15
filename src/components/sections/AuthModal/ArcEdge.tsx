import { cn } from '@/lib/cn'

interface ArcEdgeProps {
  /** Tailwind fill class matching the surface the arc caps, e.g. `fill-surface-container-lowest`. */
  fillClassName: string
  className?: string
}

/**
 * ArcEdge — the smooth circular top edge of a surface that rises out of a
 * colored panel. Place it directly above the surface (absolute, bottom-full)
 * so the arc and the surface read as one shape.
 *
 * The path is an exact circle segment: chord 100, sagitta 10, radius 130.
 * It is nudged down 1px to overlap the surface and hide any sub-pixel seam.
 */
export function ArcEdge({ fillClassName, className }: ArcEdgeProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-x-0 bottom-full block w-full translate-y-px', className)}
    >
      <path d="M0 10 A130 130 0 0 1 100 10 Z" className={fillClassName} />
    </svg>
  )
}
