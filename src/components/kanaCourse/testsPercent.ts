/** A 0–1 score as course copy writes it: "80 %" (no-break space, so it never wraps). */
export function formatPercent(score: number): string {
  return `${Math.round(score * 100)} %`
}
