/**
 * Axis helpers shared by the dashboard charts. Pure.
 */

const NICE_STEPS = [1, 2, 2.5, 5, 10] as const
const BASE = 10

/** The smallest "nice" number (1, 2, 2.5, 5 × 10ⁿ) at or above `max`; 1 for an empty chart. */
export function niceMax(max: number): number {
  if (!(max > 0)) return 1
  const magnitude = BASE ** Math.floor(Math.log10(max))
  const step = NICE_STEPS.find((s) => s * magnitude >= max) ?? BASE
  return step * magnitude
}

/** Gridline values: 0, half and the top. */
export function gridTicks(top: number): number[] {
  const HALF = 2
  return [0, top / HALF, top]
}

/** Compact axis numbers: 950, 1.2k, 12k. */
export function formatAxisNumber(n: number): string {
  const THOUSAND = 1000
  if (n < THOUSAND) return Number.isInteger(n) ? String(n) : n.toFixed(1)
  const k = n / THOUSAND
  return `${k >= BASE ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`
}

/** Which x labels to print so they never collide: every nth, always the last. */
export function tickEvery(count: number, maxTicks: number): number {
  return Math.max(1, Math.ceil(count / maxTicks))
}
