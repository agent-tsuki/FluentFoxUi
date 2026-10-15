import { Hero } from '@/components/sections/Hero'
import {
  FeaturesSection,
  HowItWorks,
  CoursesSection,
  DashboardPreview,
  Testimonials,
  CTABanner,
} from '@/components/sections/HomePage'

export function HomePage() {
  return (
    <main className="pt-nav">
      <Hero />
      <FeaturesSection />
      <DashboardPreview />
      <HowItWorks />
      <CoursesSection />
      <Testimonials />
      <CTABanner />
    </main>
  )
}
