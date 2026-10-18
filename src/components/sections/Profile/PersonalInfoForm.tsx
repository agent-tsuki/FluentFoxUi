import { useMemo, useState } from 'react'
import type { JlptLevel, ProfileUpdatePayload, UserProfile } from '@/types'
import { profileService } from '@/api/services/profileService'
import { resolveErrorMessage } from '@/api/errors'
import { countryName, countryOptions } from '@/lib/profile/countries'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

interface PersonalInfoFormProps {
  profile: UserProfile
  onSaved: (updated: UserProfile) => void
}

const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Portuguese',
  'Italian', 'Chinese', 'Korean', 'Hindi', 'Arabic', 'Other',
]

/** The editable fields, as the form holds them. */
interface FormValues {
  firstName:      string
  lastName:       string
  bio:            string
  nativeLanguage: string
  countryCode:    string
  city:           string
  targetLevel:    JlptLevel | ''
  timeZone:       string
}

function valuesFrom(profile: UserProfile): FormValues {
  return {
    firstName:      profile.firstName,
    lastName:       profile.lastName,
    bio:            profile.bio,
    nativeLanguage: profile.nativeLanguage,
    countryCode:    profile.countryCode,
    city:           profile.city,
    targetLevel:    profile.targetLevel ?? '',
    timeZone:       profile.timeZone,
  }
}

/** Only changed fields are sent, so a save never overwrites what it didn't touch. */
function changes(before: FormValues, after: FormValues): ProfileUpdatePayload {
  const patch: ProfileUpdatePayload = {}
  for (const key of Object.keys(after) as (keyof FormValues)[]) {
    if (after[key] !== before[key]) Object.assign(patch, { [key]: after[key] })
  }
  return patch
}

function timeZones(current: string): string[] {
  // Not in this project's TS lib yet; every current browser has it.
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: 'timeZone') => string[] }
  let zones: string[] = []
  try {
    zones = intl.supportedValuesOf?.('timeZone') ?? []
  } catch { /* very old browser: offer only the current zone */ }
  return current && !zones.includes(current) ? [current, ...zones] : zones
}

export function PersonalInfoForm({ profile, onSaved }: PersonalInfoFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [form, setForm]           = useState<FormValues>(() => valuesFrom(profile))

  const zones = useMemo(() => timeZones(form.timeZone), [form.timeZone])
  const languages = LANGUAGES.includes(form.nativeLanguage) ? LANGUAGES : [form.nativeLanguage, ...LANGUAGES]

  function handleCancel() {
    setForm(valuesFrom(profile))
    setError('')
    setIsEditing(false)
  }

  async function handleSave() {
    const patch = changes(valuesFrom(profile), form)
    if (Object.keys(patch).length === 0) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    setError('')
    try {
      const saved = await profileService.updateProfile(patch)
      setForm(valuesFrom(saved))
      onSaved(saved)
      setIsEditing(false)
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant">
        <div>
          <h2 className="text-lg font-bold text-on-surface font-headline">Personal Information</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Update your name, location, and learning goal
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" className="flex items-center gap-2 text-sm px-4 py-2" onClick={() => setIsEditing(true)}>
            <Icon name="edit" className="text-base" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm px-4 py-2" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" className="flex items-center gap-2 text-sm px-5 py-2" onClick={handleSave} disabled={saving}>
              <Icon name={saving ? 'progress_activity' : 'check'} className={`text-base ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <div className="px-8 py-8 space-y-8">
        {error && <p role="alert" className="text-error text-sm font-medium">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="First Name">
            {isEditing
              ? <input value={form.firstName} maxLength={50} onChange={e => set('firstName', e.target.value)} className={inputCls} />
              : <Value>{form.firstName}</Value>}
          </Field>
          <Field label="Last Name">
            {isEditing
              ? <input value={form.lastName} maxLength={50} onChange={e => set('lastName', e.target.value)} className={inputCls} />
              : <Value>{form.lastName || '—'}</Value>}
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Username" hint="Can't be changed">
            <Value>@{profile.username}</Value>
          </Field>
          <Field label="Email Address">
            <Value>{profile.email}</Value>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Country">
            {isEditing ? (
              <Select value={form.countryCode} onChange={value => set('countryCode', value)}>
                <option value="">Not set</option>
                {countryOptions().map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </Select>
            ) : (
              <Value>{countryName(form.countryCode) || '—'}</Value>
            )}
          </Field>
          <Field label="City">
            {isEditing
              ? <input value={form.city} maxLength={100} onChange={e => set('city', e.target.value)} placeholder="e.g. Osaka" className={inputCls} />
              : <Value>{form.city || '—'}</Value>}
          </Field>
        </div>

        <Field label="Bio">
          {isEditing ? (
            <textarea
              value={form.bio}
              maxLength={300}
              onChange={e => set('bio', e.target.value)}
              rows={3}
              placeholder="Tell the community a little about yourself…"
              className={`${inputCls} resize-none`}
            />
          ) : (
            <Value>{form.bio || '—'}</Value>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Native Language">
            {isEditing ? (
              <Select value={form.nativeLanguage} onChange={value => set('nativeLanguage', value)}>
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </Select>
            ) : (
              <Value>{form.nativeLanguage}</Value>
            )}
          </Field>
          <Field label="Time Zone">
            {isEditing ? (
              <Select value={form.timeZone} onChange={value => set('timeZone', value)}>
                <option value="">Not set</option>
                {zones.map(zone => <option key={zone} value={zone}>{zone.replace(/_/g, ' ')}</option>)}
              </Select>
            ) : (
              <Value>{form.timeZone ? form.timeZone.replace(/_/g, ' ') : '—'}</Value>
            )}
          </Field>
        </div>

        <Field label="Target JLPT Level">
          {isEditing ? (
            <div className="flex gap-2 flex-wrap">
              {JLPT_LEVELS.map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  aria-pressed={form.targetLevel === lvl}
                  onClick={() => set('targetLevel', form.targetLevel === lvl ? '' : lvl)}
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
          ) : form.targetLevel ? (
            <Value>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                <Icon name="stars" className="text-base" filled />
                JLPT {form.targetLevel}
              </span>
            </Value>
          ) : (
            <Value>Not set</Value>
          )}
        </Field>
      </div>
    </div>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal font-medium text-on-surface-variant/70">{hint}</span>}
      </span>
      {children}
    </div>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-medium text-on-surface font-body py-1 break-words">{children}</p>
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
        <Icon name="expand_more" />
      </div>
    </div>
  )
}

const inputCls =
  'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-base text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body placeholder:text-on-surface-variant/50'

const selectCls =
  'w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-base text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer font-body'
