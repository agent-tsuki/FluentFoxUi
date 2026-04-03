import { useEffect, useState } from 'react'
import type { KanaSection } from '@/types'
import { hiraganaService } from '@/api/services/hiraganaService'
import {
  HiraganaHero,
  CharGrid,
  VariantCharGrid,
  LearningGuide,
} from '@/components/sections/HiraganaChart'

export function HiraganaPage() {
  const [sections, setSections] = useState<KanaSection[]>([])

  useEffect(() => {
    hiraganaService.getSections().then(setSections)
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  // Split basic section from the two variant sections for layout purposes
  const basicSection = sections.find((s) => s.id === 'basic')
  const variantSections = sections.filter((s) => s.id !== 'basic')

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
      <HiraganaHero />

      {/* Basic Hiragana — full width */}
      {basicSection && <CharGrid section={basicSection} />}

      {/* Dakuten + Combinations — side by side on large screens */}
      {variantSections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-6xl mx-auto mt-16">
          {variantSections.map((section) => (
            <VariantCharGrid key={section.id} section={section} />
          ))}
        </div>
      )}

      <LearningGuide />
    </main>
  )
}
