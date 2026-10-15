import { useCallback, useEffect, useState } from 'react'
import type { KanaSection } from '@/types'
import { hiraganaService } from '@/api/services/hiraganaService'
import {
  HiraganaHero,
  CharGrid,
  VariantCharGrid,
  LearningGuide,
} from '@/components/sections/HiraganaChart'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

type Status = 'loading' | 'error' | 'ready'

export function HiraganaPage() {
  const [sections, setSections] = useState<KanaSection[]>([])
  const [status, setStatus] = useState<Status>('loading')

  const fetchSections = useCallback(() => {
    setStatus('loading')
    hiraganaService
      .getSections()
      .then((data) => {
        setSections(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    fetchSections()
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [fetchSections])

  if (status === 'loading') {
    return (
      <main className="pt-nav pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <LoadingState label="Loading hiragana chart…">
          <div className="space-y-4 text-center mb-16">
            <SkeletonBlock className="h-9 w-64 rounded-xl mx-auto" />
            <SkeletonBlock className="h-5 w-96 max-w-full rounded-xl mx-auto" />
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 max-w-4xl mx-auto">
            {Array.from({ length: 40 }).map((_, i) => (
              <SkeletonBlock key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </LoadingState>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="pt-nav pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <ErrorState message="We couldn't load the hiragana chart." onRetry={fetchSections} />
      </main>
    )
  }

  // Split basic section from the two variant sections for layout purposes
  const basicSection = sections.find((s) => s.id === 'basic')
  const variantSections = sections.filter((s) => s.id !== 'basic')

  return (
    <main className="pt-nav pb-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
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
