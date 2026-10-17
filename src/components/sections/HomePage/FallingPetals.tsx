import { useEffect, useRef } from 'react'

type Motion = 'fall' | 'flutter' | 'glide' | 'tumble'

interface Petal {
  active: boolean
  depth: number
  mode: Motion
  sourceX: number
  sourceY: number
  releaseAt: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  rotation: number
  spinRate: number
  phase: number
  flutterRate: number
  sidePhase: number
  turbulenceSeed: number
  gustPhase: number
}

const PETAL_SPRITE = '/images/home/sakura-petal.png'
const TAU = Math.PI * 2

// Normalized release points traced from the visible blossom clusters in journey.webp.
// They follow the top-right bough and the smaller clusters around the trunk.
const BRANCH_SOURCES = [
  { x: 0.49, y: 0.055 },
  { x: 0.57, y: 0.105 },
  { x: 0.64, y: 0.16 },
  { x: 0.72, y: 0.105 },
  { x: 0.79, y: 0.17 },
  { x: 0.86, y: 0.105 },
  { x: 0.92, y: 0.17 },
  { x: 0.975, y: 0.255 },
  { x: 0.935, y: 0.34 },
] as const

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}

// Value noise changes continuously between samples, unlike frame-by-frame jitter.
function smoothNoise(value: number, seed: number) {
  const whole = Math.floor(value)
  const fraction = value - whole
  const sample = (index: number) => {
    const hashed = Math.sin((index + seed) * 12.9898) * 43758.5453
    return hashed - Math.floor(hashed)
  }

  return (sample(whole) + (sample(whole + 1) - sample(whole)) * smoothstep(fraction)) * 2 - 1
}

function gustPulse(elapsed: number) {
  // Long wind swells with shorter gusts nested inside them: irregular, but coherent.
  const longSwell = Math.max(0, smoothNoise(elapsed * 0.115, 41))
  const shortGust = Math.max(0, smoothNoise(elapsed * 0.43, 73))
  return Math.min(1, longSwell * 0.42 + shortGust * 0.88)
}

function chooseMotion(random: () => number): Motion {
  const selection = random()
  if (selection < 0.42) return 'glide'
  if (selection < 0.69) return 'flutter'
  if (selection < 0.86) return 'fall'
  return 'tumble'
}

function createPetal(
  width: number,
  height: number,
  random: () => number,
  initial = false,
  releaseAt = 0,
): Petal {
  // Bias toward distant petals. A rare foreground petal is still larger, but
  // all particles remain deliberately small against the landscape.
  const depth = Math.pow(random(), 1.55)
  const source = BRANCH_SOURCES[Math.floor(random() * BRANCH_SOURCES.length)]
  const sourceX = width * (source.x + (random() - 0.5) * 0.025)
  const sourceY = height * (source.y + (random() - 0.5) * 0.022)
  const size = 5.5 + depth * 15 + random() * 2.5
  const initialProgress = initial ? random() : 0
  const mode = chooseMotion(random)
  const carriedDistance = mode === 'fall'
    ? 0.04 + initialProgress * 0.2
    : 0.08 + initialProgress * 0.78

  return {
    active: initial,
    depth,
    mode,
    sourceX,
    sourceY,
    releaseAt,
    // Fill the first frame with petals already carried from the canopy by wind.
    x: initial ? sourceX - width * carriedDistance : sourceX,
    y: initial ? Math.min(height * 1.03, sourceY + height * initialProgress * 0.92) : sourceY,
    vx: initial
      ? mode === 'fall' ? -(8 + random() * 20) : -(54 + random() * 92)
      : (random() - 0.5) * 6,
    vy: initial
      ? mode === 'fall' ? 74 + depth * 42 + random() * 18 : 34 + depth * 38 + random() * 15
      : 4 + random() * 8,
    size,
    opacity: 0.17 + depth * 0.58,
    rotation: random() * TAU,
    spinRate: (random() > 0.5 ? 1 : -1) * (0.3 + random() * 0.78),
    phase: random() * TAU,
    flutterRate: 0.72 + random() * 1.25,
    sidePhase: random() * TAU,
    turbulenceSeed: 100 + Math.floor(random() * 9000),
    gustPhase: random() * 1.4,
  }
}

/**
 * Wind-carried sakura petals. One large-scale wind field moves every petal
 * right-to-left; smooth, per-petal turbulence makes paths unique without noise.
 */
export function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = canvas.getContext('2d')
    if (!context) return

    const image = new Image()
    image.decoding = 'async'

    let frameId = 0
    let lastTime = 0
    let width = 0
    let height = 0
    let dpr = 1
    let petals: Petal[] = []
    const random = seededRandom(0x5a4b557)

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      width = bounds.width
      height = bounds.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = width < 640 ? 15 : width < 1024 ? 23 : 34
      petals = Array.from({ length: count }, () => createPetal(width, height, random, true))
    }

    const scheduleNextPetal = (elapsed: number) => {
      // Gusts shake groups loose quickly; calm moments leave larger gaps.
      const gust = gustPulse(elapsed + 0.2)
      const delay = gust > 0.32 ? 0.14 + random() * 0.85 : 0.8 + random() * 3.1
      return createPetal(width, height, random, false, elapsed + delay)
    }

    const updatePetal = (petal: Petal, elapsed: number, delta: number) => {
      if (!petal.active) {
        if (elapsed < petal.releaseAt) return false
        petal.active = true
      }

      const broadWind = -78 - 25 * smoothNoise(elapsed * 0.12, 12)
      const sharedGust = gustPulse(elapsed)
      const localGust = gustPulse(elapsed + petal.gustPhase + petal.y * 0.0025)
      const gust = sharedGust * 0.7 + localGust * 0.3
      const flutter = Math.sin(elapsed * petal.flutterRate + petal.phase)
      const flowX = smoothNoise(elapsed * 0.78 + petal.y * 0.004, petal.turbulenceSeed)
      const flowY = smoothNoise(elapsed * 0.64 + petal.x * 0.003, petal.turbulenceSeed + 619)
      const broadside = 0.36 + Math.abs(Math.cos(petal.rotation * 0.72 + flutter * 0.8)) * 0.64

      // A broadside petal catches more crosswind and falls more slowly.
      const windGrip = 0.55 + broadside * 0.45
      let targetX = (broadWind - gust * 112) * windGrip + flowX * (14 + petal.depth * 13)
      let targetY = 78 - broadside * 31 + flowY * 10
      let spin = petal.spinRate

      if (petal.mode === 'fall') {
        // A sheltered/heavier petal drops under gravity with only a light breeze.
        targetX = targetX * 0.22 + flowX * 7
        targetY += 42 + flutter * 7
        spin *= 0.72
      } else if (petal.mode === 'glide') {
        targetX -= 16 + gust * 24
        targetY -= 15 + gust * 24
        spin *= 0.48
      } else if (petal.mode === 'flutter') {
        targetX += flutter * (26 + petal.depth * 17)
        targetY += Math.cos(elapsed * petal.flutterRate * 1.65 + petal.phase) * 18
        spin += flutter * 0.46
      } else {
        targetX += flutter * 20
        targetY += 25
        spin *= 3.7
      }

      // Newly released petals resist the air briefly, then visibly detach and
      // accelerate into the current instead of appearing mid-flight.
      const detachment = Math.min(1, Math.max(0, (elapsed - petal.releaseAt) / 0.48))
      targetX *= 0.18 + detachment * 0.82
      targetY = 10 + (targetY - 10) * detachment

      const response = 0.6 + petal.depth * 1.25
      petal.vx += (targetX - petal.vx) * Math.min(1, response * delta)
      petal.vy += (targetY - petal.vy) * Math.min(1, response * delta)
      petal.x += petal.vx * delta
      petal.y += petal.vy * delta
      petal.rotation += spin * delta

      return petal.y > height + petal.size * 2 || petal.x < -petal.size * 4 || petal.x > width + petal.size * 4
    }

    const draw = (timestamp: number) => {
      const elapsed = timestamp / 1000
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 1 / 20) : 0
      lastTime = timestamp
      context.clearRect(0, 0, width, height)

      petals.forEach((petal, index) => {
        const expired = updatePetal(petal, elapsed, delta)
        if (expired) {
          petals[index] = scheduleNextPetal(elapsed)
          return
        }
        if (!petal.active) return

        const flutter = Math.sin(elapsed * petal.flutterRate + petal.sidePhase)
        const sideOn = 0.34 + Math.abs(Math.cos(petal.rotation * 0.72 + flutter * 0.8)) * 0.66
        const size = petal.size * (0.8 + petal.depth * 0.25)

        context.save()
        context.globalAlpha = petal.opacity * (0.82 + flutter * 0.12)
        context.filter = petal.depth < 0.32 ? 'blur(0.25px)' : 'none'
        context.translate(petal.x, petal.y)
        context.rotate(petal.rotation + flutter * 0.17)
        context.scale(sideOn, 1)
        context.drawImage(image, -size / 2, -size / 2, size, size)
        context.restore()
      })

      frameId = window.requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement ?? canvas)
    image.onload = () => {
      resize()
      frameId = window.requestAnimationFrame(draw)
    }
    image.src = PETAL_SPRITE

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frameId)
      image.onload = null
    }
  }, [])

  return <canvas ref={canvasRef} className="falling-petals" aria-hidden="true" />
}
