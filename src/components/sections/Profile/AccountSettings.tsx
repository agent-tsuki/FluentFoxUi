import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { useUI, type BackgroundAnimation } from '@/context/UIContext'

const BG_OPTIONS: { value: BackgroundAnimation; emoji: string; label: string; desc: string }[] = [
  { value: 'petals', emoji: '🌸', label: 'Sakura Petals', desc: 'Falling cherry blossom petals' },
  { value: 'fish',   emoji: '🐠', label: 'Koi Fish',      desc: 'Swimming koi fish animation' },
  { value: 'none',   emoji: '✕',  label: 'None',          desc: 'No background animation' },
]

export function AccountSettings() {
  const { mouseFollowerEnabled, toggleMouseFollower, backgroundAnimation, setBackgroundAnimation } = useUI()
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [studyReminder, setStudyReminder] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface font-headline">Appearance</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Customize how FluentFox looks for you
          </p>
        </div>
        <div className="px-8 py-6 flex flex-col gap-6">
          <Toggle
            icon="mouse"
            label="Cursor Trail"
            description="A subtle dot and ring that follow your cursor"
            checked={mouseFollowerEnabled}
            onChange={toggleMouseFollower}
          />

          {/* Background animation selector */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0 mt-0.5">
              <Icon name="animation" className="text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface font-body">Background Animation</p>
              <p className="text-xs text-on-surface-variant font-body mb-3">Choose the animated background across all pages</p>
              <div className="flex gap-3">
                {BG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBackgroundAnimation(opt.value)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-[1.5px] transition-all text-center"
                    style={backgroundAnimation === opt.value
                      ? { borderColor: '#EA6B44', background: 'rgba(234,107,68,0.08)' }
                      : { borderColor: 'rgb(var(--outline-variant) / 0.4)', background: 'transparent' }
                    }
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-[11px] font-bold font-label text-on-surface">{opt.label}</span>
                    <span className="text-[10px] text-on-surface-variant font-body leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface font-headline">Notifications</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Control what FluentFox sends you
          </p>
        </div>
        <div className="px-8 py-6 space-y-5">
          <Toggle
            icon="mail"
            label="Email Digest"
            description="Weekly summary of your progress"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            icon="alarm"
            label="Daily Study Reminder"
            description="A gentle nudge to keep your streak alive"
            checked={studyReminder}
            onChange={setStudyReminder}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden border border-error/20">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-error font-headline">Danger Zone</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Irreversible actions — proceed with caution
          </p>
        </div>
        <div className="px-8 py-6">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-on-surface font-body">Delete Account</p>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  Permanently remove your account and all study data
                </p>
              </div>
              <Button
                variant="outline"
                className="text-error border-error/30 hover:bg-error/5 text-sm px-4 py-2 flex items-center gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Icon name="delete_forever" className="text-base" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-on-surface font-body">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="text-sm px-4 py-2"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <button
                  className="px-5 py-2 bg-error text-on-error rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Yes, delete my account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

interface ToggleProps {
  icon: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ icon, label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
          <Icon name={icon} className="text-xl" />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface font-body">{label}</p>
          <p className="text-xs text-on-surface-variant font-body">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-surface-container-highest'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
