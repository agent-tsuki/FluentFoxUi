import { useEffect, useState } from 'react'
import type { CurriculumCardData } from '@/types'
import { curriculumService } from '@/api/services/curriculumService'
import { CurriculumCard } from './CurriculumCard'

export function CurriculumGrid() {
  const [cards, setCards] = useState<CurriculumCardData[]>([])

  useEffect(() => {
    curriculumService.getCards().then(setCards)
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-8 py-32">
      <div className="text-center space-y-4 mb-20">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight">
          Structured for Mastery
        </h2>
        <p className="text-on-surface-variant max-w-xl mx-auto">
          From your first 'Ohayou' to reading Haruki Murakami in the original text, we have a
          curated path for you.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {cards.map((card) => (
          <CurriculumCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}
