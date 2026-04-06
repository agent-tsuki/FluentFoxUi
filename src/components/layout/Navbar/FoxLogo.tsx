import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { useRef, forwardRef, useImperativeHandle } from "react"
import happyFoxAnimation from "@/assets/animations/happy_fox.json"

interface FoxLogoProps {
  size?: number
  className?: string
  autoplay?: boolean
  loop?: boolean
}

export interface FoxLogoHandle {
  play: () => void
  reverse: () => void
}

export const FoxLogo = forwardRef<FoxLogoHandle, FoxLogoProps>(
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
