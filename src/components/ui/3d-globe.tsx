/**
 * Globe3D — cobe-powered spinning WebGL globe with React avatar-marker overlay.
 *
 * Projection math mirrors cobe v2's internal O()/W() functions exactly so that
 * the React-positioned avatar bubbles track each lat/lng correctly as the
 * globe auto-rotates or is dragged.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import createGlobe from 'cobe'
import { useUI } from '@/context/UIContext'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface GlobeMarker {
  lat: number
  lng: number
  src: string
  label: string
}

interface GlobeConfig {
  atmosphereColor?: string
  atmosphereIntensity?: number
  bumpScale?: number
  autoRotateSpeed?: number
}

interface Globe3DProps {
  markers?: GlobeMarker[]
  config?: GlobeConfig
  className?: string
  onMarkerClick?: (marker: GlobeMarker) => void
  onMarkerHover?: (marker: GlobeMarker | null) => void
}

// ─── Geometry helpers (match cobe v2 source exactly) ─────────────────────────

const PI = Math.PI

/** Convert lat/lng (degrees) → cobe's internal unit-sphere 3-D vector. */
function latLngTo3D(lat: number, lng: number): [number, number, number] {
  const latR = lat * (PI / 180)
  const lngR = lng * (PI / 180) - PI
  const cosLat = Math.cos(latR)
  return [
    -cosLat * Math.cos(lngR),
    Math.sin(latR),
    cosLat * Math.sin(lngR),
  ]
}

/**
 * Project a 3-D point to normalised screen coordinates [0,1] × [0,1].
 * Mirrors cobe's O() function.
 *
 * @param point  3-D vector (already scaled by elevation)
 * @param phi    current horizontal rotation (auto-incremented)
 * @param theta  fixed tilt angle
 * @param ar     canvas CSS aspect ratio (width / height)
 */
function projectToScreen(
  [tx, ty, tz]: [number, number, number],
  phi: number,
  theta: number,
  ar: number,
): { x: number; y: number; visible: boolean } {
  const cosP = Math.cos(phi)
  const sinP = Math.sin(phi)
  const cosT = Math.cos(theta)
  const sinT = Math.sin(theta)

  // view-space x & y (cobe's c and s)
  const vx = cosP * tx + sinP * tz
  const vy = sinP * sinT * tx + cosT * ty - cosP * sinT * tz
  // depth (cobe's visibility test)
  const vz = -sinP * cosT * tx + sinT * ty + cosP * cosT * tz

  return {
    x: (vx / ar + 1) / 2,
    y: (-vy + 1) / 2,
    visible: vz >= 0,
  }
}

// ─── Projected marker state ───────────────────────────────────────────────────

interface ProjectedMarker {
  marker: GlobeMarker
  x: number
  y: number
  visible: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────

const ELEVATION = 0.88  // slightly above the globe surface (cobe's ee + p ≈ 0.85)
const THETA = 0.25      // fixed tilt (radians)

export function Globe3D({
  markers = [],
  config = {},
  className = '',
  onMarkerClick,
  onMarkerHover,
}: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)
  const phiRef = useRef(0)
  const rafRef = useRef<number>(0)
  const pointerDownRef = useRef<{ x: number; phi: number } | null>(null)

  const [projected, setProjected] = useState<ProjectedMarker[]>([])
  const [hovered, setHovered] = useState<GlobeMarker | null>(null)

  const { darkMode } = useUI()

  const autoRotateSpeed = (config.autoRotateSpeed ?? 0.3) * 0.005

  // ── Project all markers given current phi ──────────────────────────────────
  const projectMarkers = useCallback((phi: number, ar: number) => {
    setProjected(
      markers.map(m => {
        const v3 = latLngTo3D(m.lat, m.lng)
        const scaled: [number, number, number] = [v3[0] * ELEVATION, v3[1] * ELEVATION, v3[2] * ELEVATION]
        return { marker: m, ...projectToScreen(scaled, phi, THETA, ar) }
      })
    )
  }, [markers])

  // ── Globe setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const size = container.offsetWidth
    const dpr = Math.min(window.devicePixelRatio, 2)

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: phiRef.current,
      theta: THETA,
      dark: darkMode ? 1 : 0,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: darkMode ? 1.8 : 1.2,
      mapBaseBrightness: darkMode ? 0.05 : 0.0,
      baseColor: darkMode ? [0.18, 0.14, 0.12] : [1, 0.97, 0.94],
      markerColor: [0.918, 0.42, 0.267],   // fox orange #EA6B44
      glowColor: darkMode ? [0.9, 0.55, 0.35] : [1, 0.82, 0.65],
      markers: markers.map(m => ({ location: [m.lat, m.lng] as [number, number], size: 0.055 })),
    })

    const ar = 1  // canvas is square
    const animate = () => {
      if (!pointerDownRef.current) {
        phiRef.current += autoRotateSpeed
      }
      globeRef.current?.update({ phi: phiRef.current, theta: THETA })
      projectMarkers(phiRef.current, ar)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    const handleVis = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current)
      else animate()
    }
    document.addEventListener('visibilitychange', handleVis)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globeRef.current?.destroy()
      document.removeEventListener('visibilitychange', handleVis)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode])

  // Re-project when markers array changes
  useEffect(() => {
    projectMarkers(phiRef.current, 1)
  }, [projectMarkers])

  // ── Drag-to-rotate ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownRef.current = { x: e.clientX, phi: phiRef.current }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDownRef.current) return
    const delta = (e.clientX - pointerDownRef.current.x) / (containerRef.current?.offsetWidth ?? 400)
    phiRef.current = pointerDownRef.current.phi - delta * Math.PI * 1.5
    globeRef.current?.update({ phi: phiRef.current })
    projectMarkers(phiRef.current, 1)
  }, [projectMarkers])

  const onPointerUp = useCallback(() => {
    pointerDownRef.current = null
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={{ width: '100%', aspectRatio: '1 / 1' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* WebGL globe canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
      />

      {/* Avatar-marker overlay */}
      {projected.map(({ marker, x, y, visible }) => (
        <AvatarBubble
          key={`${marker.lat}-${marker.lng}`}
          marker={marker}
          x={x}
          y={y}
          visible={visible}
          hovered={hovered?.label === marker.label}
          onHover={m => { setHovered(m); onMarkerHover?.(m) }}
          onClick={() => onMarkerClick?.(marker)}
        />
      ))}
    </div>
  )
}

// ─── Avatar bubble (single marker) ───────────────────────────────────────────

interface AvatarBubbleProps {
  marker: GlobeMarker
  x: number
  y: number
  visible: boolean
  hovered: boolean
  onHover: (m: GlobeMarker | null) => void
  onClick: () => void
}

function AvatarBubble({ marker, x, y, visible, hovered, onHover, onClick }: AvatarBubbleProps) {
  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        zIndex: visible ? 10 : 0,
      }}
      onMouseEnter={() => onHover(marker)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {/* Avatar ring + image */}
      <div
        className="relative"
        style={{ width: 32, height: 32 }}
      >
        {/* Pulse ring */}
        {visible && (
          <span
            className="absolute inset-0 rounded-full border-2 border-primary/60"
            style={{ animation: 'globePing 2s ease-in-out infinite' }}
          />
        )}
        <img
          src={marker.src}
          alt={marker.label}
          draggable={false}
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-lg"
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute bottom-full left-1/2 mb-2 pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className="bg-on-surface text-surface text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap font-label shadow-xl">
            {marker.label}
          </div>
          <div
            className="w-1.5 h-1.5 bg-on-surface rotate-45 mx-auto"
            style={{ marginTop: -3 }}
          />
        </div>
      )}

      {/* Keyframe (injected once per component tree, not per instance) */}
      <style>{`
        @keyframes globePing {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(1.8); opacity: 0;   }
          100% { transform: scale(1.8); opacity: 0;   }
        }
      `}</style>
    </div>
  )
}
