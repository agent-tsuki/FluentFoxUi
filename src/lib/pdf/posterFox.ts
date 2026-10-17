/** A small geometric fox face for the poster banner, built from plain vector shapes. */
import type { jsPDF } from 'jspdf'

export type Rgb = [number, number, number]

const FUR: Rgb = [230, 116, 58]
const FUR_DARK: Rgb = [120, 50, 28]
const CREAM: Rgb = [255, 255, 255]
const EYE: Rgb = [45, 34, 30]
const LINE: Rgb = [60, 60, 60]

type Pt = [number, number]

/** Head outline (ears, cheek tufts, chin) in units of the fox's half-width. */
const HEAD: Pt[] = [
  [-0.62, -0.8], [-0.2, -0.42], [0.2, -0.42], [0.62, -0.8], [0.72, -0.1],
  [0.92, 0.12], [0, 0.74], [-0.92, 0.12], [-0.72, -0.1],
]
const MUZZLE: Pt[] = [[-0.92, 0.12], [-0.3, 0.02], [0, 0.3], [0.3, 0.02], [0.92, 0.12], [0, 0.74]]
const EAR_L: Pt[] = [[-0.56, -0.62], [-0.3, -0.42], [-0.62, -0.22]]
const EAR_R: Pt[] = EAR_L.map(([x, y]) => [-x, y])

function polygon(doc: jsPDF, pts: Pt[], cx: number, cy: number, s: number, style: 'F' | 'S' | 'FD'): void {
  const abs = pts.map(([x, y]) => [cx + x * s, cy + y * s] as Pt)
  const rel = abs.slice(1).map((p, i) => [p[0] - abs[i][0], p[1] - abs[i][1]])
  doc.lines(rel, abs[0][0], abs[0][1], [1, 1], style, true)
}

/**
 * Draws the fox centred at (cx, cy); `s` is half its width in mm.
 * 'colour' fills the shapes; 'line' is ink-only line art (print / colour-in).
 */
export function drawFox(doc: jsPDF, cx: number, cy: number, s: number, mode: 'colour' | 'line'): void {
  doc.setLineJoin('round')
  if (mode === 'colour') {
    doc.setFillColor(...FUR)
    polygon(doc, HEAD, cx, cy, s, 'F')
    doc.setFillColor(...CREAM)
    polygon(doc, MUZZLE, cx, cy, s, 'F')
    doc.setFillColor(...FUR_DARK)
    polygon(doc, EAR_L, cx, cy, s, 'F')
    polygon(doc, EAR_R, cx, cy, s, 'F')
  } else {
    doc.setDrawColor(...LINE)
    doc.setLineWidth(s * 0.05)
    polygon(doc, HEAD, cx, cy, s, 'S')
    doc.setLineWidth(s * 0.035)
    polygon(doc, MUZZLE, cx, cy, s, 'S')
    polygon(doc, EAR_L, cx, cy, s, 'S')
    polygon(doc, EAR_R, cx, cy, s, 'S')
  }
  doc.setFillColor(...EYE)
  doc.ellipse(cx - 0.3 * s, cy - 0.1 * s, 0.065 * s, 0.09 * s, 'F')
  doc.ellipse(cx + 0.3 * s, cy - 0.1 * s, 0.065 * s, 0.09 * s, 'F')
  doc.circle(cx, cy + 0.66 * s, 0.085 * s, 'F')
}
