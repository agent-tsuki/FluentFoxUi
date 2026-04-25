import { useModal } from '@/context/ModalContext'
import { FadeIn } from '@/components/ui/FadeIn'

export function CTABanner() {
  const { openModal } = useModal()

  return (
    <FadeIn>
      <div className="relative z-10 py-16 px-6 md:px-10 text-center overflow-hidden" style={{ background: '#EA6B44' }}>
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
        <button
          onClick={() => openModal('signup')}
          className="px-8 py-3.5 bg-white text-primary font-bold text-base rounded-xl font-headline transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.16)] relative"
        >
          Create Free Account
        </button>
      </div>
    </FadeIn>
  )
}
