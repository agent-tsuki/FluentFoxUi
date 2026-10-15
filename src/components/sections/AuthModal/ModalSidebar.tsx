import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { swapVariants } from '@/lib/motion'
import { SocialAuthSheet } from './SocialAuthSheet'

const features = [
  'Personalized Kanji Tracks',
  'JLPT Simulation Exams',
  'Distraction-free Learning',
]

export type AuthTab = 'login' | 'signup'

/**
 * Panel copy per tab. Login is deliberately short so the panel is no taller
 * than the login form; sign-up carries the full pitch. Shared with the phone header.
 */
export const AUTH_PANEL_COPY: Record<AuthTab, { headline: string; body: string; shortBody: string }> = {
  login: {
    headline:  'Welcome back.',
    body:      'Pick up right where you left off.',
    shortBody: 'Pick up right where you left off.',
  },
  signup: {
    headline:  'Begin your journey to fluency.',
    body:      'Join 50,000+ students mastering Japanese through our immersive, distraction-free environment.',
    shortBody: 'Join 50,000+ students mastering Japanese.',
  },
}

interface ModalSidebarProps {
  tab: AuthTab
  onGoogle: () => void
  onX: () => void
}

/** Desktop-only branding panel. Social sign-in rises from its bottom edge. */
export function ModalSidebar({ tab, onGoogle, onX }: ModalSidebarProps) {
  const reducedMotion = useReducedMotion()
  const copy = AUTH_PANEL_COPY[tab]

  return (
    <div className="hidden md:flex md:w-5/12 bg-primary p-10 flex-col justify-between text-on-primary relative overflow-hidden shrink-0">
      {/* Subtle pinstripe texture overlay */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.05) 2px,
            rgba(255,255,255,0.05) 4px
          )`,
        }}
      />

      {/* Top: branding + per-tab copy (crossfades when the tab changes) */}
      <div className="relative z-10">
        <div className="text-2xl font-headline font-extrabold tracking-tighter mb-8">
          FoxSensei
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            variants={reducedMotion ? undefined : swapVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className="text-3xl font-headline font-bold leading-tight mb-4 italic">
              {copy.headline}
            </h2>
            <p className="text-on-primary/80 text-sm leading-relaxed">{copy.body}</p>

            {tab === 'signup' && (
              <ul className="mt-6 flex flex-col gap-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Icon name="check_circle" className="text-sm" filled />
                    <span className="text-xs font-medium tracking-wide">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: social sign-in sheet rising from the panel edge */}
      <SocialAuthSheet onGoogle={onGoogle} onX={onX} />
    </div>
  )
}
