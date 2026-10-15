import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Whether decorative, always-running effects (koi Lottie, falling petals,
 * cursor follower) should render at all. False when the user prefers reduced
 * motion, or on touch / coarse-pointer devices, where a cursor follower is
 * meaningless and the continuous animation costs battery and main-thread time
 * on the weakest hardware.
 */
export function useAmbientMotion(): boolean {
  const reducedMotion = useReducedMotion()
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  return !reducedMotion && !coarsePointer
}
