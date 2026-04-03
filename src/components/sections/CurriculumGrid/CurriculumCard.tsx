import type { CurriculumCardData } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface CurriculumCardProps {
  card: CurriculumCardData
}

export function CurriculumCard({ card }: CurriculumCardProps) {
  return (
    <div className="group bg-surface-container-low p-10 rounded-2xl hover:bg-surface-container-lowest transition-all duration-300 hover:shadow-[0_30px_60px_rgba(25,28,29,0.05)]">
      <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
        <Icon name={card.icon} className="text-primary text-3xl" />
      </div>
      <h4 className="font-headline text-2xl font-bold mb-4">{card.title}</h4>
      <p className="text-on-surface-variant mb-8 leading-relaxed">{card.description}</p>
      <a
        href={card.href}
        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
      >
        Explore Level <Icon name="arrow_forward" />
      </a>
    </div>
  )
}
