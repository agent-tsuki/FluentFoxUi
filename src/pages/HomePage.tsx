import { Hero } from '@/components/sections/Hero'
import { InteractiveWidget } from '@/components/sections/InteractiveWidget'
import { CurriculumGrid } from '@/components/sections/CurriculumGrid'
import { Newsletter } from '@/components/sections/Newsletter'

export function HomePage() {
  return (
    <main className="pt-24">
      <Hero />
      <InteractiveWidget />
      <CurriculumGrid />
      <Newsletter />
    </main>
  )
}
