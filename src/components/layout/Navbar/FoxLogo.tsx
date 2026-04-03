import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { useRef } from "react"
import happyFoxAnimation from "@/assets/animations/happy_fox.json"

interface FoxLogoProps {
  size?: number
  className?: string
  autoplay?: boolean
  loop?: boolean
}

export function FoxLogo({ size = 48, className, autoplay = false, loop = false }: FoxLogoProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const blendClass = "mix-blend-multiply dark:mix-blend-screen"

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={happyFoxAnimation}
      autoplay={autoplay}
      loop={loop}
      style={{ width: size, height: size, cursor: autoplay ? "default" : "pointer" }}
      className={`${blendClass} ${className ?? ""}`}
      onMouseEnter={() => {
        if (autoplay) return
        lottieRef.current?.setDirection(1)
        lottieRef.current?.play()
      }}
      onMouseLeave={() => {
        if (autoplay) return
        lottieRef.current?.setDirection(-1)
        lottieRef.current?.play()
      }}
    />
  )
}
