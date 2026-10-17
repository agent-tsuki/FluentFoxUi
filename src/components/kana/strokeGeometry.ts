/**
 * Stroke geometry for kana tracing: parse KanjiVG path data into points,
 * resample to a fixed count, and judge a drawn stroke against a reference.
 * Pure functions (no DOM) so the matcher can be tuned and tested in isolation.
 */

export type Point = readonly [number, number]

/** Uniform scale + offset applied to a glyph inside the drawing box. */
export interface GlyphTransform {
  scale: number
  dx: number
  dy: number
}

export const IDENTITY: GlyphTransform = { scale: 1, dx: 0, dy: 0 }

/** Points per stroke when comparing; enough to capture curves like の. */
export const SAMPLE_COUNT = 32

/**
 * Tolerances, in viewBox units (one kana cell is 109×109). Tuned with
 * simulated finger traces: a trace offset by ~6 units with ~4 units of jitter
 * passes; reversed strokes, the wrong stroke, or a scribble fail.
 */
export const START_TOLERANCE = 20
export const AVERAGE_TOLERANCE = 13

const CUBIC_STEPS = 12

/**
 * Flattens path data into a polyline. KanjiVG hiragana only use M/m, C/c,
 * S/s and L/l, which is all this handles (other commands are skipped).
 */
export function pathToPoints(d: string, t: GlyphTransform = IDENTITY): Point[] {
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) ?? []
  const pts: Point[] = []
  let i = 0
  let cmd = ''
  let x = 0
  let y = 0
  let lastCtrl: Point | null = null
  const num = () => Number(tokens[i++])

  const cubic = (c1: Point, c2: Point, end: Point) => {
    const start: Point = [x, y]
    for (let s = 1; s <= CUBIC_STEPS; s++) {
      const u = s / CUBIC_STEPS
      const v = 1 - u
      pts.push([
        v * v * v * start[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * end[0],
        v * v * v * start[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * end[1],
      ])
    }
    lastCtrl = c2
    ;[x, y] = end
  }

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++]
    const rel = cmd === cmd.toLowerCase()
    const ox = rel ? x : 0
    const oy = rel ? y : 0
    switch (cmd.toLowerCase()) {
      case 'm':
      case 'l':
        x = ox + num()
        y = oy + num()
        pts.push([x, y])
        lastCtrl = null
        if (cmd === 'm') cmd = 'l'
        if (cmd === 'M') cmd = 'L'
        break
      case 'c': {
        const c1: Point = [ox + num(), oy + num()]
        const c2: Point = [ox + num(), oy + num()]
        cubic(c1, c2, [ox + num(), oy + num()])
        break
      }
      case 's': {
        const prev: Point = lastCtrl ?? [x, y]
        const c1: Point = [2 * x - prev[0], 2 * y - prev[1]]
        const c2: Point = [ox + num(), oy + num()]
        cubic(c1, c2, [ox + num(), oy + num()])
        break
      }
      default:
        i++ // unsupported command: skip its numbers
    }
  }
  return pts.map(([px, py]) => [px * t.scale + t.dx, py * t.scale + t.dy] as const)
}

const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])

export function polylineLength(pts: readonly Point[]): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i])
  return total
}

/** Resamples a polyline to `n` points spaced evenly along its length. */
export function resample(pts: readonly Point[], n = SAMPLE_COUNT): Point[] {
  if (pts.length === 0) return []
  const total = polylineLength(pts)
  if (pts.length === 1 || total === 0) return Array.from({ length: n }, () => pts[0])
  const step = total / (n - 1)
  const out: Point[] = [pts[0]]
  let seg = 1
  let walked = 0 // length up to pts[seg - 1]
  for (let k = 1; k < n - 1; k++) {
    const target = k * step
    while (seg < pts.length - 1 && walked + dist(pts[seg - 1], pts[seg]) < target) {
      walked += dist(pts[seg - 1], pts[seg])
      seg++
    }
    const a = pts[seg - 1]
    const b = pts[seg]
    const len = dist(a, b) || 1
    const u = Math.min(1, Math.max(0, (target - walked) / len))
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u])
  }
  out.push(pts[pts.length - 1])
  return out
}

/** Mean distance between corresponding points of two equal-length samples. */
export function averageDistance(a: readonly Point[], b: readonly Point[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += dist(a[i], b[i])
  return sum / a.length
}

export type StrokeVerdict =
  | { ok: true }
  | { ok: false; hint: string }

/** A short, friendly pointer toward where the stroke should begin. */
function startHint(drawn: Point, ref: Point): string {
  const dx = ref[0] - drawn[0]
  const dy = ref[1] - drawn[1]
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'Start from the top' : 'Start lower down'
  return dx < 0 ? 'Start further left' : 'Start further right'
}

/**
 * Judges one drawn stroke against the expected reference stroke. Order is
 * enforced by the caller comparing only against the next unfinished stroke;
 * `others` (the remaining strokes) only sharpen the hint.
 */
export function judgeStroke(drawnRaw: readonly Point[], ref: readonly Point[], others: readonly (readonly Point[])[] = []): StrokeVerdict {
  const drawn = resample(drawnRaw)
  const target = resample(ref)
  const avg = averageDistance(drawn, target)
  const startOff = dist(drawn[0], target[0])

  const reversedAvg = averageDistance([...drawn].reverse(), target)
  // Best fit among the strokes still to come: catches an out-of-order stroke
  // that happens to lie close to the expected one (き's two bars, dakuten dots).
  const laterAvg = Math.min(Infinity, ...others.map((o) => averageDistance(drawn, resample(o))))

  // A short stroke drawn backwards can sit inside both tolerances, so the
  // forward reading must also fit better than the reversed one.
  if (startOff <= START_TOLERANCE && avg <= AVERAGE_TOLERANCE && avg < reversedAvg && avg <= laterAvg * 1.25) {
    return { ok: true }
  }
  if (laterAvg <= AVERAGE_TOLERANCE && laterAvg < avg) return { ok: false, hint: 'Right shape, wrong order: follow the dot' }
  if (reversedAvg <= AVERAGE_TOLERANCE && reversedAvg < avg) return { ok: false, hint: 'Other way round: start from the dot' }
  if (startOff > START_TOLERANCE) return { ok: false, hint: startHint(drawn[0], target[0]) }
  return { ok: false, hint: 'Follow the faint guide' }
}

/** Polyline → SVG path data for rendering a drawn stroke. */
export function pointsToPath(pts: readonly Point[]): string {
  return pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join('')
}
