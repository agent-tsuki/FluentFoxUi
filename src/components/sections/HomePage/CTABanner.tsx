import { useModal } from '@/context/ModalContext'
import { FadeIn } from '@/components/ui/FadeIn'
import { Button } from '@/components/ui/Button'

export function CTABanner() {
  const { openModal } = useModal()

  return (
    <FadeIn>
      <div className="relative z-10 py-16 px-6 md:px-10 text-center overflow-hidden bg-primary">
        {/* Watermark kanji */}
        <div
          className="absolute pointer-events-none select-none font-headline font-bold"
          style={{
            top: -60, left: '50%', transform: 'translateX(-50%)',
            fontSize: 220, color: 'rgba(255,255,255,0.05)',
            whiteSpace: 'nowrap',
          }}
        >
          がんばれ
        </div>

        <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-white mb-3 relative">
          Start Learning Today
        </h2>
        <p className="text-base text-white/90 max-w-lg mx-auto leading-relaxed font-body mb-7 relative">
          No credit card needed. Learn with lessons, flashcards, and quizzes for free.
        </p>
        <Button
          variant="white"
          onClick={() => openModal('signup')}
          className="px-8 py-3.5 text-base font-headline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevation-2 relative"
        >
          Create Free Account
        </Button>
      </div>
    </FadeIn>
  )
}
