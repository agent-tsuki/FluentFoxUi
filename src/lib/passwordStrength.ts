/**
 * Password strength — advice only. The server enforces the real rule
 * (8–128 characters); this just nudges users toward stronger passwords.
 */

export type StrengthLevel = 'weak' | 'fair' | 'strong' | 'very-strong'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export function getPasswordStrength(pw: string): StrengthLevel {
  if (pw.length < PASSWORD_MIN_LENGTH) return 'weak'
  let score = 0
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return 'fair'
  if (score === 2) return 'strong'
  return 'very-strong'
}

export const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; bars: number; color: string }> = {
  weak:          { label: 'Weak',        bars: 1, color: 'bg-error' },
  fair:          { label: 'Fair',        bars: 2, color: 'bg-warning' },
  strong:        { label: 'Strong',      bars: 3, color: 'bg-success/70' },
  'very-strong': { label: 'Very Strong', bars: 4, color: 'bg-success' },
}
