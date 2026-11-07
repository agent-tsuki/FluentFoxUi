import { memo, useEffect, useRef, useState } from 'react'
import type { AnimationItem } from 'lottie-web'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MOON_PATH, SUN_PATH, THEME_ICON_VIEWBOX } from './themeIconPaths'

/** 64 frames at 50 fps is 1.28 s; 1.4× plays it in about 0.9 s, quick enough for a toggle. */
const SPEED = 1.4
/**
 * Animation frames. The first is exactly the dark_mode icon and the last
 * exactly light_mode (both built from the icon font by
 * scripts/lottie/build-theme-toggle.py), so the hand-off is invisible.
 */
const MOON_FRAME = 0
const SUN_FRAME = 63
/**
 * If the player isn't ready this long after a click (slow network, first
 * visit), skip the animation and just swap the icon, never a late replay.
 */
const MAX_START_DELAY_MS = 400

interface Player {
  lottie: typeof import('lottie-web').default
  data: unknown
}

let playerPromise: Promise<Player> | null = null

/**
 * Loads lottie-web (usually already loaded by the navbar logo) and the ~2 KB
 * animation, once.
 */
function preloadThemeAnimation(): Promise<Player> {
  playerPromise ??= Promise.all([import('lottie-web'), import('@/assets/animations/theme_toggle.json')])
    .then(([lottie, data]) => ({ lottie: lottie.default, data: data.default }))
    .catch((error: unknown) => {
      playerPromise = null // Try again on the next intent.
      throw error
    })
  return playerPromise
}

const warm = () => void preloadThemeAnimation().catch(() => {})

/** Spread on a theme button: start loading the animation as soon as the learner shows intent. */
export const THEME_BUTTON_INTENT = { onPointerEnter: warm, onFocus: warm, onTouchStart: warm } as const

interface ThemeToggleIconProps {
  /** Current theme. Dark shows the sun (switch to light), light shows the moon. */
  dark: boolean
  /** Font size sets the icon size (1em square); colour classes apply to both layers. */
  className?: string
}

/**
 * ThemeToggleIcon — the theme buttons' icon. At rest it is the usual Material
 * icon (dark_mode / light_mode), drawn as an inline SVG from the icon font's
 * outlines so it renders exactly like the animation (a font glyph can land a
 * fraction of a pixel elsewhere). When `dark` changes, the animation takes
 * over on its first frame (the same drawing as the icon), morphs moon ⇄ sun
 * (reversed for sun → moon, in the text colour) and hands back to the icon on
 * its last frame, again the same drawing. A change mid-play turns the morph
 * around from where it is. Reduced motion, hidden copies and a slow first load
 * just swap the icon. Decorative: the button carries the label.
 */
export const ThemeToggleIcon = memo(function ThemeToggleIcon({ dark, className }: ThemeToggleIconProps) {
  const reducedMotion = useReducedMotion()
  const hostRef = useRef<HTMLSpanElement>(null)
  const animRef = useRef<AnimationItem | null>(null)
  const darkRef = useRef(dark)
  // The icon shown at rest lags `dark` until the morph has played (or been skipped).
  const [iconDark, setIconDark] = useState(dark)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (darkRef.current === dark) return
    darkRef.current = dark
    const host = hostRef.current
    // Hidden copies (the other navbar's button) and reduced motion: swap only.
    if (!host || reducedMotion || host.getClientRects().length === 0) {
      animRef.current?.stop()
      setPlaying(false)
      setIconDark(dark)
      return
    }

    // Already morphing: turn around from the current frame.
    const running = animRef.current
    if (running && !running.isPaused) {
      running.setDirection(dark ? 1 : -1)
      return
    }

    let cancelled = false
    const giveUp = window.setTimeout(() => {
      cancelled = true
      setIconDark(dark)
    }, MAX_START_DELAY_MS)

    preloadThemeAnimation()
      .then(({ lottie, data }) => {
        if (cancelled) return
        window.clearTimeout(giveUp)
        let anim = animRef.current
        if (!anim) {
          anim = lottie.loadAnimation({
            container: host,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            // lottie-web annotates the data it is given; keep the shared module copy clean.
            animationData: structuredClone(data),
            rendererSettings: { progressiveLoad: false, preserveAspectRatio: 'xMidYMid meet' },
          })
          anim.setSpeed(SPEED)
          // Ended (either way): hand back to the icon for whatever the theme is now.
          anim.addEventListener('complete', () => {
            setIconDark(darkRef.current)
            setPlaying(false)
          })
          animRef.current = anim
        }
        // Start from the drawing the old icon showed.
        anim.goToAndStop(dark ? MOON_FRAME : SUN_FRAME, true)
        anim.setDirection(dark ? 1 : -1)
        setPlaying(true)
        anim.play()
      })
      .catch(() => {
        if (cancelled) return
        window.clearTimeout(giveUp)
        setIconDark(dark) // Animation unavailable (offline etc.).
      })
    return () => {
      cancelled = true
      window.clearTimeout(giveUp)
    }
  }, [dark, reducedMotion])

  useEffect(
    () => () => {
      animRef.current?.destroy()
      animRef.current = null
    },
    [],
  )

  // The two layers swap in one frame: the animation's ends are the icon's drawings.
  return (
    <span aria-hidden className={cn('relative inline-flex size-[1em] shrink-0 items-center justify-center', className)}>
      <svg viewBox={THEME_ICON_VIEWBOX} className={cn('size-full', playing && 'invisible')} focusable="false">
        <path d={iconDark ? SUN_PATH : MOON_PATH} fill="currentColor" fillRule="evenodd" />
      </svg>
      {/* The player's SVG uses the file's white; follow the text colour instead. */}
      <span
        ref={hostRef}
        className={cn(
          'pointer-events-none absolute inset-0 [&_[fill]]:fill-current [&_svg]:!size-full',
          !playing && 'invisible',
        )}
      />
    </span>
  )
})
