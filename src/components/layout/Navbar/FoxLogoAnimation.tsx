import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { useRef, forwardRef, useImperativeHandle } from "react"
import happyFoxAnimation from "@/assets/animations/happy_fox.json"
import type { FoxLogoHandle, FoxLogoProps } from "./FoxLogo"

/**
 * The Lottie fox itself. Loaded lazily through `FoxLogo` so lottie-web and
 * the animation JSON stay out of the initial bundle — import `FoxLogo`, not this.
 */
export const FoxLogoAnimation = forwardRef<FoxLogoHandle, FoxLogoProps>(
  ({ size = 48, className, autoplay = false, loop = false }, ref) => {
    const lottieRef = useRef<LottieRefCurrentProps>(null)
    const blendClass = "mix-blend-multiply dark:mix-blend-screen"

    useImperativeHandle(ref, () => ({
      play: () => {
        lottieRef.current?.setDirection(1)
        lottieRef.current?.play()
      },
      reverse: () => {
        lottieRef.current?.setDirection(-1)
        lottieRef.current?.play()
      },
    }))

    return (
      <Lottie
        lottieRef={lottieRef}
        animationData={happyFoxAnimation}
        autoplay={autoplay}
        loop={loop}
        style={{ width: size, height: size }}
        className={`${blendClass} ${className ?? ""}`}
      />
    )
  }
)
FoxLogoAnimation.displayName = 'FoxLogoAnimation'
