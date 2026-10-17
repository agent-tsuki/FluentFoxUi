/**
 * KanjiVG stroke paths → jsPDF vector strokes.
 *
 * jsPDF's built-in fonts have no Japanese glyphs (and embedding one costs
 * megabytes), so every kana in our PDFs is drawn from its KanjiVG stroke
 * paths instead. KanjiVG hiragana use only `M x,y` followed by relative cubic
 * Béziers (`c dx1,dy1 dx2,dy2 dx,dy`, often chained and with negative numbers
 * glued together, e.g. `c-1.2-3.4…`). `parseStrokePath` turns that into
 * absolute segments; `drawStrokePath` places them on a page.
 *
 * Pure parsing has no jsPDF dependency, so it can be unit-tested directly.
 */
import type { jsPDF } from 'jspdf'

export type Vec = readonly [number, number]

export interface CubicSegment {
  c1: Vec
  c2: Vec
  end: Vec
}

/** One stroke in absolute KanjiVG units (109×109 box). */
export interface StrokePath {
  start: Vec
  segments: CubicSegment[]
}

const TOKEN = /[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g

/**
 * Parses SVG path data into absolute cubic segments. Handles M/m and C/c (all
 * KanjiVG hiragana need) plus L/l as a straight cubic, with implicit command
 * repetition. Anything else throws — better a loud error than a wrong glyph.
 */
export function parseStrokePath(d: string): StrokePath {
  const tokens = d.match(TOKEN) ?? []
  const segments: CubicSegment[] = []
  let start: Vec | null = null
  let x = 0
  let y = 0
  let cmd = ''
  let i = 0

  const num = (): number => {
    const t = tokens[i++]
    const n = Number(t)
    if (t === undefined || Number.isNaN(n)) throw new Error(`Bad stroke path near token ${i}: "${d}"`)
    return n
  }

  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) cmd = tokens[i++]
    const rel = cmd === cmd.toLowerCase()
    const ox = rel ? x : 0
    const oy = rel ? y : 0
    switch (cmd.toLowerCase()) {
      case 'm': {
        x = ox + num()
        y = oy + num()
        // A second M would start a new subpath; KanjiVG strokes never do that.
        if (start && segments.length > 0) throw new Error(`Multiple subpaths in stroke: "${d}"`)
        start = [x, y]
        cmd = rel ? 'l' : 'L' // implicit pairs after M are line-tos
        break
      }
      case 'l': {
        const end: Vec = [ox + num(), oy + num()]
        segments.push({ c1: [x, y], c2: end, end })
        ;[x, y] = end
        break
      }
      case 'c': {
        const c1: Vec = [ox + num(), oy + num()]
        const c2: Vec = [ox + num(), oy + num()]
        const end: Vec = [ox + num(), oy + num()]
        segments.push({ c1, c2, end })
        ;[x, y] = end
        break
      }
      default:
        throw new Error(`Unsupported path command "${cmd}" in stroke: "${d}"`)
    }
    if (!start) throw new Error(`Stroke path must start with M: "${d}"`)
  }
  if (!start) throw new Error(`Empty stroke path: "${d}"`)
  return { start, segments }
}

/** Uniform scale + offset: page = offset + unit × scale (scale in page units per KanjiVG unit). */
export interface Placement {
  x: number
  y: number
  scale: number
}

export interface StrokeStyle {
  /** Grey level 0–255 (worksheets are black/grey) or a hex colour like "#BB4D2C". */
  color: number | string
  /** Line width in page units (mm). */
  lineWidth: number
}

/** The slice of jsPDF the drawer needs — lets tests pass a recording fake. */
export type PdfPen = Pick<
  jsPDF,
  'moveTo' | 'curveTo' | 'lineTo' | 'stroke' | 'setDrawColor' | 'setLineWidth' | 'setLineCap' | 'setLineJoin'
>

export function applyStrokeStyle(pen: PdfPen, style: StrokeStyle): void {
  if (typeof style.color === 'number') pen.setDrawColor(style.color)
  else pen.setDrawColor(style.color)
  pen.setLineWidth(style.lineWidth)
  pen.setLineCap('round')
  pen.setLineJoin('round')
}

/** Strokes one parsed path. Call `applyStrokeStyle` first (or pass `style`). */
export function drawStrokePath(pen: PdfPen, path: StrokePath, at: Placement, style?: StrokeStyle): void {
  if (style) applyStrokeStyle(pen, style)
  const px = (v: Vec): [number, number] => [at.x + v[0] * at.scale, at.y + v[1] * at.scale]
  const [sx, sy] = px(path.start)
  pen.moveTo(sx, sy)
  if (path.segments.length === 0) {
    pen.lineTo(sx, sy) // a dot: round caps make it visible
  }
  for (const seg of path.segments) {
    const [x1, y1] = px(seg.c1)
    const [x2, y2] = px(seg.c2)
    const [x3, y3] = px(seg.end)
    pen.curveTo(x1, y1, x2, y2, x3, y3)
  }
  pen.stroke()
}
