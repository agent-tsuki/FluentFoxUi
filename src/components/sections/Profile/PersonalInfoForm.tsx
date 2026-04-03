import { useState } from 'react'
import type { JlptLevel, ProfileUpdatePayload, UserProfile } from '@/types'
import { profileService } from '@/api/services/profileService'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface PersonalInfoFormProps {
  profile: UserProfile
  onSaved: (updated: ProfileUpdatePayload) => void
}

const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese',
  'Italian', 'Chinese', 'Korean', 'Hindi', 'Arabic', 'Other',
]

export function PersonalInfoForm({ profile, onSaved }: PersonalInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ProfileUpdatePayload>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    location: profile.location,
    bio: profile.bio,
    nativeLanguage: profile.nativeLanguage,
    targetLevel: profile.targetLevel,
  })

  // Snapshot to restore on cancel
  const [snapshot, setSnapshot] = useState<ProfileUpdatePayload>(form)

  function handleEdit() {
    setSnapshot(form)
    setIsEditing(true)
  }

  function handleCancel() {
    setForm(snapshot)
    setIsEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    await profileService.updateProfile(form)
    setSaving(false)
    setIsEditing(false)
    onSaved(form)
  }

  function set<K extends keyof ProfileUpdatePayload>(key: K, value: ProfileUpdatePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant">
        <div>
          <h2 className="text-lg font-bold text-on-surface font-headline">Personal Information</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Update your name, bio, and learning preferences
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" className="flex items-center gap-2 text-sm px-4 py-2" onClick={handleEdit}>
            <Icon name="edit" className="text-base" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm px-4 py-2" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex items-center gap-2 text-sm px-5 py-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Icon name="progress_activity" className="text-base animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Icon name="check" className="text-base" />
                  Save
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="px-8 py-8 space-y-8">
        {/* Name row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="First Name">
            {isEditing ? (
              <input
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className={inputCls}
              />
            ) : (
              <Value>{form.firstName}</Value>
            )}
          </Field>
          <Field label="Last Name">
            {isEditing ? (
              <input
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className={inputCls}
              />
            ) : (
              <Value>{form.lastName}</Value>
            )}
          </Field>
        </div>

        {/* Email + Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Email Address">
            {isEditing ? (
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={inputCls}
              />
            ) : (
              <Value>{form.email}</Value>
            )}
          </Field>
          <Field label="Location">
            {isEditing ? (
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="City, Country"
                className={inputCls}
              />
            ) : (
              <Value>{form.location || '—'}</Value>
            )}
          </Field>
        </div>

        {/* Bio */}
        <Field label="Bio">
          {isEditing ? (
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              placeholder="Tell the community a little about yourself…"
              className={`${inputCls} resize-none`}
            />
          ) : (
            <Value>{form.bio || '—'}</Value>
          )}
        </Field>

        {/* Native language + Target level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Native Language">
            {isEditing ? (
              <div className="relative">
                <select
                  value={form.nativeLanguage}
                  onChange={(e) => set('nativeLanguage', e.target.value)}
                  className={selectCls}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
                  <Icon name="expand_more" />
                </div>
              </div>
            ) : (
              <Value>{form.nativeLanguage}</Value>
            )}
          </Field>
          <Field label="Target JLPT Level">
            {isEditing ? (
              <div className="flex gap-2 flex-wrap">
                {JLPT_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => set('targetLevel', lvl)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all font-label ${
                      form.targetLevel === lvl
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            ) : (
              <Value>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  <Icon name="stars" className="text-base" filled />
                  JLPT {form.targetLevel}
                </span>
              </Value>
            )}
          </Field>
        </div>
      </div>
    </div>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block">
        {label}
      </label>
      {children}
    </div>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-medium text-on-surface font-body py-1">{children}</p>
}

const inputCls =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-base text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body placeholder:text-on-surface-variant/50'

const selectCls =
  'w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-base text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer font-body'
