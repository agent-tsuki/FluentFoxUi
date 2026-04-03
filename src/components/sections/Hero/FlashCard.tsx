import type { FlashCardData } from '@/types'

interface FlashCardProps {
  card: FlashCardData
  dotCount?: number
  activeDot?: number
}

export function FlashCard({ card, dotCount = 3, activeDot = 0 }: FlashCardProps) {
  return (
    <div className="relative w-72 h-96 group">
      {/* Glow background */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-3xl transform -rotate-6" />

      {/* Card */}
      <div className="w-full h-full bg-surface-container-lowest rounded-2xl shadow-[0_40px_80px_rgba(25,28,29,0.08)] flex flex-col items-center justify-center p-8 border-b-4 border-primary/20 transform hover:-translate-y-4 transition-transform duration-500 ease-out relative overflow-hidden">
        {/* Watermark top-right */}
        <div className="absolute top-6 right-6 text-on-surface-variant/20 font-headline font-black text-4xl select-none">
          {card.character}
        </div>

        {/* Large faded background character */}
        <div className="text-primary/10 text-9xl absolute font-headline select-none">
          {card.character}
        </div>

        {/* Main character */}
        <div
          className="text-on-surface font-headline text-9xl font-bold mb-4 relative z-10 transition-all duration-300"
          style={{ textShadow: 'none' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLDivElement).style.textShadow =
              '0 0 25px rgba(172, 0, 30, 0.2)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLDivElement).style.textShadow = 'none')
          }
        >
          {card.character}
        </div>

        {/* Reading label */}
        <div className="space-y-1 text-center relative z-10">
          <p className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant">
            Reading
          </p>
          <p className="font-headline text-2xl font-bold text-primary">{card.reading}</p>
        </div>

        {/* Pagination dots */}
        <div className="mt-8 flex gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === activeDot ? 'bg-primary' : 'bg-surface-container-high'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
