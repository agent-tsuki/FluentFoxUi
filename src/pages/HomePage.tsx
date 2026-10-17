import {
  HomeHero,
  LevelPicker,
  LearningPath,
  DashboardExample,
  WhyItWorks,
  ResourcesSection,
  FounderSection,
  FaqSection,
  FinalCta,
} from '@/components/sections/HomePage'

export function HomePage() {
  return (
    <main className="pt-nav">
      <HomeHero />
      <LevelPicker />
      <LearningPath />
      <DashboardExample />
      <WhyItWorks />
      <ResourcesSection />
      <FounderSection />
      <FaqSection />
      <FinalCta />
    </main>
  )
}
