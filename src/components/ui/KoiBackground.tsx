import { useEffect, useRef } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import koiAnimation from '@/assets/animations/koi_loader.json'
import { useUI } from '@/context/UIContext'

/**
 * KoiBackground — the swimming-koi Lottie behind the app shell. Pauses while
 * the tab is hidden. Heavy (lottie-web + JSON): load it with `React.lazy`
 * and only when ambient motion is allowed (see `useAmbientMotion`).
 */
export function KoiBackground() {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const { darkMode } = useUI()

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        lottieRef.current?.pause()
      } else {
        lottieRef.current?.play()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-500"
      style={{ opacity: darkMode ? 0.18 : 0.08, zIndex: 0 }}
    >
      <div className="w-[1200px] h-[1200px] transform translate-y-32">
        <Lottie
          lottieRef={lottieRef}
          animationData={koiAnimation}
          loop
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
