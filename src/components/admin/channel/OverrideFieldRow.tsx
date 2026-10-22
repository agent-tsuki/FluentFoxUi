import type { ReactNode } from 'react'
import { Chip } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import type { OverridableValue } from '@/types/admin'

/**
 * One overridable channel field: label, where the shown value comes from
 * (CUSTOM = set by an editor, YOUTUBE = synced), the value preview, the edit
 * control (`children`) and "Reset to YouTube" when a custom value exists.
 */
interface OverrideFieldRowProps {
  label: string
  value: OverridableValue
  preview: ReactNode
  canEdit: boolean
  resetting: boolean
  onReset: () => void
  children?: ReactNode
}

export function OverrideFieldRow({ label, value, preview, canEdit, resetting, onReset, children }: OverrideFieldRowProps) {
  const isCustom = value.custom !== null
  return (
    <div className="space-y-3 border-b border-outline-variant/40 py-5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-on-surface">{label}</h3>
          <Chip tone={isCustom ? 'primary' : 'neutral'} icon={isCustom ? 'edit' : 'smart_display'}>
            {isCustom ? 'CUSTOM' : 'YOUTUBE'}
          </Chip>
        </div>
        {canEdit && isCustom && (
          <button
            type="button"
            onClick={onReset}
            disabled={resetting}
            className="-my-2 inline-flex min-h-11 items-center gap-1 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface disabled:opacity-60"
          >
            <Icon name={resetting ? 'progress_activity' : 'replay'} className={resetting ? 'animate-spin text-base' : 'text-base'} />
            Reset to YouTube
          </button>
        )}
      </div>
      <div>{preview}</div>
      {isCustom && value.youtube && (
        <p className="text-xs text-on-surface-variant">
          YouTube value: <span className="break-words">{value.youtube}</span>
        </p>
      )}
      {canEdit && children}
    </div>
  )
}
