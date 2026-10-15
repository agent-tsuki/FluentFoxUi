import { forwardRef, lazy, Suspense } from 'react'
import { cn } from '@/lib/cn'

export interface FoxLogoProps {
  size?: number
  className?: string
  autoplay?: boolean
  loop?: boolean
}

export interface FoxLogoHandle {
  play: () => void
  reverse: () => void
}

const FoxLogoAnimation = lazy(() =>
  import('./FoxLogoAnimation').then(m => ({ default: m.FoxLogoAnimation })),
)

/**
 * FoxLogo — the animated FoxSensei fox (Lottie). The animation is lazy-loaded
 * so lottie-web stays out of the initial bundle; until it arrives, an empty
 * box of the same size holds the layout. The ref's play/reverse are no-ops
 * until then.
 */
export const FoxLogo = forwardRef<FoxLogoHandle, FoxLogoProps>((props, ref) => {
  const size = props.size ?? 48
  return (
    <Suspense
      fallback={<span aria-hidden className={cn('inline-block', props.className)} style={{ width: size, height: size }} />}
    >
      <FoxLogoAnimation ref={ref} {...props} />
    </Suspense>
  )
})
FoxLogo.displayName = 'FoxLogo'
