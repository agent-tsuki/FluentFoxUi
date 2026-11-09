import { memo } from 'react'

/** A theme colour from the --scene-* tokens (index.css): dawn in light mode, moonlit in dark. */
const c = (name: string, alpha = 1) => `rgb(var(--scene-${name}) / ${alpha})`

/** Blossom clusters on the branches: [x, y, radius]. */
const BLOSSOMS_RIGHT: [number, number, number][] = [
  [1300, 40, 30],
  [1350, 70, 34],
  [1395, 30, 28],
  [1250, 80, 22],
  [1420, 95, 30],
  [1330, 115, 24],
  [1205, 52, 18],
  [1385, 145, 22],
  [1440, 150, 26],
  [1280, 130, 16],
  [1160, 30, 14],
]
const BLOSSOMS_LEFT: [number, number, number][] = [
  [40, 30, 26],
  [95, 15, 20],
  [10, 80, 22],
  [130, 50, 14],
]

/** A five-petal cherry blossom of radius r centred on (x, y). */
function Blossom({ x, y, r, deep }: { x: number; y: number; r: number; deep: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="0"
          cy={-r * 0.55}
          rx={r * 0.42}
          ry={r * 0.55}
          transform={`rotate(${a})`}
          fill={c(deep ? 'blossom-deep' : 'blossom', 0.92)}
        />
      ))}
      <circle r={r * 0.18} fill={c('wood', 0.6)} />
    </g>
  )
}

/** Falling petals: [x, y, rotation]. */
const PETALS: [number, number, number][] = [
  [1120, 150, 20],
  [1190, 210, 70],
  [1060, 250, 130],
  [1270, 230, 40],
  [980, 190, 160],
  [1360, 260, 95],
  [860, 140, 60],
  [1220, 300, 10],
  [190, 120, 45],
  [260, 190, 120],
]

/**
 * The practice tests header illustration: Mt Fuji over a lake at dawn (a
 * moonlit night in dark mode), a pagoda on the shore and cherry blossom at
 * the edges. Pure SVG coloured by theme tokens, so it costs no download and
 * follows the theme. Decorative: hidden from assistive tech.
 */
export const TestHeroScene = memo(function TestHeroScene({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      className={className}
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="th-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c('sky-top')} />
          <stop offset="1" stopColor={c('sky-bottom')} />
        </linearGradient>
        <radialGradient id="th-glow">
          <stop offset="0" stopColor={c('sun', 0.9)} />
          <stop offset="0.45" stopColor={c('sun', 0.35)} />
          <stop offset="1" stopColor={c('sun', 0)} />
        </radialGradient>
        <linearGradient id="th-fuji" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c('mountain')} />
          <stop offset="1" stopColor={c('far')} />
        </linearGradient>
        <linearGradient id="th-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c('sky-bottom')} />
          <stop offset="1" stopColor={c('water')} />
        </linearGradient>
      </defs>

      <rect width="1440" height="420" fill="url(#th-sky)" />
      {/* Sun (moon at night) */}
      <circle cx="1040" cy="120" r="150" fill="url(#th-glow)" />
      <circle cx="1040" cy="120" r="42" fill={c('sun')} />

      {/* Far ridge */}
      <path d="M0 300 C140 270 260 285 380 268 S640 250 760 270 S1060 262 1200 255 S1380 262 1440 250 V340 H0Z" fill={c('far', 0.8)} />

      {/* Fuji with its snow cap */}
      <path d="M520 336 C640 300 760 210 850 118 Q880 92 908 96 Q930 92 958 120 C1050 212 1170 300 1300 336Z" fill="url(#th-fuji)" />
      <path
        d="M850 118 Q880 92 908 96 Q930 92 958 120 C978 140 996 158 1012 176 L990 170 L972 186 L950 168 L930 190 L910 170 L888 192 L868 172 L846 186 L826 170 L806 178 C822 158 836 136 850 118Z"
        fill={c('snow')}
      />

      {/* Near hills with a tree line */}
      <path d="M0 330 C90 312 170 318 250 306 C300 298 330 312 380 316 C460 322 520 328 600 334 L600 350 H0Z" fill={c('hill')} />
      <path d="M1080 338 C1160 318 1240 310 1310 300 C1360 294 1400 300 1440 296 V350 H1080Z" fill={c('hill')} />
      {Array.from({ length: 14 }, (_, i) => (
        <ellipse key={i} cx={20 + i * 40} cy={318 - (i % 3) * 4 + (i > 8 ? 8 : 0)} rx="22" ry="14" fill={c('hill')} />
      ))}

      {/* Pagoda on the shore */}
      <g fill={c('wood', 0.85)}>
        <rect x="1352" y="230" width="8" height="80" />
        <path d="M1316 240 Q1356 222 1396 240 L1388 246 Q1356 234 1324 246Z" />
        <rect x="1334" y="246" width="44" height="16" />
        <path d="M1306 266 Q1356 244 1406 266 L1396 273 Q1356 258 1316 273Z" />
        <rect x="1328" y="273" width="56" height="18" />
        <path d="M1296 296 Q1356 270 1416 296 L1404 304 Q1356 288 1308 304Z" />
        <rect x="1320" y="304" width="72" height="30" />
      </g>

      {/* Lake, with Fuji's reflection */}
      <rect y="336" width="1440" height="84" fill="url(#th-water)" />
      <path d="M560 336 C680 352 790 380 870 404 L910 410 L950 404 C1030 380 1140 352 1260 336Z" fill={c('mountain', 0.18)} />
      {[
        [300, 360, 140],
        [700, 372, 90],
        [1000, 388, 160],
        [1180, 362, 80],
        [120, 396, 110],
      ].map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height="2" rx="1" fill={c('snow', 0.45)} />
      ))}

      {/* Cherry branches at the corners */}
      <path
        d="M1440 10 C1380 40 1320 60 1240 64 M1350 54 C1330 90 1340 120 1330 140 M1440 120 C1410 118 1380 110 1360 100"
        stroke={c('wood', 0.55)}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {BLOSSOMS_RIGHT.map(([x, y, r], i) => (
        <Blossom key={i} x={x} y={y} r={r} deep={i % 3 === 0} />
      ))}
      <path d="M0 50 C40 40 80 30 140 46" stroke={c('wood', 0.5)} strokeWidth="5" strokeLinecap="round" fill="none" />
      {BLOSSOMS_LEFT.map(([x, y, r], i) => (
        <Blossom key={i} x={x} y={y} r={r} deep={i % 2 === 1} />
      ))}
      {PETALS.map(([x, y, rot], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="3.5" transform={`rotate(${rot} ${x} ${y})`} fill={c('blossom-deep', 0.8)} />
      ))}
    </svg>
  )
})
