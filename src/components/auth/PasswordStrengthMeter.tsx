import { getPasswordStrength, STRENGTH_CONFIG } from '@/lib/passwordStrength'

/** Four-bar strength hint shown under a new-password field. Renders nothing when empty. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const meta = STRENGTH_CONFIG[getPasswordStrength(password)]

  return (
    <div className="mt-2 space-y-1 px-1" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map(bar => (
          <div
            key={bar}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              bar <= meta.bars ? meta.color : 'bg-surface-container-highest'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-on-surface-variant font-medium">
        Strength: <span className="font-bold">{meta.label}</span>
      </p>
    </div>
  )
}
