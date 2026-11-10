import { forwardRef, lazy, Suspense } from 'react'
import { cn } from '@/lib/cn'
import { useAfterLoadIdle } from '@/hooks/useAfterLoadIdle'

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
 * FoxLogo — the animated FoxSensei fox (Lottie). lottie-web and the animation
 * are only fetched once the page has loaded and the browser is idle, so they
 * never compete with the first screen on slow connections. Until then the
 * static fox (the same small PNG the browser already fetches as the favicon)
 * holds its place. The ref's play/reverse are no-ops until the animation loads.
 */
export const FoxLogo = forwardRef<FoxLogoHandle, FoxLogoProps>((props, ref) => {
  const size = props.size ?? 48
  const animationReady = useAfterLoadIdle()
  const placeholder = (
    <img
      src="/favicon/favicon-96x96.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      decoding="async"
      // Padded so the static fox matches the animation's fox, which fills ~87%
      // of its frame: no visible jump when the animation replaces it.
      className={cn('inline-block object-contain p-[6.5%]', props.className)}
      style={{ width: size, height: size }}
    />
  )
  if (!animationReady) return placeholder
  return (
    <Suspense fallback={placeholder}>
      <FoxLogoAnimation ref={ref} {...props} />
    </Suspense>
  )
})
