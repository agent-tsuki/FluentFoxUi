import type { CurriculumCardData } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface CurriculumCardProps {
  card: CurriculumCardData
}

export function CurriculumCard({ card }: CurriculumCardProps) {
  return (
    <div className="group bg-surface-sunken p-10 rounded-xl hover:bg-surface-raised transition-all duration-300 hover:shadow-elevation-2">
      <div className="w-16 h-16 rounded-md bg-surface-raised flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
        <Icon name={card.icon} className="text-primary text-3xl" />
      </div>
      <h4 className="font-display text-2xl font-bold mb-4">{card.title}</h4>
      <p className="text-ink-muted mb-8 leading-relaxed">{card.description}</p>
      <a
        href={card.href}
        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
      >
        Explore Level <Icon name="arrow_forward" />
      </a>
    </div>
  )
}
