import type { KanaSection } from '@/types'
import { CharCard } from './CharCard'

interface VariantCharGridProps {
  section: KanaSection
}

const gridCols: Record<number, string> = {
  3: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5',
  5: 'grid-cols-3 sm:grid-cols-5',
}

const accentClasses: Record<KanaSection['accentColor'], string> = {
  primary: 'bg-primary',
  tertiary: 'bg-tertiary',
}

export function VariantCharGrid({ section }: VariantCharGridProps) {
  const colClass = gridCols[section.columns] ?? 'grid-cols-5'

  return (
    <section>
      {/* Section header */}
      <div className="flex flex-col items-center mb-10">
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-3">
          {section.title}
        </h2>
        <div className={`h-[3px] w-12 ${accentClasses[section.accentColor]}`} />
      </div>

      {/* Grid — small, non-interactive cards */}
      <div className={`grid ${colClass} gap-4`}>
        {section.chars.map((char) => (
          <CharCard
            key={char.id}
            char={char}
            size="sm"
            interactive={false}
          />
        ))}
      </div>
    </section>
  )
}
