import { useModal } from '@/context/ModalContext'
import { FadeIn } from '@/components/ui/FadeIn'

export function CTABanner() {
  const { openModal } = useModal()

  return (
    <FadeIn>
      <div className="relative z-10 py-20 px-6 md:px-10 text-center overflow-hidden" style={{ background: '#EA6B44' }}>
        {/* Watermark kanji */}
        <div
          className="absolute pointer-events-none select-none font-headline font-bold"
          style={{
            top: -60, left: '50%', transform: 'translateX(-50%)',
            fontSize: 280, color: 'rgba(255,255,255,0.06)',
            whiteSpace: 'nowrap',
          }}
        >
          がんばれ
        </div>

        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-4 relative">
          Start Your Japanese Journey Today
        </h2>
        <p className="text-lg text-white/85 max-w-lg mx-auto leading-relaxed font-body mb-9 relative">
          No credit card needed. Access grammar, flashcards, and quizzes completely free — forever.
        </p>
        <button
          onClick={() => openModal('signup')}
          className="px-10 py-4 bg-white text-primary font-extrabold text-base rounded-[14px] font-headline transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.22)] relative"
        >
          Begin Learning Free →
        </button>
      </div>
    </FadeIn>
  )
}
