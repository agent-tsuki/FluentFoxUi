import { useEffect, useRef } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import happyFoxAnimation from '@/assets/animations/happy_fox.json'

/** The happy-fox animation is 4 s; play it at 2× so the burst lasts ~2 s. */
const SPEED = 2

/**
 * One play of the happy fox for the row celebration. Heavy (lottie-web +
 * JSON): RowCelebration loads it with `React.lazy`, never import it directly.
 */
export function CelebrationFox({ size = 88 }: { size?: number }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    lottieRef.current?.setSpeed(SPEED)
  }, [])

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={happyFoxAnimation}
      autoplay
      loop={false}
      onDOMLoaded={() => lottieRef.current?.setSpeed(SPEED)}
      style={{ width: size, height: size }}
      className="mix-blend-multiply dark:mix-blend-screen"
      aria-hidden
    />
  )
}
