import type { KanjiGroup } from '@/types'
import { KanjiCard } from './KanjiCard'

const levelAccent: Record<string, string> = {
  N5: 'bg-tertiary',
  N4: 'bg-primary',
  N3: 'bg-secondary',
  N2: 'bg-amber-500',
  N1: 'bg-rose-600',
}

interface KanjiGridProps {
  group: KanjiGroup
}

export function KanjiGrid({ group }: KanjiGridProps) {
  return (
    <section className="mb-28">
      {/* Section header */}
      <div className="flex flex-col items-center mb-16">
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-2">{group.title}</h2>
        <p className="text-on-surface-variant text-sm mb-6 max-w-md">{group.description}</p>
        <div className={`h-[3px] w-16 ${levelAccent[group.level] ?? 'bg-primary'}`} />
      </div>

      {/* Grid — 4 columns on md+, 2 on small */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
        {group.chars.map((kanji) => (
          <KanjiCard key={kanji.id} kanji={kanji} />
        ))}
      </div>
    </section>
  )
}
