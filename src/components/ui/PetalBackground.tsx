import { useEffect, useRef } from 'react'
import { useUI } from '@/context/UIContext'

interface Petal {
  x: number
  y: number
  r: number
  rot: number
  rotSpeed: number
  vx: number
  vy: number
  opacity: number
  wobble: number
  wobbleSpeed: number
}

const PETAL_COUNT = 28

function createPetal(canvasWidth: number, _canvasHeight: number, initialY?: number): Petal {
  return {
    x: Math.random() * canvasWidth,
    y: initialY ?? Math.random() * -200,
    r: Math.random() * 10 + 7,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    vx: (Math.random() - 0.5) * 1.2,
    vy: Math.random() * 1.2 + 0.6,
    opacity: Math.random() * 0.5 + 0.3,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.03 + 0.01,
  }
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
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
  grad.addColorStop(0, 'rgba(255,182,193,0.9)')
  grad.addColorStop(1, 'rgba(234,107,68,0.4)')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

export function PetalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { darkMode } = useUI()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

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

    const handleVisibility = () => {
      paused = document.hidden
      if (!paused) animate()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    function animate() {
      if (paused) return
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of petals) {
        p.wobble += p.wobbleSpeed
        p.x += p.vx + Math.sin(p.wobble) * 0.5
        p.y += p.vy
        p.rot += p.rotSpeed
        if (p.y > canvas!.height + 30 || p.x < -30 || p.x > canvas!.width + 30) {
          Object.assign(p, createPetal(canvas!.width, canvas!.height))
        }
        drawPetal(ctx!, p)
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-opacity duration-500"
      style={{ opacity: darkMode ? 0.35 : 0.45, zIndex: 0 }}
    />
  )
}
