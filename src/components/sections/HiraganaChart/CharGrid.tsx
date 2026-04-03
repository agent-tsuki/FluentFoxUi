import type { KanaSection } from '@/types'
import { CharCard } from './CharCard'

interface CharGridProps {
  section: KanaSection
}

const gridCols: Record<number, string> = {
  3: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-5',
}

const accentClasses: Record<KanaSection['accentColor'], string> = {
  primary: 'bg-primary',
  tertiary: 'bg-tertiary',
}

export function CharGrid({ section }: CharGridProps) {
  const isLg = section.columns === 5
  const colClass = gridCols[section.columns] ?? 'grid-cols-5'

  return (
    <section className="mb-28">
      {/* Section header */}
      <div className="flex flex-col items-center mb-16">
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-4">
          {section.title}
        </h2>
        <div className={`h-[3px] w-16 ${accentClasses[section.accentColor]}`} />
      </div>

      {/* Grid */}
      <div className={`grid ${colClass} gap-6 max-w-5xl mx-auto`}>
        {section.chars.map((char) => (
          <CharCard key={char.id} char={char} size={isLg ? 'lg' : 'sm'} />
        ))}
      </div>
    </section>
  )
}
