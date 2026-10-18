import { useRef, useState } from 'react'
import type { ProfileAvatar } from '@/types'
import { profileService } from '@/api/services/profileService'
import { resolveErrorMessage } from '@/api/errors'
import { useAuth } from '@/context/AuthContext'
import { asset } from '@/lib/assets'
import { AVATAR_PRESETS } from '@/lib/profile/avatarPresets'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

const ACCEPTED_TYPES = 'image/jpeg,image/png'

interface AvatarPickerProps {
  avatar:   ProfileAvatar
  onChange: (avatar: ProfileAvatar) => void
  onClose:  () => void
}

/**
 * Pick a built-in avatar or upload a photo. Either one is the user's own
 * choice, so it stays even after a later Google or X sign-in.
 */
export function AvatarPicker({ avatar, onChange, onClose }: AvatarPickerProps) {
  const { updateProfileImage } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy]   = useState<string | null>(null)
  const [error, setError] = useState('')

  const apply = (next: ProfileAvatar) => {
    onChange(next)
    updateProfileImage(next.url)
  }

  const run = async (key: string, action: () => Promise<ProfileAvatar>) => {
    setError('')
    setBusy(key)
    try {
      apply(await action())
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const pickPreset = (id: string) =>
    run(id, async () => (await profileService.updateProfile({ avatarPreset: id })).avatar)

  const upload = (file: File | undefined) => {
    if (file) void run('upload', () => profileService.uploadAvatar(file))
  }

  const isOwnChoice = avatar.kind === 'upload' || avatar.kind === 'preset'

  return (
    <section aria-label="Change profile photo" className="bg-surface-container-low rounded-xl p-6 sm:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-on-surface font-headline">Profile photo</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pick an avatar or upload your own. If you sign in with Google or X and haven&apos;t chosen one, we use that picture.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant">
          <Icon name="close" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 sm:gap-4">
        {AVATAR_PRESETS.map(preset => {
          const selected = avatar.kind === 'preset' && avatar.presetId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              disabled={busy !== null}
              onClick={() => pickPreset(preset.id)}
              aria-label={`Use avatar ${preset.id}`}
              aria-pressed={selected}
              className={`relative aspect-square rounded-full overflow-hidden border-4 transition-all disabled:opacity-60 ${
                selected ? 'border-primary' : 'border-transparent hover:border-primary/40'
              }`}
            >
              <img src={asset(preset.path)} alt="" className="w-full h-full object-cover" />
              {busy === preset.id && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Icon name="progress_activity" className="text-white animate-spin" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={e => {
            upload(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <Button
          variant="outline"
          className="text-sm px-4 py-2 flex items-center gap-2"
          disabled={busy !== null}
          onClick={() => fileInput.current?.click()}
        >
          <Icon name={busy === 'upload' ? 'progress_activity' : 'photo_camera'} className={`text-base ${busy === 'upload' ? 'animate-spin' : ''}`} />
          {busy === 'upload' ? 'Uploading…' : 'Upload a photo'}
        </Button>
        {isOwnChoice && (
          <Button
            variant="ghost"
            className="text-sm px-4 py-2"
            disabled={busy !== null}
            onClick={() => run('remove', profileService.removeAvatar)}
          >
            Remove my choice
          </Button>
        )}
        <span className="text-xs text-on-surface-variant">JPEG or PNG, at least 128 × 128 px.</span>
      </div>

      {error && <p role="alert" className="text-error text-xs font-medium">{error}</p>}
    </section>
  )
}
