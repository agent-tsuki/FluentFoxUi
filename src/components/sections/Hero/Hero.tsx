import { useEffect, useState, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useModal } from '@/context/ModalContext'

// Lazy-load the heavy Lottie animation (~384 KB JSON) after first paint
const StudentLottie = lazy(() =>
  import('@/assets/animations/student.json').then((mod) => ({
    default: function StudentAnim() {
      const [Lottie, setLottie] = useState<typeof import('lottie-react').default | null>(null)
      useEffect(() => {
        import('lottie-react').then((m) => setLottie(() => m.default))
      }, [])
      if (!Lottie) return null
      return <Lottie animationData={mod.default} loop className="w-full h-auto" />
    },
  }))
)

export function Hero() {
  const { openModal } = useModal()

  const scrollToLearn = () => {
    document.getElementById('learn-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative max-w-7xl mx-auto px-8 py-20 md:py-32 grid md:grid-cols-2 gap-16 items-center">
      {/* Left — Copy */}
      <div className="space-y-8">
        {/* Badge — pings 3 times then stops */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label text-[0.7rem] font-bold uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
              style={{ animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) 3' }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Join now
        </div>

        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface leading-[1.1]">
          Learn Japanese. <br />
          <span className="text-primary italic">Naturally.</span>
        </h1>

        <p className="text-xl text-on-surface-variant max-w-md leading-relaxed">
          Master Japanese through editorial-grade content, contextual immersion, and a
          distraction-free environment. No gamified stress—just deep learning.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            variant="primary"
            className="bg-primary-container px-8 py-4 rounded-lg text-lg shadow-xl shadow-primary/30"
            onClick={() => openModal('signup')}
          >
            Get Started for Free
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg"
            onClick={scrollToLearn}
          >
            <Icon name="play_circle" />
            How it works
          </Button>
        </div>
      </div>

      {/* Right — Animation (lazy loaded) */}
      <div className="relative flex justify-center items-center">
        <div className="w-full max-w-[650px]">
          <Suspense
            fallback={
              <div className="w-full aspect-square max-w-[650px] rounded-full bg-primary/5 animate-pulse" />
            }
          >
            <StudentLottie />
          </Suspense>
        </div>
        {/* Decorative blur */}
        <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}
