import { useState } from 'react'
import type { KanjiChar } from '@/types'

interface KanjiCardProps {
  kanji: KanjiChar
}

const levelColors: Record<string, string> = {
  N5: 'bg-tertiary/10 text-tertiary',
  N4: 'bg-primary/10 text-primary',
  N3: 'bg-secondary/10 text-secondary',
  N2: 'bg-amber-100 text-amber-700',
  N1: 'bg-rose-100 text-rose-700',
}

// Stroke order hints shown on the back face
const strokeHints: Record<string, string> = {
  '日': 'Box with horizontal midline. Left → top → right → bottom → middle → bottom strokes.',
  '月': 'Curved left stroke, then right hook, then two horizontal lines inside.',
  '火': 'Top dot, then left-down, cross, then two outer strokes.',
  '水': 'Central vertical, then left cross, right cross extending down.',
  '木': 'Vertical, horizontal crossing, then left-down, right-down strokes.',
  '金': 'Top triangle base, horizontal, vertical, two lower sweeps.',
  '土': 'Short top horizontal, long vertical, long bottom horizontal.',
  '山': 'Left pillar, short center top, right pillar rising.',
  '川': 'Three verticals: left curves left, center straight, right curves right.',
  '田': 'Outer box first, then interior cross.',
  '人': 'Left diagonal sweep, then right diagonal inward.',
  '口': 'Left vertical, top horizontal, right vertical, bottom horizontal.',
  '目': 'Outer box, then two inner horizontals.',
  '手': 'Three horizontal lines (top to bottom), then vertical crossing all.',
  '足': 'Top box shape, then two descending strokes.',
  '力': 'Curving sweep down-right, then angled stroke crossing.',
  '大': 'Horizontal, then vertical through center, left-down, right-down.',
  '小': 'Center vertical, left hook, right hook.',
  '中': 'Outer vertical lines, then center vertical piercing.',
  '上': 'Short horizontal base, long horizontal above, center vertical rising.',
  '下': 'Long horizontal top, center vertical descending, short horizontal foot.',
  '一': 'Single horizontal stroke, left to right.',
  '二': 'Two parallel horizontal strokes.',
  '三': 'Three horizontal strokes, shortest on top.',
  '四': 'Outer frame, then two inner verticals.',
  '五': 'Horizontal, left vertical, horizontal middle, curved bottom sweep.',
}

export function KanjiCard({ kanji }: KanjiCardProps) {
  const [flipped, setFlipped] = useState(false)

  const hint = strokeHints[kanji.character] ?? `${kanji.strokes} total strokes. Practice top-to-bottom, left-to-right stroke order.`

  return (
    <div
      className="card-3d-wrap cursor-pointer h-[200px]"
      onClick={() => setFlipped((f) => !f)}
      title={flipped ? 'Click to flip back' : 'Click for stroke hints'}
    >
      <div className={`card-3d-inner ${flipped ? 'flipped' : ''} w-full h-full`}>

        {/* ── Front face ────────────────────────────────── */}
        <div className="card-face bg-white rounded-xl overflow-hidden border border-surface-container-high transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(172,0,30,0.08)] flex flex-col">
          {/* Character */}
          <div className="pt-8 pb-4 flex items-center justify-center relative flex-1">
            <span className="absolute text-7xl font-bold text-on-surface/5 select-none pointer-events-none japanese-text">
              {kanji.character}
            </span>
            <span className="japanese-text text-5xl font-medium text-on-surface transition-colors relative z-10">
              {kanji.character}
            </span>
          </div>

          {/* Meaning */}
          <div className="px-4 pb-3 text-center">
            <p className="font-headline font-bold text-sm text-on-surface leading-tight">
              {kanji.meaning}
            </p>
          </div>

          {/* Readings */}
          <div className="px-3 pb-4 flex flex-col gap-1 text-center">
            <p className="japanese-text text-xs text-on-surface-variant leading-tight">
              <span className="font-label text-[9px] uppercase tracking-widest text-outline mr-1">on</span>
              {kanji.onyomi}
            </p>
            <p className="japanese-text text-xs text-on-surface-variant leading-tight">
              <span className="font-label text-[9px] uppercase tracking-widest text-outline mr-1">kun</span>
              {kanji.kunyomi}
            </p>
          </div>

          {/* Footer bar */}
          <div className="bg-surface-container-high/40 py-1.5 px-3 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
              {kanji.strokes} strokes
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${levelColors[kanji.jlpt] ?? ''}`}>
              {kanji.jlpt}
            </span>
          </div>
        </div>

        {/* ── Back face ─────────────────────────────────── */}
        <div className="card-face card-face-back bg-on-surface rounded-xl overflow-hidden flex flex-col items-center justify-between p-4">
          {/* Large character watermark */}
          <span className="japanese-text text-6xl font-bold text-white/10 select-none absolute">
            {kanji.character}
          </span>

          <div className="relative z-10 w-full flex flex-col items-center gap-3">
            {/* On/kun reading pills */}
            <div className="flex gap-2 flex-wrap justify-center">
              <span className="bg-primary/20 text-primary-fixed-dim text-xs font-bold px-2.5 py-1 rounded-full font-label">
                ON: {kanji.onyomi}
              </span>
              <span className="bg-tertiary/20 text-white/70 text-xs font-bold px-2.5 py-1 rounded-full font-label">
                KUN: {kanji.kunyomi}
              </span>
            </div>

            {/* Stroke hint */}
            <p className="text-white/60 text-[10px] font-body text-center leading-relaxed px-1">
              {hint}
            </p>

            <span className="text-white/25 text-[9px] font-label mt-auto">
              tap to flip back
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
