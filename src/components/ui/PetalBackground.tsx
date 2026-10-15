import { useEffect, useRef } from 'react'
import { useUI } from '@/context/UIContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Petal {
  x: number
  y: number
  r: number
  rot: number
  /** rad/s */
  rotSpeed: number
  /** px/s */
  vx: number
  /** px/s */
  vy: number
  opacity: number
  wobble: number
  /** rad/s */
  wobbleSpeed: number
}

const PETAL_COUNT = 28

// ── Tweak here for manual testing ─────────────────────────────────────────────
// Speeds are per second (not per frame), so the pace is the same on 60Hz and
// 120Hz screens. Save the file and the background restarts with new values.

/** Overall speed dial. 1 = values below, 0.5 = half as fast, 2 = twice as fast. */
const PETAL_SPEED = 1

/** Falling speed range in px/s. A petal takes ~25–60s to cross the screen. */
const FALL_MIN   = 14
const FALL_MAX   = 36

/** Sideways drift, ± px/s. */
const DRIFT      = 10

/** Side-to-side sway: how far (px/s) and how often (rad/s range). */
const SWAY       = 10
const SWAY_RATE_MIN = 0.35
const SWAY_RATE_MAX = 0.95

/** Spin, ± rad/s. */
const SPIN       = 0.5
// ──────────────────────────────────────────────────────────────────────────────

/** Longest step simulated in one frame, so returning to the tab doesn't jump. */
const MAX_STEP_SECONDS = 0.05

const between = (min: number, max: number) => min + Math.random() * (max - min)
const plusMinus = (amount: number) => (Math.random() - 0.5) * 2 * amount

function createPetal(canvasWidth: number, _canvasHeight: number, initialY?: number): Petal {
  return {
    x: Math.random() * canvasWidth,
    y: initialY ?? Math.random() * -200,
    r: Math.random() * 10 + 7,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: plusMinus(SPIN),
    vx: plusMinus(DRIFT),
    vy: between(FALL_MIN, FALL_MAX),
    opacity: Math.random() * 0.5 + 0.3,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: between(SWAY_RATE_MIN, SWAY_RATE_MAX),
  }
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal, darkMode: boolean) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.globalAlpha = p.opacity
  ctx.beginPath()
  ctx.moveTo(0, -p.r)
  ctx.bezierCurveTo(p.r * 0.6, -p.r * 0.8, p.r * 0.8, 0, 0, p.r * 0.6)
  ctx.bezierCurveTo(-p.r * 0.8, 0, -p.r * 0.6, -p.r * 0.8, 0, -p.r)
  ctx.closePath()
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r)
  if (darkMode) {
    grad.addColorStop(0, 'rgba(255, 159, 92, 0.95)') // fox-light #FF9F5C
    grad.addColorStop(1, 'rgba(216, 107, 53, 0.25)') // fox-dark #D86B35
  } else {
    grad.addColorStop(0, 'rgba(255, 182, 193, 0.9)')
    grad.addColorStop(1, 'rgba(234, 107, 68, 0.4)')
  }
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

export function PetalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { darkMode } = useUI()
  const darkModeRef = useRef(darkMode)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    darkModeRef.current = darkMode
  }, [darkMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    if (reducedMotion) {
      // Respect the user's motion preference: no petals spawned, no rAF loop
      // started at all — render an empty canvas rather than a frozen frame.
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }

    const petals: Petal[] = Array.from({ length: PETAL_COUNT }, (_, i) =>
      createPetal(canvas.width, canvas.height, i < PETAL_COUNT ? Math.random() * canvas.height : undefined)
    )

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    let animId: number
    let paused = false
    let lastTime: number | null = null

    const handleVisibility = () => {
      paused = document.hidden
      if (!paused) {
        lastTime = null // don't count the hidden time as one huge step
        cancelAnimationFrame(animId)
        animId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    function animate(now: number) {
      if (paused) return
      const dt = (lastTime === null ? 0 : Math.min((now - lastTime) / 1000, MAX_STEP_SECONDS)) * PETAL_SPEED
      lastTime = now

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of petals) {
        p.wobble += p.wobbleSpeed * dt
        p.x += (p.vx + Math.sin(p.wobble) * SWAY) * dt
        p.y += p.vy * dt
        p.rot += p.rotSpeed * dt
        if (p.y > canvas!.height + 30 || p.x < -30 || p.x > canvas!.width + 30) {
          Object.assign(p, createPetal(canvas!.width, canvas!.height))
        }
        drawPetal(ctx!, p, darkModeRef.current)
      }
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-opacity duration-500"
      style={{ opacity: darkMode ? 0.35 : 0.45, zIndex: 0 }}
    />
  )
}
