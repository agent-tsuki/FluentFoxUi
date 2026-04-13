import { Hero } from '@/components/sections/Hero'
import {
  StatsBar,
  FeaturesSection,
  HowItWorks,
  CoursesSection,
  DashboardPreview,
  Testimonials,
  CTABanner,
} from '@/components/sections/HomePage'

export function HomePage() {
  return (
    <main className="pt-[68px]">
      <Hero />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <CoursesSection />
      <DashboardPreview />
      <Testimonials />
      <CTABanner />
    </main>
  )
}
