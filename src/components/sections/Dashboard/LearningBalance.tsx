import type { SkillBalance } from '@/types'
import { Eyebrow } from '@/components/ui/SectionHeader'

interface LearningBalanceProps {
  balance: SkillBalance
}

const CENTER = 100
const MAX_R = 60
const LABEL_R = 76
const GRID_RINGS = [0.25, 0.5, 0.75, 1.0]

// The skills the app asks today; grammar, vocabulary and speaking have no
// questions yet, so they are left off instead of showing as 0 %.
const SKILL_KEYS = [
  { key: 'kanaReading',  label: 'Kana reading' },
  { key: 'kanjiMeaning', label: 'Kanji meaning' },
  { key: 'kanjiReading', label: 'Kanji reading' },
  { key: 'listening',    label: 'Listening' },
] as const satisfies readonly { key: keyof SkillBalance; label: string }[]

const FULL_TURN = 360
const SKILLS = SKILL_KEYS.map((s, i) => ({ ...s, angle: (FULL_TURN / SKILL_KEYS.length) * i }))

function pt(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function ringPoints(r: number): string {
  return SKILLS.map(({ angle }) => {
    const p = pt(angle, r)
    return `${p.x},${p.y}`
  }).join(' ')
}

// Labels on the right start at the point, on the left end there; top and bottom centre.
function getTextAnchor(angle: number): 'middle' | 'start' | 'end' {
  const a = angle % FULL_TURN
  if (a === 0 || a === FULL_TURN / 2) return 'middle'
  return a < FULL_TURN / 2 ? 'start' : 'end'
}

function getDominantBaseline(angle: number): 'auto' | 'hanging' | 'middle' {
  if (angle === 0) return 'auto'
  if (angle === FULL_TURN / 2) return 'hanging'
  return 'middle'
}

export function LearningBalance({ balance }: LearningBalanceProps) {
  const dataPoints = SKILLS.map(({ key, angle }) => {
    const val = Math.min(Math.max(balance[key], 0), 100) / 100
    return pt(angle, val * MAX_R)
  })
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
      <div className="space-y-1">
        <Eyebrow variant="plain">Skill Radar</Eyebrow>
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface font-headline">
          Learning Balance
        </h2>
        <p className="text-xs text-on-surface-variant font-body">Share of answers right per skill</p>
      </div>

      <div className="flex justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-xs">
          {/* Grid rings */}
          {GRID_RINGS.map((frac) => (
            <polygon
              key={frac}
              points={ringPoints(frac * MAX_R)}
              className="stroke-outline-variant"
              fill="none"
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
                className="stroke-outline-variant"
                strokeWidth={0.5}
                opacity={0.5}
              />
            )
          })}

          {/* Data polygon */}
          <polygon
            points={dataPolygon}
            className="fill-primary/15 stroke-primary"
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
              className="fill-primary"
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
                className="fill-on-surface-variant"
                fontSize={11}
                fontWeight={700}
                fontFamily="inherit"
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {SKILLS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-label font-semibold text-on-surface truncate">{label}</p>
              <p className="text-xs text-on-surface-variant font-body">{Math.round(balance[key])}% right</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
