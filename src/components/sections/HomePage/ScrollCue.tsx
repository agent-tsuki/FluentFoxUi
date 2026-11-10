import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** Scrolled this far, the visitor has found the page goes on, so the cue fades away. */
const HIDE_AFTER_PX = 40

/**
 * ScrollCue: a small hint at the bottom of the hero that the page goes on.
 * A mouse whose wheel dot slides down on screens with a mouse, a nudging
 * arrow on touch screens. It links to the next section, fades once the page
 * has been scrolled, holds still for reduced motion, and hides on short screens
 * where it would crowd the hero's buttons.
 */
export function ScrollCue() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > HIDE_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href="#journey"
      aria-label="Scroll down to see more"
      tabIndex={scrolled ? -1 : undefined}
      className={cn(
        'group absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 rounded-md p-2 text-ink-muted transition-opacity duration-slow hover:text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        '[@media(max-height:44rem)]:hidden',
        scrolled && 'pointer-events-none opacity-0',
      )}
    >
      {/* Mouse, for screens with a fine pointer. */}
      <span aria-hidden="true" className="relative hidden h-9 w-6 justify-center rounded-full border-2 border-current pt-1.5 [@media(pointer:fine)]:flex">
        <span className="block h-2 w-1 rounded-full bg-current motion-safe:animate-[scroll-wheel_1.8s_ease-in-out_infinite]" />
      </span>
      {/* Arrow, for touch screens. */}
      <Icon name="keyboard_arrow_down" className="text-3xl motion-safe:animate-[scroll-nudge_1.6s_ease-in-out_infinite] [@media(pointer:fine)]:hidden" />
      <span aria-hidden="true" className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em]">
        Scroll
      </span>
    </a>
  )
}
