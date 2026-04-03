import type { SkillBalance } from '@/types'

interface LearningBalanceProps {
  balance: SkillBalance
}

const CENTER = 100
const MAX_R = 60
const LABEL_R = 76
const GRID_RINGS = [0.25, 0.5, 0.75, 1.0]

const SKILLS = [
  { key: 'kanji',      label: 'Kanji',      angle: 0   },
  { key: 'grammar',   label: 'Grammar',    angle: 60  },
  { key: 'listening', label: 'Listening',  angle: 120 },
  { key: 'vocabulary',label: 'Vocabulary', angle: 180 },
  { key: 'reading',   label: 'Reading',    angle: 240 },
  { key: 'speaking',  label: 'Speaking',   angle: 300 },
] as const

function pt(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function hexPoints(r: number): string {
  return SKILLS.map(({ angle }) => {
    const p = pt(angle, r)
    return `${p.x},${p.y}`
  }).join(' ')
}

function getTextAnchor(angle: number): 'middle' | 'start' | 'end' {
  if (angle === 0 || angle === 180) return 'middle'
  if (angle === 60 || angle === 120) return 'start'
  return 'end'
}

function getDominantBaseline(angle: number): 'auto' | 'hanging' | 'middle' {
  if (angle === 0) return 'auto'
  if (angle === 180) return 'hanging'
  return 'middle'
}

export function LearningBalance({ balance }: LearningBalanceProps) {
  const dataPoints = SKILLS.map(({ key, angle }) => {
    const val = balance[key] / 100
    return pt(angle, val * MAX_R)
  })
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-label block">
          Skill Radar
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Learning Balance
        </h2>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-xs">
          {/* Grid rings */}
          {GRID_RINGS.map((frac) => (
            <polygon
              key={frac}
              points={hexPoints(frac * MAX_R)}
              fill="none"
              stroke="#E7BCBA"
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}

          {/* Axis lines */}
          {SKILLS.map(({ key, angle }) => {
            const outer = pt(angle, MAX_R)
            return (
              <line
                key={key}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="#E7BCBA"
                strokeWidth={0.5}
                opacity={0.5}
              />
            )
          })}

          {/* Data polygon */}
          <polygon
            points={dataPolygon}
            fill="rgba(234,107,68,0.15)"
            stroke="#EA6B44"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* Data dots */}
          {dataPoints.map((p, i) => (
            <circle
              key={SKILLS[i].key}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill="#EA6B44"
            />
          ))}

          {/* Labels */}
          {SKILLS.map(({ key, label, angle }) => {
            const lp = pt(angle, LABEL_R)
            return (
              <text
                key={key}
                x={lp.x}
                y={lp.y}
                textAnchor={getTextAnchor(angle)}
                dominantBaseline={getDominantBaseline(angle)}
                fontSize={7}
                fontWeight={700}
                fill="#926e6c"
                fontFamily="inherit"
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2">
        {SKILLS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-label font-semibold text-on-surface truncate">{label}</p>
              <p className="text-xs text-on-surface-variant font-body">{balance[key]}%</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
